import express, {Request, Response} from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";

const router = express.Router();

router.get("/me", verifyToken, async (req: Request, res: Response)=> {
  const userId = req.userId;
  try {
    // get user, not include the password field in the response.
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "something went wrong" });
  }
})

// /api/users/register
// 使用express-validator的check
router.post("/register",[
  check("firstName", "First Name is required").isString(),
  check("lastName", "Last Name is required").isString(),
  check("email", "Email is required").isEmail(),
  check("password", "Password with 6 or more characters required").isLength({
    min: 6}),
], 
async (req: Request, res: Response) => {
  // 使用express-validator的validationResult
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({message: errors.array()})
  }

  try {
    let user = await User.findOne({
      email: req.body.email,
    });

    if (user) {
      return res.status(400).json({message: "User already exists"})
    }

    user = new User(req.body);
    await user.save();
    
    // jsonwebtoken, 创建token,
    const token = jwt.sign(
      {userId: user.id}, 
      // this is used to encrypt the token, 加密，
      // 随便哪个密钥都行，我们在randomkeygen.com, 取一个encryption key 加密密钥
      process.env.JWT_SECRET_KEY as string, {
        expiresIn: "1d"
      }
    );
    // 发给客户端的cookie
    res.cookie("auth_token", token, {
      httpOnly: true, // http only cookie can only be accessed
      secure: process.env.NODE_ENV === "production", // 因为localhost不是https，所以要加上
      maxAge: 86400000, // 这就是1d
    })

    // return res.status(200); 如果只是这样返回，就会返回一个“OK”, 但是它不是json.
    return res.status(200).send({message: "User register OK"});

  } catch (error) {
    console.log(error);
    res.status(500).send({message: "Something went wrong"})
  }
})

export default router;