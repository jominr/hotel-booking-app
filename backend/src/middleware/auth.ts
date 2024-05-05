import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// 全局声明，Express这个命名空间下的Request接口有userId这个字符串。
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

// 注意这个Request不是来自于fetchAPI，而是来自于express
const verifyToken = (req:Request, res: Response, next: NextFunction)=>{
  const token = req.cookies["auth_token"];
  if(!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    // 需要引入JwtPayload,
    // req上本身没有userId这个属性，so we need to extend the express request type. 
    req.userId = (decoded as JwtPayload).userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "unauthorized" });
  }
}

export default verifyToken;