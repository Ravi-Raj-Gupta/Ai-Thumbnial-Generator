import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import ai from "../configs/ai.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import cloudinary from "../configs/cloudinary.js";

// ─────────────────────────────────────────────────────────────────────────────
// Style & Color Prompt Mappings
// ─────────────────────────────────────────────────────────────────────────────

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


interface ITextLine {
   text: string;
   color: string;
   fontSizeMultiplier: number;
   isHighlighted: boolean;
}

interface ILayoutPlan {
   layout_style: "split_right" | "split_left" | "center";
   image_prompt: string;     // composition-aware background image prompt
   text_lines: ITextLine[];  // array of text chunks to draw
   text_tilt: number;        // rotation degrees, e.g. -5 to 5
   text_alignment: "left" | "right" | "center";
   badges: string[];         // e.g. ["growth_arrow", "rating", "youtube_play"]
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — AI Layout Planner: Ask Gemini to design the composition
// ─────────────────────────────────────────────────────────────────────────────

async function analyzeTitleAndPlanLayout(
   title: string,
   user_prompt: string,
   style: string,
   color_scheme: string,
): Promise<ILayoutPlan> {
   const styleDesc = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts["Bold & Graphic"];
   const colorDesc = colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions] || "vibrant and energetic";

   const plannerPrompt = `You are a world-class YouTube thumbnail designer specialising in high Click-Through-Rate (CTR) compositions.

Given the following YouTube video details, design an optimal thumbnail layout plan and return it as a single, valid JSON object with NO markdown, NO code fences, and NO commentary around it.

Video Title: "${title}"
User Description: "${user_prompt || "No extra details provided."}"
Visual Style: ${styleDesc}
Color Scheme: ${colorDesc}

Design Rules:
1. layout_style: Choose "split_left" (text on left, subject on right), "split_right" (text on right, subject on left), or "center" (subject centred, text bottom). Prefer split layouts for action/tutorial topics.
2. image_prompt: A precise, text-free background image prompt that directs the AI image generator. Include where to leave empty space for text (e.g., "leave the left third of the frame empty and uncluttered for text overlay"). ABSOLUTELY NO TEXT in the image.
3. text_lines: Break the title into 2–4 dramatic chunks. Each chunk must have:
   - text: the chunk (ALL CAPS, punchy)
   - color: a hex code — use pure white (#FFFFFF), bright yellow (#FFD700), neon cyan (#00FFFF), or electric red (#FF3B3B)
   - fontSizeMultiplier: between 0.8 and 1.4 (key action words get 1.3–1.4)
   - isHighlighted: true for key action words (adds glow effect and thick coloured outline)
4. text_tilt: A slight rotation in degrees between -6 and 6. Use 0 for center layouts.
5. text_alignment: "left", "right", or "center" — must match layout_style.
6. badges: An array of 0–2 badge names from: "growth_arrow", "rating", "youtube_play". Add "growth_arrow" for growth/money topics, "youtube_play" for entertainment/tutorial topics, "rating" for review/comparison topics. Leave empty [] if none fit.

Respond with ONLY the JSON object. Example format:
{
  "layout_style": "split_left",
  "image_prompt": "...",
  "text_lines": [
    { "text": "GROW", "color": "#FFD700", "fontSizeMultiplier": 1.4, "isHighlighted": true },
    { "text": "YOUR CHANNEL", "color": "#FFFFFF", "fontSizeMultiplier": 1.0, "isHighlighted": false },
    { "text": "10X FASTER", "color": "#FF3B3B", "fontSizeMultiplier": 1.2, "isHighlighted": true }
  ],
  "text_tilt": -4,
  "text_alignment": "left",
  "badges": ["growth_arrow"]
}`;

   console.log(`[Layout Planner] Analyzing title with Gemini...`);

   try {
      const response = await ai.models.generateContent({
         model: "gemini-2.0-flash",
         contents: plannerPrompt,
         config: { temperature: 0.8 },
      });

      const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      // Strip any accidental markdown code fences
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const plan: ILayoutPlan = JSON.parse(cleanJson);

      // Validate required fields — fall back to safe defaults
      if (!plan.layout_style) plan.layout_style = "center";
      if (!plan.text_lines || plan.text_lines.length === 0) {
         plan.text_lines = [{ text: title.toUpperCase(), color: "#FFFFFF", fontSizeMultiplier: 1.0, isHighlighted: false }];
      }
      if (typeof plan.text_tilt !== "number") plan.text_tilt = 0;
      if (!plan.text_alignment) plan.text_alignment = "center";
      if (!Array.isArray(plan.badges)) plan.badges = [];

      console.log(`[Layout Planner] Plan: layout=${plan.layout_style}, tilt=${plan.text_tilt}°, badges=[${plan.badges.join(",")}]`);
      return plan;
   } catch (err: any) {
      console.warn(`[Layout Planner] Failed to parse AI plan: ${err.message}. Using safe fallback.`);
      // Safe fallback plan
      return {
         layout_style: "center",
         image_prompt: `A professional YouTube thumbnail background for: "${title}". ${styleDesc}. ${colorDesc}. Leave the lower third clear for text overlay. NO TEXT in the image.`,
         text_lines: [{ text: title.toUpperCase(), color: "#FFFFFF", fontSizeMultiplier: 1.0, isHighlighted: false }],
         text_tilt: 0,
         text_alignment: "center",
         badges: [],
      };
   }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Image Generation
// ─────────────────────────────────────────────────────────────────────────────

async function generateWithGemini(prompt: string): Promise<Buffer> {
   console.log(`[Gemini] Generating image with gemini-2.0-flash-preview-image-generation...`);

   const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
         responseModalities: ["TEXT", "IMAGE"],
      },
   });

   const parts = response.candidates?.[0]?.content?.parts;
   if (!parts) throw new Error("No content parts returned from Gemini");

   const imagePart = parts.find((part: any) => part.inlineData?.mimeType?.startsWith("image/"));
   if (!imagePart?.inlineData?.data) throw new Error("No image data found in Gemini response");

   const buffer = Buffer.from(imagePart.inlineData.data, "base64");
   console.log(`[Gemini] Image generated (${(buffer.length / 1024).toFixed(1)} KB)`);
   return buffer;
}

async function generateWithSDXL(prompt: string, width: number, height: number): Promise<Buffer> {
   const sdxlUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt,
   )}?width=${width}&height=${height}&model=sdxl&seed=${Math.floor(
      Math.random() * 1000000,
   )}&nologo=true`;

   console.log(`[SDXL Fallback] Generating image via Pollinations SDXL...`);

   const imageResponse = await fetch(sdxlUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
   });

   if (!imageResponse.ok) throw new Error(`SDXL API returned status code ${imageResponse.status}`);

   const arrayBuffer = await imageResponse.arrayBuffer();
   const buffer = Buffer.from(arrayBuffer);
   console.log(`[SDXL Fallback] Image generated (${(buffer.length / 1024).toFixed(1)} KB)`);
   return buffer;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — SVG Dynamic Layout Overlay Engine
// ─────────────────────────────────────────────────────────────────────────────

function escapeXml(s: string): string {
   return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/** Render the growth arrow badge SVG elements */
function renderGrowthArrow(x: number, y: number, scale: number = 1): string {
   const s = scale * 60;
   return `
   <g transform="translate(${x}, ${y})">
      <!-- Arrow shaft -->
      <line x1="${s * 0.1}" y1="${s * 0.85}" x2="${s * 0.75}" y2="${s * 0.15}"
            stroke="#FF4500" stroke-width="${s * 0.12}" stroke-linecap="round"/>
      <!-- Arrow head -->
      <polygon points="${s * 0.75},${s * 0.15} ${s * 0.48},${s * 0.20} ${s * 0.72},${s * 0.42}"
               fill="#FF4500"/>
      <!-- Neon glow -->
      <line x1="${s * 0.1}" y1="${s * 0.85}" x2="${s * 0.75}" y2="${s * 0.15}"
            stroke="#FF6A00" stroke-width="${s * 0.06}" stroke-linecap="round" opacity="0.6" filter="url(#glowBadge)"/>
      <!-- Small trendline dots -->
      <circle cx="${s * 0.15}" cy="${s * 0.80}" r="${s * 0.07}" fill="#FFD700"/>
      <circle cx="${s * 0.35}" cy="${s * 0.58}" r="${s * 0.07}" fill="#FFD700"/>
      <circle cx="${s * 0.55}" cy="${s * 0.38}" r="${s * 0.07}" fill="#FFD700"/>
   </g>`;
}

/** Render the golden star rating badge SVG elements */
function renderRating(x: number, y: number, scale: number = 1): string {
   const s = scale * 70;
   // 5-point star path centred at (s/2, s/2)
   const cx = s / 2, cy = s / 2, outerR = s * 0.45, innerR = s * 0.18;
   const points: string[] = [];
   for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
   }
   const starPts = points.join(" ");
   return `
   <g transform="translate(${x}, ${y})">
      <polygon points="${starPts}" fill="#FFD700" stroke="#FF8C00" stroke-width="${s * 0.03}" filter="url(#glowBadge)"/>
      <text x="${cx}" y="${cy + s * 0.08}" text-anchor="middle" dominant-baseline="middle"
            font-family="'Impact','Arial Black',sans-serif" font-size="${s * 0.28}" font-weight="900"
            fill="#1a1a1a">4.9</text>
   </g>`;
}

/** Render the YouTube play button badge SVG elements */
function renderYoutubePlay(x: number, y: number, scale: number = 1): string {
   const w = scale * 110, h = scale * 78;
   const rx = w * 0.18;
   return `
   <g transform="translate(${x}, ${y})">
      <!-- Red rounded rectangle -->
      <rect x="0" y="0" width="${w}" height="${h}" rx="${rx}" ry="${rx}"
            fill="#FF0000" opacity="0.92" filter="url(#glowBadge)"/>
      <!-- White play triangle -->
      <polygon points="${w * 0.35},${h * 0.22} ${w * 0.78},${h * 0.50} ${w * 0.35},${h * 0.78}"
               fill="#FFFFFF"/>
   </g>`;
}

async function overlayDynamicLayout(
   imageBuffer: Buffer,
   plan: ILayoutPlan,
   width: number,
   height: number,
   text_overlay: boolean,
): Promise<Buffer> {
   // If text overlay is disabled, just resize and return
   if (!text_overlay) {
      return sharp(imageBuffer).resize(width, height, { fit: "cover" }).png().toBuffer();
   }

   const { layout_style, text_lines, text_tilt, text_alignment, badges } = plan;

   // ── Typography geometry ──
   const baseFontSize = Math.floor(width / 15);
   const padding = Math.floor(width * 0.055);
   const lineSpacing = 1.20;

   // Determine text X anchor & SVG text-anchor based on layout
   let textX: number;
   let svgTextAnchor: string;
   let textMaxWidth: number;

   if (layout_style === "split_left" || text_alignment === "left") {
      textX = padding;
      svgTextAnchor = "start";
      textMaxWidth = width * 0.48;
   } else if (layout_style === "split_right" || text_alignment === "right") {
      textX = width - padding;
      svgTextAnchor = "end";
      textMaxWidth = width * 0.48;
   } else {
      // center
      textX = width / 2;
      svgTextAnchor = "middle";
      textMaxWidth = width * 0.85;
   }

   // ── Calculate Y positions — vertically centred in text zone ──
   const totalLines = text_lines.length;
   const totalTextHeight = text_lines.reduce((acc, line) => {
      return acc + baseFontSize * line.fontSizeMultiplier * lineSpacing;
   }, 0);

   // For split layouts: centre vertically; for center layout: position at bottom third
   let startY: number;
   if (layout_style === "center") {
      startY = height * 0.62 - totalTextHeight / 2;
   } else {
      startY = height / 2 - totalTextHeight / 2;
   }

   // ── Build SVG text elements ──
   const svgTextElements: string[] = [];
   let currentY = startY;

   for (const line of text_lines) {
      const fs = Math.floor(baseFontSize * line.fontSizeMultiplier);
      const strokeW = Math.max(3, Math.floor(fs / 10));
      const escaped = escapeXml(line.text.toUpperCase());
      const lineY = currentY + fs;

      if (line.isHighlighted) {
         // Thick coloured glow outline for highlighted words
         svgTextElements.push(`
         <text x="${textX}" y="${lineY}" text-anchor="${svgTextAnchor}"
               font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
               font-size="${fs}" font-weight="900" letter-spacing="2"
               fill="none" stroke="${line.color}" stroke-width="${strokeW * 4}" stroke-linejoin="round"
               opacity="0.55" filter="url(#glowText)">${escaped}</text>`);
         // Black outer stroke for contrast
         svgTextElements.push(`
         <text x="${textX}" y="${lineY}" text-anchor="${svgTextAnchor}"
               font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
               font-size="${fs}" font-weight="900" letter-spacing="2"
               fill="none" stroke="#000000" stroke-width="${strokeW * 2}" stroke-linejoin="round">${escaped}</text>`);
         // Fill with the highlight colour
         svgTextElements.push(`
         <text x="${textX}" y="${lineY}" text-anchor="${svgTextAnchor}"
               font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
               font-size="${fs}" font-weight="900" letter-spacing="2"
               fill="${line.color}">${escaped}</text>`);
      } else {
         // Standard text: black outline + white fill
         svgTextElements.push(`
         <text x="${textX}" y="${lineY}" text-anchor="${svgTextAnchor}"
               font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
               font-size="${fs}" font-weight="900" letter-spacing="2"
               fill="none" stroke="#000000" stroke-width="${strokeW * 2.5}" stroke-linejoin="round"
               opacity="0.8">${escaped}</text>`);
         svgTextElements.push(`
         <text x="${textX}" y="${lineY}" text-anchor="${svgTextAnchor}"
               font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
               font-size="${fs}" font-weight="900" letter-spacing="2"
               fill="${line.color}">${escaped}</text>`);
      }

      currentY += fs * lineSpacing;
   }

   // ── Tilt: wrap all text in a rotate group ──
   const tiltAngle = text_tilt || 0;
   // Pivot point for rotation: near the text anchor
   const pivotX = layout_style === "center" ? width / 2 : (layout_style === "split_left" ? padding : width - padding);
   const pivotY = startY + totalTextHeight / 2;

   const tiltedTextGroup = `
   <g transform="rotate(${tiltAngle}, ${pivotX}, ${pivotY})">
      ${svgTextElements.join("\n")}
   </g>`;

   // ── Dark gradient vignette behind text area ──
   let gradientDef: string;
   let gradientRect: string;

   if (layout_style === "split_left") {
      gradientDef = `<linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0%" stop-color="rgba(0,0,0,0.72)"/>
         <stop offset="58%" stop-color="rgba(0,0,0,0.30)"/>
         <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </linearGradient>`;
      gradientRect = `<rect width="${width * 0.55}" height="${height}" fill="url(#textGrad)"/>`;
   } else if (layout_style === "split_right") {
      gradientDef = `<linearGradient id="textGrad" x1="1" y1="0" x2="0" y2="0">
         <stop offset="0%" stop-color="rgba(0,0,0,0.72)"/>
         <stop offset="58%" stop-color="rgba(0,0,0,0.30)"/>
         <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </linearGradient>`;
      gradientRect = `<rect x="${width * 0.45}" width="${width * 0.55}" height="${height}" fill="url(#textGrad)"/>`;
   } else {
      // center — bottom gradient
      gradientDef = `<linearGradient id="textGrad" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
         <stop offset="52%" stop-color="rgba(0,0,0,0.38)"/>
         <stop offset="100%" stop-color="rgba(0,0,0,0.78)"/>
      </linearGradient>`;
      gradientRect = `<rect width="${width}" height="${height}" fill="url(#textGrad)"/>`;
   }

   // ── Badge placement ──
   const badgeSvgParts: string[] = [];
   const badgeScale = width / 1280;

   if (badges.includes("growth_arrow")) {
      // Top-right corner
      badgeSvgParts.push(renderGrowthArrow(width - 140 * badgeScale, 20 * badgeScale, badgeScale));
   }
   if (badges.includes("rating")) {
      // Bottom-right corner
      badgeSvgParts.push(renderRating(width - 110 * badgeScale, height - 110 * badgeScale, badgeScale));
   }
   if (badges.includes("youtube_play")) {
      // Bottom-left corner (only if not in split_left layout)
      const byX = layout_style === "split_left" ? width * 0.52 : 20 * badgeScale;
      badgeSvgParts.push(renderYoutubePlay(byX, height - 100 * badgeScale, badgeScale));
   }

   // ── Compose final SVG ──
   const svgOverlay = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
   <defs>
      ${gradientDef}
      <filter id="glowText" x="-20%" y="-20%" width="140%" height="140%">
         <feGaussianBlur stdDeviation="5" result="blur"/>
         <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <filter id="glowBadge" x="-30%" y="-30%" width="160%" height="160%">
         <feGaussianBlur stdDeviation="4" result="blur"/>
         <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
   </defs>

   <!-- Dark gradient vignette -->
   ${gradientRect}

   <!-- Tilted text block -->
   ${tiltedTextGroup}

   <!-- Badges -->
   ${badgeSvgParts.join("\n")}
</svg>`;

   const result = await sharp(imageBuffer)
      .resize(width, height, { fit: "cover" })
      .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
      .png()
      .toBuffer();

   console.log(`[Sharp] Dynamic layout applied. Final size: ${(result.length / 1024).toFixed(1)} KB`);
   return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Controller: Generate Thumbnail
// ─────────────────────────────────────────────────────────────────────────────

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

      console.log(`\n=== Thumbnail Generation Started ===`);
      console.log(`Title: "${title}" | Style: ${style} | Colors: ${color_scheme} | TextOverlay: ${text_overlay}`);

      // ── Step 1: AI designs the layout plan ──
      let layoutPlan: ILayoutPlan;
      if (text_overlay) {
         layoutPlan = await analyzeTitleAndPlanLayout(title, user_prompt, style, color_scheme);
      } else {
         // Skip AI planning if overlay is disabled
         const styleDesc = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts["Bold & Graphic"];
         const colorDesc = colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions] || "";
         layoutPlan = {
            layout_style: "center",
            image_prompt: `A highly professional YouTube thumbnail background. Style: ${styleDesc}. Color: ${colorDesc}. Topic: "${title}". NO TEXT in the image. Leave lower third clear. ABSOLUTELY NO LETTERS, WORDS, or TYPOGRAPHY in the image.`,
            text_lines: [],
            text_tilt: 0,
            text_alignment: "center",
            badges: [],
         };
      }

      // ── Step 2: Build the final image prompt (use AI's composition-aware prompt) ──
      const imagePrompt = layoutPlan.image_prompt +
         " ABSOLUTELY NO TEXT, LETTERS, WORDS, NUMBERS, WATERMARKS, SIGNS, OR TYPOGRAPHY ANYWHERE IN THE IMAGE. The image must be 100% text-free.";

      // ── Step 3: Generate the background image ──
      let rawImageBuffer: Buffer;

      try {
         rawImageBuffer = await generateWithGemini(imagePrompt);
      } catch (geminiError: any) {
         console.warn(`[Gemini] Failed: ${geminiError.message}. Trying SDXL fallback...`);
         try {
            rawImageBuffer = await generateWithSDXL(imagePrompt, width, height);
         } catch (sdxlError: any) {
            console.warn(`[SDXL] Failed: ${sdxlError.message}. Using stock photo fallback...`);
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

      // ── Step 4: Apply the dynamic SVG layout overlay ──
      const finalBuffer = await overlayDynamicLayout(
         rawImageBuffer,
         layoutPlan,
         width,
         height,
         text_overlay,
      );

      console.log(`=== Thumbnail Generation Complete ===\n`);

      // ── Step 5: Save, upload to Cloudinary, clean up ──
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

// ─────────────────────────────────────────────────────────────────────────────
// Controller: Delete Thumbnail
// ─────────────────────────────────────────────────────────────────────────────

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
