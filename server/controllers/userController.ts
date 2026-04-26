import { Request, Response } from "express";
import mongoose from "mongoose";
import Thumbnail from "../models/Thumbnail.js";

// controller to get all user Thumbnails

export const getUsersThumbail = async(req: Request, res: Response) => {
   try {
      const {userId} = req.session 

      if (!userId) {
         return res.status(401).json({message: "Not authorized"})
      }

      const thumbnail = await Thumbnail.find({userId}).sort({createdAt : -1})
      res.json({thumbnail})

   } catch (error : any) {
      res.status(500).json({message: error.message})
   }

}


// controller to get single thumbnail of a user

export const getThumbnailById = async(req: Request, res: Response) => {
   try {
      const {userId} = req.session
      const {id} = req.params

      if (!userId) {
         return res.status(401).json({message: "Not authorized"})
      }

      if (!mongoose.isValidObjectId(id)) {
         return res.status(400).json({message: "Invalid thumbnail id"})
      }

      const thumbnail = await Thumbnail.findOne({userId, _id: id})

      if (!thumbnail) {
         return res.status(404).json({message: "Thumbnail not found"})
      }

      res.json({thumbnail})
   } 
   catch (error:any) {
      res.status(500).json({message: error.message})

   }

}
