import express, {Request, Response} from 'express';
import cors from 'cors';
import "dotenv/config";
import mongoose from 'mongoose';
import userRoutes from './routes/users';
import authRoutes from './routes/auth';
// 当我们需要verifyToken时，需要这个包和对应的ts包
import cookieParser from "cookie-parser";
import path from "path";
// 这个SDK中的v2是cloudinary提供的第二个版本。
import { v2 as cloudinary} from "cloudinary";
import myHotelRoutes from './routes/my-hotels';
import hotelRoutes from './routes/hotels';
import bookingRoutes from './routes/my-booking';

// initialize cloudinary, 连接cloudinary. 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECARET
})

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
  // .then(()=>{ 
  //   console.log("Connected to database:", 
  //   process.env.MONGODB_CONNECTION_STRING)
  // });


const app = express();
// 
app.use(cookieParser()); // 
app.use(express.json()); // convert the body of API requests into Json. 
app.use(express.urlencoded({extended: true})) // parse the URL, get the create parameters. 
app.use(
  cors({
    // our server is only going to accept requests from this url, 
    // and that url must include the credentials or the http cookie in the requests. 
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// serve those static assets. 
// go to the frontend/dist folder, serve those static assests on the root of our url that the backend runs on. 
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/my-bookings", bookingRoutes);

app.use("*", (req: Request, res: Response)=> {
  res.sendFile(path.join(__dirname, '../../fronted/dist/index.html'));
})

app.listen(7001, ()=>{
  console.log("server running on localhost:7001");
});