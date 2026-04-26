import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from 'bcrypt';

// controllers for user registrations

export const registerUser = async (req: Request, res: Response) => {
   try {
      const { email, name, password } = req.body

      // find user by email
      const user = await User.findOne({ email })
      if (user) {
         return res.status(400).json({ message: "User already exists" })
      }

      // encrypt the password

      const salt = await bcrypt.genSalt(10)

      const hashedPassword = await bcrypt.hash(password, salt)

      const newUser = new User({
         name,
         email,
         password: hashedPassword
      })

      await newUser.save()
      req.session.isloggedIn = true
      req.session.userId = newUser._id

      return res.status(200).json({
         message: "User registered successfully",
         user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email
         }
      })
   } catch {
      return res.status(500).json({ message: "Server error" })
   }
}


// controller for user login 

export const loginUser = async (req: Request, res: Response) => {
   try {
      const { email, password } = req.body
      const user = await User.findOne({ email })
      if (!user) {
         return res.status(400).json({ message: "User does not exist" })
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
         return res.status(400).json({ message: "Incorrect password" })
      }
      req.session.isloggedIn = true;
      req.session.userId = user._id;
      return res.status(200).json({
         message: "Login successful",
         user: {
            _id: user._id,
            name: user.name,
            email: user.email
         }
      })
   }
   catch {
      return res.status(500).json({ message: "Server error" })

   }
}



// controller for user logout
export const logoutUser = async (req: Request, res: Response) => {
   req.session.destroy((error: any) => {
      if (error) {
         return res.status(500).json({ message: error.message })
      }
   })
   return res.json({ message: "Logout successful" })
}


// controllers for user verify

export const verifyUser = async (req: Request, res: Response) => {
   try {
      const { userId } = req.session;
      if (!req.session.isloggedIn || !userId) {
         return res.status(200).json({ user: null, isLoggedIn: false })
      }

      const user = await User.findById(userId).select("-password")
      if (!user) {
         req.session.destroy(() => {})
         return res.status(200).json({ user: null, isLoggedIn: false })
      }
      return res.status(200).json({ user, isLoggedIn: true })

   } catch (error: any) {
      res.status(500).json({ message: error.message })

   }
}
