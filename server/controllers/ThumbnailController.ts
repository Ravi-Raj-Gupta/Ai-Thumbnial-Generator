import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import {
   GenerationConfig,
   HarmBlockThreshold,
   HarmCategory,
} from "@google/generative-ai";

export const generateThumbnail = async (req: Request, res: Response) => {
   try {
      const { userId } = req.session;
      const {
         title,
         prompt: user_prompt,
         style,
         aspect_ratio,
         color_scheme,
         text_overlay,
      } = req.body;

      const thumbnail = await Thumbnail.create({
         userId,
         title,
         prompt_used: user_prompt,
         user_prompt,
         style,
         aspect_ratio,
         color_scheme,
         text_overlay,
         isGenerating: true,
      });

      const model = "gemini-3-pro-image-preview";

      const generationConfig: GenerationConfig = {
         maxOutputTokens: 32768,
         temperature: 1,
         topP: 0.95,
         responseMimeType: "image/png",
      };

      const safetySettings = [
         {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.OFF,
         },
         {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.OFF,
         },
         {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.OFF,
         },
         {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.OFF,
         },
      ];

      res.status(201).json({
         message: "Thumbnail generation started",
         thumbnail,
      });
   } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.message });
   }
};
