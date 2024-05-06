import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
import Stripe from "stripe";
import verifyToken from "../middleware/auth";

// initialize a new stripe connection
const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

const router = express.Router();

// /api/hotels/search?
router.get("/search", async (req: Request, res: Response)=> {
  try {

    const query = constructSearchQuery(req.query);
    let sortOptions = {};
    switch(req.query.sortOption) {
      case "starRating" :
        // 倒序
        sortOptions = { starRating: -1};
        break;
      case "pricePerNightAsc" :
        // 升序
        sortOptions = { pricePerNight: 1};
        break;
      case "pricePerNightDesc" :
        // 降序
        sortOptions = { pricePerNight: -1};
        break;
    }

    // 分页，query里是否传参page
    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    // 跳过前多少条数据。
    const skip = (pageNumber - 1) * pageSize;
    
    // query过滤出结果，sort排序，然后分页
    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip) // 跳过前多少条
      .limit(pageSize); // 取出5条
    
    // 虽然就返回几条数据详情，但是还是返回了total数量。
    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber, // 第几页
        pages: Math.ceil(total / pageSize), // 一共多少页，向上取整
      }
    }
    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({message: "Something went wrong"});
  }
});

// 按更新时间来获取hotels
router.get("/", async (req: Request, res: Response)=> {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
})

// 把这个路由放到前面，会报错，search is not a id
router.get("/:id", 
  [param("id").notEmpty().withMessage("Hotel ID is required")], 
  async (req: Request, res: Response)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array() });
    }
    const id = req.params.id.toString();
    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({message: "Error fetching hotel"});
    }
})

// /api/hotels//:hotelId/bookings/payment-intent
router.post(
  "/:hotelId/bookings/payment-intent", 
  verifyToken, 
  async (req: Request, res: Response) => {
    // 1. totalCost
    // 2. hotelId
    // 3. userId
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;
    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(400).json({ message: "Hotel not found" });
    }
    // 实时的价格，并且不会被前端伪造
    const totalCost = hotel.pricePerNight * numberOfNights;
    // 向stripe发请求
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100,
      currency: "aud", // 货币单位
      metadata: {
        hotelId, 
        userId: req.userId
      }
    });
    if(!paymentIntent.client_secret) {
      return res.status(500).json({ message: "Error creating payment intent"})
    }

    const response = {
      // this is used to initialize some stripe elements on the frontend
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret.toString(),
      totalCost,
    };
    res.send(response);
});

// 创建booking
router.post(
  "/:hotelId/bookings", 
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      // 从stripe取回paymentIntent信息。
      const paymentIntentId = req.body.paymentIntentId;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId as string);
      if (!paymentIntent) {
        return res.status(400).json({ message: "payment intent not found" });
      }
      // 我们要创建的booking信息和paymentIntent存储的是否一致
      if (paymentIntent.metadata.hotelId !== req.params.hotelId
        || paymentIntent.metadata.userId !== req.userId) {
        return res.status(400).json({ message: "payment intent mismatch" });
      }
      // 判断是否支付成功
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: `payment intent not succeeded. Status: ${paymentIntent.status}` });
      }

      const newBooking: BookingType = {
        ...req.body, 
        userId: req.userId, 
      };
      // 找到hotel并且更新bookings array信息
      const hotel = await Hotel.findOneAndUpdate(
        {_id: req.params.hotelId }, 
        {
          $push: { bookings: newBooking },
        }
      );

      if (!hotel) {
        return res.status(400).json({ message: "hotel not found" });
      }

      await hotel.save();
      res.status(200).send();

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
    }
  }
)

const constructSearchQuery = (queryParams: any) => {
  // 接收所有要搜索和过滤的要素。
  let constructedQuery: any = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      // 忽略大小写匹配city和country
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      // 匹配数量大于queryParams.adultCount的值
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      // $all, mongoose filter, 找到所有hotels, 同时满足facilities的条件。
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      // $in, mongoose filter, 找到所有hotels, 只要满足types中其中一个的条件即可。
      // 每个hotel只有一个type, 所有在types里的hotels都会加入进来。
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      // 找出价格都小于queryParams.maxPrice的酒店
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  return constructedQuery;
};

export default router;