import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";

const router = express.Router();

// /api/my-bookings
router.get("/", verifyToken, async (req: Request, res: Response)=> {
  try {
    const hotels = await Hotel.find({
      // Hotel里有元素bookings, 这个数组里的booking object值有userId,
      bookings: { $elemMatch: { userId: req.userId } },
    });

    const results = hotels.map((hotel)=>{
      const userBookings = hotel.bookings.filter(
        (booking)=> booking.userId === req.userId
      )
      const hotelWithUserBookings: HotelType = {
        ...hotel.toObject(), // the mongoose hotel => javascript object
        bookings: userBookings,
      };

      return hotelWithUserBookings;
    });

    res.status(200).send(results);
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
})

export default router;
