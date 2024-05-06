import express, {Request, Response} from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";

// my-hotels: create and update and view users their own hotels. 

const router = express.Router();

// 安装multer这个包和对应的typescript包。
// 告诉multer, we want to store any files or any images that we get from the post request in memory. 
const storage = multer.memoryStorage();

// 这是一个middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})
// api/my-hotels
router.post(
  "/", 
  verifyToken,
  // make sure that the request form data has all the fields that we require in order to create a new hotel type. 
  // so we use express-validator
  [
    body("name").notEmpty().withMessage('Name is required'),
    body("city").notEmpty().withMessage('City is required'),
    body("country").notEmpty().withMessage('Country is required'),
    body("decription").notEmpty().withMessage('Description is required'),
    body("type").notEmpty().withMessage('Hotel type is required'),
    body("pricePerNight").notEmpty().isNumeric().withMessage('Price per night is required and must be a number'),
    body("facilities").notEmpty().isArray().withMessage('Facilities are required'),
  ],
  // define the name of the form value field which is going to hold these images. 
  // 这个表单值字段叫做imageFiles, 并且是array, 最多6个images, 
  upload.array("imageFiles", 6), 
  async (req: Request, res: Response) => {
    // 因为我们要存图片，就不能用json了，要用multi-part form object. 
    try {
      const imageFiles = req.files as Express.Multer.File[];
      const newHotel: HotelType = req.body;
      const imageUrls = await uploadImages(imageFiles);
      newHotel.imageUrls = imageUrls;
      newHotel.lastUpdated = new Date();
      newHotel.userId = req.userId;

      // 3. save the new hotel in our database
      const hotel = new Hotel(newHotel);
      await hotel.save();

      // 4. return a 201 status
      res.status(201).send(hotel);
    } catch (error) {
      console.log("Error creating hotel:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.get("/", verifyToken, async (req: Request, res: Response)=> {
  try {
    const hotels = await Hotel.find({userId: req.userId});
    res.json(hotels);
  } catch (error) {
    res.status(500).json({message: "Error fetching hotels"});
  }
})

// /api/my-hotels/9839489
router.get("/:id", verifyToken, async (req: Request, res: Response)=> {
  const id = req.params.id.toString();
  try {
    const hotel = await Hotel.findOne({
      _id: id,
      userId: req.userId,
    });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({message: "Error fetching hotels"});
  }
})

router.put("/:hotelId", verifyToken, upload.array("imageFiles"), async (req: Request, res: Response)=> {
  try {
    const updatedHotel: HotelType = req.body;
    updatedHotel.lastUpdated = new Date();
    const hotel = await Hotel.findOneAndUpdate({
      // it is going to find a hotel
      _id: req.params.hotelId,
      userId: req.userId,
    }, 
    // update data 
    updatedHotel, 
    // the hotel varibal is going to have the most updated properties in it
    { new: true});

    if(!hotel) {
      return res.status(404).json({message: "Hotel not found"});
    }

    const files = req.files as Express.Multer.File[];
    const updatedImageUrls = await uploadImages(files);
    hotel.imageUrls = [
      ...updatedImageUrls,
      ...(updatedHotel.imageUrls || [])
    ];
    await hotel.save();
    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({message: "Somthing went wrong"});
  }
})

async function uploadImages(imageFiles: Express.Multer.File[]) {
  // 1. upload the images to cloudinary
  // 我们有an array of promises, 这些上传将execute at the same time, 
  // 如果我们有5张图，就有5个promise，同时上传。我们有一个primise arry. 
  const uploadPromises = imageFiles.map(async (image) => {
    // creating a buffer from the image object, and convert it to base 64 string, 
    const b64 = Buffer.from(image.buffer).toString("base64");
    // create a string that describes the image.
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    // cloudinary sdk to upload.
    const res = await cloudinary.v2.uploader.upload(dataURI);
    return res.url;
  });

  // 2. if upload was successful, add the RULs to the new hotel
  // waiting for all the promises. 
  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}

export default router;
