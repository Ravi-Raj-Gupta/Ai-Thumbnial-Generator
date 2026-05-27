import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import ai from "../configs/ai.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import cloudinary from "../configs/cloudinary.js";

// --- Style & Color Prompt Mappings ---

const stylePrompts = {
   "Bold & Graphic":
      "eye-catching composition, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, professional style, dynamic angles",
   "Tech/Futuristic":
      "futuristic scene, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",
   Minimalist:
      "minimalist composition, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",
   Photorealistic:
      "photorealistic scene, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",
   Illustrated:
      "illustrated scene, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
};

const colorSchemeDescriptions = {
   vibrant:
      "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
   sunset:
      "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
   forest:
      "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
   neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
   purple:
      "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
   monochrome:
      "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
   ocean: "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
   pastel:
      "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
};

// --- Color scheme to text color mapping for best contrast ---

const colorSchemeTextColors: Record<string, { text: string; shadow: string; gradient: string }> = {
   vibrant:   { text: "#FFFFFF", shadow: "#000000", gradient: "rgba(0,0,0,0.65)" },
   sunset:    { text: "#FFFFFF", shadow: "#1a0a00", gradient: "rgba(30,10,0,0.60)" },
   forest:    { text: "#FFFFFF", shadow: "#001a00", gradient: "rgba(0,20,0,0.60)" },
   neon:      { text: "#00FFFF", shadow: "#000000", gradient: "rgba(0,0,20,0.65)" },
   purple:    { text: "#FFFFFF", shadow: "#1a001a", gradient: "rgba(20,0,30,0.60)" },
   monochrome:{ text: "#FFFFFF", shadow: "#000000", gradient: "rgba(0,0,0,0.65)" },
   ocean:     { text: "#FFFFFF", shadow: "#001a33", gradient: "rgba(0,15,30,0.60)" },
   pastel:    { text: "#1a1a2e", shadow: "#FFFFFF", gradient: "rgba(255,255,255,0.50)" },
};

// --- Helper: Build the AI prompt (NO text in image) ---

function buildImagePrompt(
   title: string,
   user_prompt: string,
   style: string,
   color_scheme: string,
): string {
   const styleDesc = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts["Bold & Graphic"];
   const colorDesc = colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions] || "";

   let prompt = `A highly professional, premium YouTube thumbnail background image. Style: ${styleDesc}.`;

   // Theme from title
   prompt += ` The theme or topic of this thumbnail is: "${title}".`;

   // Color scheme
   if (colorDesc) {
      prompt += ` Color palette: ${colorDesc}.`;
   }

   // User's composition details
   if (user_prompt) {
      prompt += ` Core composition details: ${user_prompt}.`;
   }

   // CRITICAL: No text instruction
   prompt += ` IMPORTANT: Do NOT include any text, letters, words, typography, or watermarks in the image. The image should be a clean background/scene only with no text at all. Arrange elements with a high-CTR composition, leave space at the bottom or center for text to be added later. Professional lighting, glowing accents, and high-impact design details.`;

   return prompt;
}

// --- Helper: Generate image via Gemini 2.0 Flash (FREE tier) ---

async function generateWithGemini(prompt: string): Promise<Buffer> {
   console.log(`[Gemini] Generating image with gemini-2.0-flash-preview-image-generation...`);

   const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
         responseModalities: ["TEXT", "IMAGE"],
      },
   });

   // Find the image part in the response
   const parts = response.candidates?.[0]?.content?.parts;
   if (!parts) {
      throw new Error("No content parts returned from Gemini");
   }

   const imagePart = parts.find((part: any) => part.inlineData?.mimeType?.startsWith("image/"));
   if (!imagePart?.inlineData?.data) {
      throw new Error("No image data found in Gemini response");
   }

   const buffer = Buffer.from(imagePart.inlineData.data, "base64");
   console.log(`[Gemini] Successfully generated image (${(buffer.length / 1024).toFixed(1)} KB)`);
   return buffer;
}

// --- Helper: Fallback to Pollinations SDXL (free, unlimited) ---

async function generateWithSDXL(prompt: string, width: number, height: number): Promise<Buffer> {
   const sdxlUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt,
   )}?width=${width}&height=${height}&model=sdxl&seed=${Math.floor(
      Math.random() * 1000000,
   )}&nologo=true`;

   console.log(`[SDXL Fallback] Generating image via Pollinations SDXL...`);

   const imageResponse = await fetch(sdxlUrl, {
      headers: {
         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
   });

   if (!imageResponse.ok) {
      throw new Error(`SDXL API returned status code ${imageResponse.status}`);
   }

   const arrayBuffer = await imageResponse.arrayBuffer();
   const buffer = Buffer.from(arrayBuffer);
   console.log(`[SDXL Fallback] Successfully generated image (${(buffer.length / 1024).toFixed(1)} KB)`);
   return buffer;
}

// --- Helper: Overlay title text onto image using sharp ---

async function overlayTextOnImage(
   imageBuffer: Buffer,
   title: string,
   width: number,
   height: number,
   color_scheme: string,
   text_overlay: boolean,
): Promise<Buffer> {
   // If text overlay is disabled, just resize and return
   if (!text_overlay) {
      return sharp(imageBuffer)
         .resize(width, height, { fit: "cover" })
         .png()
         .toBuffer();
   }

   const colors = colorSchemeTextColors[color_scheme] || colorSchemeTextColors.vibrant;

   // Calculate responsive font size based on title length and image width
   let fontSize = Math.floor(width / 14);
   if (title.length > 40) fontSize = Math.floor(width / 20);
   else if (title.length > 25) fontSize = Math.floor(width / 17);

   const lineHeight = fontSize * 1.25;
   const maxTextWidth = width * 0.88;
   const padding = Math.floor(width * 0.06);

   // Word-wrap the title into lines
   const words = title.split(" ");
   const lines: string[] = [];
   let currentLine = "";

   // Estimate ~0.6em per character for approximation
   const charWidth = fontSize * 0.55;

   for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length * charWidth > maxTextWidth && currentLine) {
         lines.push(currentLine);
         currentLine = word;
      } else {
         currentLine = testLine;
      }
   }
   if (currentLine) lines.push(currentLine);

   // Build SVG text overlay
   const textBlockHeight = lines.length * lineHeight + padding * 2;
   const gradientStartY = height - textBlockHeight - padding;

   // Escape XML special characters
   const escapeXml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

   const svgLines = lines
      .map((line, i) => {
         const y = height - textBlockHeight + padding + (i + 1) * lineHeight;
         const escapedLine = escapeXml(line);
         return `
            <text x="${padding}" y="${y}" 
                  font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold"
                  fill="${colors.shadow}" opacity="0.7"
                  filter="url(#shadow)">
               ${escapedLine}
            </text>
            <text x="${padding}" y="${y}" 
                  font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold"
                  fill="${colors.text}">
               ${escapedLine}
            </text>`;
      })
      .join("\n");

   const svgOverlay = `
   <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
         <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="3" dy="3" stdDeviation="5" flood-color="${colors.shadow}" flood-opacity="0.8"/>
         </filter>
         <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="transparent"/>
            <stop offset="${Math.max(0, Math.floor((gradientStartY / height) * 100) - 5)}%" stop-color="transparent"/>
            <stop offset="100%" stop-color="${colors.gradient}"/>
         </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      ${svgLines}
   </svg>`;

   // Composite: resize background + overlay text SVG
   const result = await sharp(imageBuffer)
      .resize(width, height, { fit: "cover" })
      .composite([
         {
            input: Buffer.from(svgOverlay),
            top: 0,
            left: 0,
         },
      ])
      .png()
      .toBuffer();

   console.log(`[Sharp] Text overlay applied. Final size: ${(result.length / 1024).toFixed(1)} KB`);
   return result;
}

// --- Main Controller: Generate Thumbnail ---

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

      // Create the thumbnail record (marks as generating)
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

      // Determine dimensions
      let width = 1280;
      let height = 720;

      if (aspect_ratio === "1:1") {
         width = 800;
         height = 800;
      } else if (aspect_ratio === "9:16") {
         width = 720;
         height = 1280;
      }

      // Build the AI prompt (NO text in image)
      const imagePrompt = buildImagePrompt(title, user_prompt, style, color_scheme);
      console.log(`\n--- Thumbnail Generation Started ---`);
      console.log(`Title: "${title}" | Style: ${style} | Colors: ${color_scheme}`);

      let rawImageBuffer: Buffer;

      // Step 1: Generate the background image
      try {
         rawImageBuffer = await generateWithGemini(imagePrompt);
      } catch (geminiError: any) {
         console.warn(`[Gemini] Failed: ${geminiError.message}. Trying SDXL fallback...`);
         try {
            rawImageBuffer = await generateWithSDXL(imagePrompt, width, height);
         } catch (sdxlError: any) {
            console.warn(`[SDXL] Failed: ${sdxlError.message}. Using stock photo fallback...`);
            // Final fallback: themed stock photo
            const stopWords = new Set([
               "the", "a", "an", "is", "for", "to", "my", "awesome", "youtube", "video", "in", "with",
               "and", "how", "create", "make", "of", "on", "at", "by", "this", "that", "it", "or", "from"
            ]);
            const titleWords = (title || "").toLowerCase().split(/[^a-zA-Z0-9]/).filter((w: string) => w.length > 2 && !stopWords.has(w));
            const promptWords = (user_prompt || "").toLowerCase().split(/[^a-zA-Z0-9]/).filter((w: string) => w.length > 2 && !stopWords.has(w));
            const allWords = [...titleWords, ...promptWords].slice(0, 3);
            const keywords = allWords.length > 0 ? allWords.join(",") : "technology,modern";
            const stockUrl = `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keywords)}`;
            const stockResponse = await fetch(stockUrl);
            const arrayBuffer = await stockResponse.arrayBuffer();
            rawImageBuffer = Buffer.from(arrayBuffer);
         }
      }

      // Step 2: Overlay title text using sharp
      const finalBuffer = await overlayTextOnImage(
         rawImageBuffer,
         title,
         width,
         height,
         color_scheme,
         text_overlay,
      );

      console.log(`--- Thumbnail Generation Complete ---\n`);

      // Save to disk, upload to Cloudinary, clean up
      const filename = `final-output-${Date.now()}.png`;
      const filePath = path.join("images", filename);

      fs.mkdirSync("images", { recursive: true });
      fs.writeFileSync(filePath, finalBuffer);

      const uploadResult = await cloudinary.uploader.upload(filePath, {
         resource_type: "image",
      });

      thumbnail.image_url = uploadResult.url;
      thumbnail.prompt_used = imagePrompt;
      thumbnail.isGenerating = false;
      await thumbnail.save();

      res.json({ message: "Thumbnail Generated", thumbnail });

      // Clean up local file
      fs.unlinkSync(filePath);
   } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.message });
   }
};

// --- Controller: Delete Thumbnail ---

export const deleteThumbnail = async (req: Request, res: Response) => {
   try {
      const { id } = req.params;
      const { userId } = req.session;

      await Thumbnail.findByIdAndDelete({ _id: id, userId });

      res.json({ message: "Thumbnail deleted successfully" });
   } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.message });
   }
};
