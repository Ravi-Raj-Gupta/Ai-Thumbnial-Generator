import { Request, Response } from "express";
import mongoose from "mongoose";
import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import path from "node:path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import ai from "../configs/ai.js";
import Thumbnail from "../models/Thumbnail.js";

const stylePrompts = {
   "Bold & Graphic": "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",
   "Tech/Futuristic": "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",
   Minimalist: "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",
   Photorealistic: "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",
   Illustrated: "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
};

const colorSchemesDescriptions = {
   vibrant: "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
   sunset: "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
   forest: "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
   neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
   purple: "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
   monochrome: "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
   ocean: "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
   pastel: "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
};

const buildPrompt = ({
   title,
   user_prompt,
   style,
   aspect_ratio,
   color_scheme,
}: {
   title: string;
   user_prompt?: string;
   style: string;
   aspect_ratio?: string;
   color_scheme?: string;
}) => {
   let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} YouTube thumbnail for this title: "${title}". `;

   if (color_scheme) {
      prompt += `Use a ${colorSchemesDescriptions[color_scheme as keyof typeof colorSchemesDescriptions]} color scheme. `;
   }

   if (user_prompt) {
      prompt += `Additional details: ${user_prompt}. `;
   }

   prompt += `The thumbnail should be ${aspect_ratio || "16:9"}, high-impact, professional, sharp, bold, and optimized for click-through rate.`;

   return prompt;
};

const generateWithGemini = async (prompt: string, aspect_ratio?: string) => {
   if (!process.env.GEMINI_API_KEY?.trim()) {
      throw new Error("GEMINI_API_KEY is missing");
   }

   const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-image";
   const generationConfig: GenerateContentConfig = {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
         aspectRatio: aspect_ratio || "16:9",
      },
      safetySettings: [
         { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.OFF },
         { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.OFF },
         { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.OFF },
         { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.OFF },
      ],
   };

   const response: any = await ai.models.generateContent({
      model,
      contents: prompt,
      config: generationConfig,
   });

   const parts = response?.candidates?.[0]?.content?.parts;

   if (!parts) {
      throw new Error("Unexpected Gemini response");
   }

   for (const part of parts) {
      if (part.inlineData?.data) {
         return Buffer.from(part.inlineData.data, "base64");
      }
   }

   throw new Error("Gemini image generation returned no image data");
};

export const generateThumbnail = async (req: Request, res: Response) => {
   let filepath: string | null = null;

   try {
      const { userId } = req.session;
      const { title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;

      if (!userId) {
         return res.status(401).json({ message: "Not authorized" });
      }

      if (!title || !style) {
         return res.status(400).json({ message: "Title and style are required" });
      }

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

      const prompt = buildPrompt({
         title,
         user_prompt,
         style,
         aspect_ratio,
         color_scheme,
      });

      const finalBuffer = await generateWithGemini(prompt, aspect_ratio);
      const filename = `gemini-thumbnail-${Date.now()}.png`;
      filepath = path.join("images", filename);

      fs.mkdirSync("images", { recursive: true });
      fs.writeFileSync(filepath, finalBuffer);

      const uploadResult = await cloudinary.uploader.upload(filepath, { resource_type: "image" });

      thumbnail.image_url = uploadResult.url;
      thumbnail.isGenerating = false;
      await thumbnail.save();

      res.json({
         message: "thumbnail generated successfully using Gemini",
         thumbnail,
      });
   } catch (error) {
      const message = error instanceof Error ? error.message : "Server error";
      res.status(500).json({ message });
   } finally {
      if (filepath && fs.existsSync(filepath)) {
         fs.unlinkSync(filepath);
      }
   }
};

export const deleteThumbnail = async (req: Request, res: Response) => {
   try {
      const { id } = req.params;
      const { userId } = req.session;

      if (!userId) {
         return res.status(401).json({ message: "Not authorized" });
      }

      if (!mongoose.isValidObjectId(id)) {
         return res.status(400).json({ message: "Invalid thumbnail id" });
      }

      const deletedThumbnail = await Thumbnail.findByIdAndDelete({ _id: id, userId });

      if (!deletedThumbnail) {
         return res.status(404).json({ message: "Thumbnail not found" });
      }

      res.json({ message: "thumbnail deleted successfully" });
   } catch {
      res.status(500).json({ message: "Server error" });
   }
};
