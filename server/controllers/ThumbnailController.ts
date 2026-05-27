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

const stylePrompts: Record<string, string> = {
   "Bold & Graphic":
      "eye-catching composition, vibrant colors, high contrast, professional style, dynamic angles, dramatic lighting",
   "Tech/Futuristic":
      "futuristic scene, sleek modern design, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting",
   Minimalist:
      "minimalist composition, clean layout, simple shapes, limited color palette, plenty of negative space, clear focal point",
   Photorealistic:
      "photorealistic scene, ultra-realistic lighting, natural skin tones, DSLR-style photography, lifestyle realism, shallow depth of field",
   Illustrated:
      "illustrated scene, custom digital illustration, stylized characters, bold outlines, vibrant colors, cartoon art style",
};

const colorSchemeDescriptions: Record<string, string> = {
   vibrant: "vibrant and energetic colors, high saturation, bold contrasts",
   sunset:  "warm sunset tones, orange pink and purple hues, cinematic glow",
   forest:  "natural green tones, earthy colors, calm and organic palette",
   neon:    "neon glow effects, electric blues and pinks, cyberpunk lighting",
   purple:  "purple-dominant palette, magenta and violet tones",
   monochrome: "black and white, high contrast, dramatic lighting",
   ocean:   "cool blue and teal tones, aquatic color palette",
   pastel:  "soft pastel colors, gentle tones, calm aesthetic",
};

// Panel color per color scheme — used for the solid text background panel
const panelColors: Record<string, { bg: string; accent: string }> = {
   vibrant:    { bg: "#1a0a2e", accent: "#FF3B3B" },
   sunset:     { bg: "#1a0800", accent: "#FF6B35" },
   forest:     { bg: "#0a1a0a", accent: "#00C853" },
   neon:       { bg: "#050520", accent: "#00FFFF" },
   purple:     { bg: "#1a0030", accent: "#CC00FF" },
   monochrome: { bg: "#0a0a0a", accent: "#FFFFFF" },
   ocean:      { bg: "#001a33", accent: "#00BFFF" },
   pastel:     { bg: "#2b1f3a", accent: "#FFB6C1" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface ITextLine {
   text: string;
   color: string;              // hex e.g. "#FFD700"
   fontSizeMultiplier: number; // 0.7 – 1.8
   isHighlighted: boolean;     // glow + coloured stroke
}

interface ILayoutPlan {
   layout_style: "split_left" | "split_right" | "center";
   image_prompt: string;
   text_lines: ITextLine[];
   text_tilt: number;          // –6 to 6
   text_alignment: "left" | "right" | "center";
   panel_color: string;        // hex for solid background panel
   accent_color: string;       // hex for accent stripe / badge colour
   badges: string[];           // "growth_arrow" | "rating" | "youtube_play"
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — AI Layout Planner
// ─────────────────────────────────────────────────────────────────────────────

async function analyzeTitleAndPlanLayout(
   title: string,
   user_prompt: string,
   style: string,
   color_scheme: string,
): Promise<ILayoutPlan> {
   const styleDesc = stylePrompts[style] || stylePrompts["Bold & Graphic"];
   const colorDesc = colorSchemeDescriptions[color_scheme] || "vibrant and energetic";
   const panels = panelColors[color_scheme] || panelColors.vibrant;

   const plannerPrompt = `You are a world-class YouTube thumbnail designer. Your task: design a high-CTR thumbnail layout.

Video Title: "${title}"
Description: "${user_prompt || "No extra details"}"
Visual Style: ${styleDesc}
Color Scheme: ${colorDesc}

Return ONLY a valid JSON object — no markdown, no code fences, no explanation.

Rules:
1. layout_style: "split_left" (text left, person/subject right) OR "split_right" (text right, person/subject left) OR "center" (only for step-by-step guides). Prefer split for most topics.
2. image_prompt: A detailed background image prompt. For split layouts: "a smiling Indian presenter/expert on the [right/left] half of the frame, pointing at camera, on a [theme] background — the [opposite] half of the frame is completely empty solid dark blue/dark [color] with no objects". This is critical — leave exactly half the frame empty for the text panel.
3. text_lines: Break title into 2–4 punchy ALL-CAPS chunks:
   - Main keyword: fontSizeMultiplier 1.6–1.8, color "#FFD700" (yellow), isHighlighted: true
   - Secondary words: fontSizeMultiplier 1.0–1.2, color "#FFFFFF", isHighlighted: false
   - Tagline (optional): fontSizeMultiplier 0.75, color "#00FF88", isHighlighted: false
4. text_tilt: –4 to 4 degrees. Use 0 for center.
5. text_alignment: matches layout_style ("left", "right", or "center")
6. panel_color: dark hex for solid background panel behind text e.g. "#0a1a3a"
7. accent_color: bright hex for accent stripe e.g. "#FF3B3B"
8. badges: array — "growth_arrow" for growth/money topics, "youtube_play" for tutorials, "rating" for reviews. Max 2.

JSON format:
{
  "layout_style": "split_left",
  "image_prompt": "...",
  "text_lines": [
    {"text": "GROW", "color": "#FFD700", "fontSizeMultiplier": 1.7, "isHighlighted": true},
    {"text": "YOUR CHANNEL", "color": "#FFFFFF", "fontSizeMultiplier": 1.1, "isHighlighted": false},
    {"text": "10X FASTER", "color": "#FF3B3B", "fontSizeMultiplier": 1.3, "isHighlighted": true}
  ],
  "text_tilt": -3,
  "text_alignment": "left",
  "panel_color": "#0a1a3a",
  "accent_color": "#FF3B3B",
  "badges": ["growth_arrow"]
}`;

   try {
      const response = await ai.models.generateContent({
         model: "gemini-2.0-flash",
         contents: plannerPrompt,
         config: { temperature: 0.85 },
      });

      const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const plan: ILayoutPlan = JSON.parse(cleanJson);

      if (!plan.layout_style) plan.layout_style = "split_left";
      if (!plan.text_lines?.length) plan.text_lines = [{ text: title.toUpperCase(), color: "#FFD700", fontSizeMultiplier: 1.4, isHighlighted: true }];
      if (typeof plan.text_tilt !== "number") plan.text_tilt = 0;
      if (!plan.text_alignment) plan.text_alignment = "left";
      if (!plan.panel_color) plan.panel_color = panels.bg;
      if (!plan.accent_color) plan.accent_color = panels.accent;
      if (!Array.isArray(plan.badges)) plan.badges = [];

      console.log(`[Layout Planner] ✓ layout=${plan.layout_style}, tilt=${plan.text_tilt}°, badges=[${plan.badges.join(",")}]`);
      return plan;
   } catch (err: any) {
      console.warn(`[Layout Planner] Parse failed: ${err.message}. Using fallback.`);
      return {
         layout_style: "split_left",
         image_prompt: `A smiling Indian presenter expert on the right half of the frame, pointing at camera, the left half is a completely empty flat dark blue background with no objects or decorations. ${styleDesc}. ${colorDesc}. NO TEXT in the image.`,
         text_lines: [
            { text: title.toUpperCase(), color: "#FFD700", fontSizeMultiplier: 1.5, isHighlighted: true },
            { text: "COMPLETE GUIDE", color: "#FFFFFF", fontSizeMultiplier: 0.85, isHighlighted: false },
         ],
         text_tilt: -3,
         text_alignment: "left",
         panel_color: panels.bg,
         accent_color: panels.accent,
         badges: ["youtube_play"],
      };
   }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Image Generation
// ─────────────────────────────────────────────────────────────────────────────

async function generateWithGemini(prompt: string): Promise<Buffer> {
   console.log(`[Gemini] Generating background image...`);
   const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: { responseModalities: ["TEXT", "IMAGE"] },
   });

   const parts = response.candidates?.[0]?.content?.parts;
   if (!parts) throw new Error("No content parts from Gemini");

   const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
   if (!imagePart?.inlineData?.data) throw new Error("No image in Gemini response");

   const buffer = Buffer.from(imagePart.inlineData.data, "base64");
   console.log(`[Gemini] ✓ ${(buffer.length / 1024).toFixed(1)} KB`);
   return buffer;
}

async function generateWithSDXL(prompt: string, width: number, height: number): Promise<Buffer> {
   const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=sdxl&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
   console.log(`[SDXL] Generating via Pollinations...`);
   const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
   if (!res.ok) throw new Error(`SDXL status ${res.status}`);
   const buf = Buffer.from(await res.arrayBuffer());
   console.log(`[SDXL] ✓ ${(buf.length / 1024).toFixed(1)} KB`);
   return buf;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Professional SVG Overlay Engine
// ─────────────────────────────────────────────────────────────────────────────

function escXml(s: string) {
   return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Solid colored panel covering the text side */
function renderTextPanel(layout: string, w: number, h: number, panelColor: string, accentColor: string): string {
   if (layout === "center") {
      // Semi-transparent bottom panel
      return `<rect x="0" y="${h * 0.55}" width="${w}" height="${h * 0.45}" fill="${panelColor}" opacity="0.82"/>`;
   }
   const panelW = w * 0.50;
   const x = layout === "split_right" ? w - panelW : 0;

   // Main solid panel
   let svg = `<rect x="${x}" y="0" width="${panelW}" height="${h}" fill="${panelColor}" opacity="0.90"/>`;
   // Accent vertical stripe on the inner edge
   const stripeX = layout === "split_right" ? x : panelW - 8;
   svg += `<rect x="${stripeX}" y="0" width="8" height="${h}" fill="${accentColor}" opacity="0.95"/>`;
   // Subtle gradient blend over the panel edge
   const blendId = layout === "split_right" ? "blendR" : "blendL";
   const blendX1 = layout === "split_right" ? "0" : "1";
   svg += `<defs>
      <linearGradient id="${blendId}" x1="${blendX1}" y1="0" x2="${layout === "split_right" ? "1" : "0"}" y2="0">
         <stop offset="0%" stop-color="${panelColor}" stop-opacity="0"/>
         <stop offset="18%" stop-color="${panelColor}" stop-opacity="0.70"/>
         <stop offset="100%" stop-color="${panelColor}" stop-opacity="0.90"/>
      </linearGradient>
   </defs>
   <rect x="${x}" y="0" width="${panelW * 0.35}" height="${h}" fill="url(#${blendId})"/>`;

   return svg;
}

/** Draw the text block with proper positioning */
function renderTextBlock(
   lines: ITextLine[],
   layout: string,
   w: number,
   h: number,
   tilt: number,
): string {
   const BASE = Math.floor(w / 13); // base font size
   const PAD  = Math.floor(w * 0.05);

   let anchorX: number;
   let svgAnchor: string;
   let maxW: number;

   if (layout === "split_left" ) { anchorX = PAD;       svgAnchor = "start"; maxW = w * 0.47; }
   else if (layout === "split_right") { anchorX = w - PAD; svgAnchor = "end";   maxW = w * 0.47; }
   else                               { anchorX = w / 2;   svgAnchor = "middle"; maxW = w * 0.90; }

   // Measure total block height
   const totalH = lines.reduce((acc, l) => acc + BASE * l.fontSizeMultiplier * 1.18, 0);

   let startY: number;
   if (layout === "center") startY = h * 0.56 + PAD;
   else startY = (h - totalH) / 2;

   const parts: string[] = [];
   let curY = startY;

   for (const line of lines) {
      const fs   = Math.floor(BASE * line.fontSizeMultiplier);
      const sw   = Math.max(3, Math.floor(fs / 9));
      const esc  = escXml(line.text.toUpperCase());
      const y    = curY + fs;

      if (line.isHighlighted) {
         // Outer glow
         parts.push(`<text x="${anchorX}" y="${y}" text-anchor="${svgAnchor}"
            font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
            font-size="${fs}" font-weight="900" letter-spacing="3"
            fill="none" stroke="${line.color}" stroke-width="${sw * 5}" stroke-linejoin="round"
            opacity="0.40" filter="url(#glowT)">${esc}</text>`);
         // Black outline
         parts.push(`<text x="${anchorX}" y="${y}" text-anchor="${svgAnchor}"
            font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
            font-size="${fs}" font-weight="900" letter-spacing="3"
            fill="none" stroke="#000000" stroke-width="${sw * 2}" stroke-linejoin="round">${esc}</text>`);
         // Fill
         parts.push(`<text x="${anchorX}" y="${y}" text-anchor="${svgAnchor}"
            font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
            font-size="${fs}" font-weight="900" letter-spacing="3"
            fill="${line.color}">${esc}</text>`);
      } else {
         // White with black outline
         parts.push(`<text x="${anchorX}" y="${y}" text-anchor="${svgAnchor}"
            font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
            font-size="${fs}" font-weight="900" letter-spacing="2"
            fill="none" stroke="#000000" stroke-width="${sw * 2.5}" stroke-linejoin="round"
            opacity="0.85">${esc}</text>`);
         parts.push(`<text x="${anchorX}" y="${y}" text-anchor="${svgAnchor}"
            font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
            font-size="${fs}" font-weight="900" letter-spacing="2"
            fill="${line.color}">${esc}</text>`);
      }

      curY += fs * 1.18;
   }

   // Pivot for tilt
   const pivX = layout === "center" ? w / 2 : (layout === "split_left" ? w * 0.25 : w * 0.75);
   const pivY = h / 2;

   return `<g transform="rotate(${tilt}, ${pivX}, ${pivY})">${parts.join("\n")}</g>`;
}

/** Neon growth arrow — top-right corner */
function renderGrowthArrow(w: number, h: number, accentColor: string): string {
   const s = w * 0.09;
   const x = w - s * 1.8;
   const y = h * 0.06;
   return `
   <g filter="url(#glowB)">
      <line x1="${x}" y1="${y + s}" x2="${x + s}" y2="${y}"
            stroke="${accentColor}" stroke-width="${s * 0.18}" stroke-linecap="round"/>
      <polygon points="${x + s},${y} ${x + s * 0.55},${y + s * 0.22} ${x + s * 0.88},${y + s * 0.55}"
               fill="${accentColor}"/>
      <circle cx="${x + s * 0.12}" cy="${y + s * 0.88}" r="${s * 0.1}" fill="#FFD700"/>
      <circle cx="${x + s * 0.44}" cy="${y + s * 0.55}" r="${s * 0.1}" fill="#FFD700"/>
      <circle cx="${x + s * 0.78}" cy="${y + s * 0.22}" r="${s * 0.1}" fill="#FFD700"/>
   </g>`;
}

/** Golden star rating — top-right (or bottom-right) */
function renderRating(w: number, h: number): string {
   const bw = w * 0.20, bh = h * 0.11;
   const x = w - bw - w * 0.03, y = h * 0.04;
   const cx = x + bw / 2, cy = y + bh / 2;
   const or = bh * 0.42, ir = bh * 0.18;
   const pts: string[] = [];
   for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const r = i % 2 === 0 ? or : ir;
      pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
   }
   return `
   <g filter="url(#glowB)">
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${bh * 0.22}" fill="#1a1a1a" opacity="0.85"/>
      <polygon points="${pts.join(" ")}" fill="#FFD700"/>
      <text x="${cx + or * 1.1}" y="${cy + bh * 0.12}" text-anchor="start" dominant-baseline="middle"
            font-family="'Impact','Arial Black',sans-serif" font-size="${bh * 0.55}" font-weight="900"
            fill="#FFFFFF">4.5 STARS</text>
   </g>`;
}

/** YouTube play button — bottom corner opposite to text */
function renderYoutubePlay(layout: string, w: number, h: number): string {
   const bw = w * 0.13, bh = h * 0.10;
   const x = layout === "split_left" ? w - bw - w * 0.03 : w * 0.03;
   const y = h - bh - h * 0.04;
   const rx = bh * 0.22;
   return `
   <g filter="url(#glowB)">
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${rx}" fill="#FF0000" opacity="0.93"/>
      <polygon points="${x + bw * 0.32},${y + bh * 0.20} ${x + bw * 0.80},${y + bh * 0.50} ${x + bw * 0.32},${y + bh * 0.80}"
               fill="#FFFFFF"/>
   </g>`;
}

/** "NEW" banner — top-left */
function renderNewBadge(layout: string, w: number, h: number, accentColor: string): string {
   if (layout !== "split_right") return "";
   const bw = w * 0.08, bh = h * 0.072;
   return `
   <g>
      <rect x="0" y="0" width="${bw}" height="${bh}" fill="${accentColor}" opacity="0.95"/>
      <text x="${bw / 2}" y="${bh * 0.70}" text-anchor="middle"
            font-family="'Impact','Arial Black',sans-serif" font-size="${bh * 0.60}" font-weight="900"
            fill="#FFFFFF">NEW</text>
   </g>`;
}

async function overlayDynamicLayout(
   imageBuffer: Buffer,
   plan: ILayoutPlan,
   width: number,
   height: number,
   text_overlay: boolean,
): Promise<Buffer> {
   if (!text_overlay) {
      return sharp(imageBuffer).resize(width, height, { fit: "cover" }).png().toBuffer();
   }

   const { layout_style, text_lines, text_tilt, badges, panel_color, accent_color } = plan;

   const panel   = renderTextPanel(layout_style, width, height, panel_color, accent_color);
   const textBlk = renderTextBlock(text_lines, layout_style, width, height, text_tilt);

   const badgeSvg = [
      badges.includes("growth_arrow") ? renderGrowthArrow(width, height, accent_color) : "",
      badges.includes("rating")       ? renderRating(width, height) : "",
      badges.includes("youtube_play") ? renderYoutubePlay(layout_style, width, height) : "",
      renderNewBadge(layout_style, width, height, accent_color),
   ].join("\n");

   const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
   <defs>
      <filter id="glowT" x="-20%" y="-20%" width="140%" height="140%">
         <feGaussianBlur stdDeviation="6" result="b"/>
         <feComposite in="SourceGraphic" in2="b" operator="over"/>
      </filter>
      <filter id="glowB" x="-30%" y="-30%" width="160%" height="160%">
         <feGaussianBlur stdDeviation="4" result="b"/>
         <feComposite in="SourceGraphic" in2="b" operator="over"/>
      </filter>
   </defs>
   ${panel}
   ${textBlk}
   ${badgeSvg}
</svg>`;

   const result = await sharp(imageBuffer)
      .resize(width, height, { fit: "cover" })
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .png()
      .toBuffer();

   console.log(`[Sharp] ✓ Final thumbnail: ${(result.length / 1024).toFixed(1)} KB`);
   return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Controller
// ─────────────────────────────────────────────────────────────────────────────

export const generateThumbnail = async (req: Request, res: Response) => {
   try {
      const { userId } = req.session;
      const { title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;

      const thumbnail = await Thumbnail.create({
         userId, title, prompt_used: user_prompt, user_prompt, style,
         aspect_ratio, color_scheme, text_overlay, isGenerating: true,
      });

      let width = 1280, height = 720;
      if (aspect_ratio === "1:1") { width = 800; height = 800; }
      else if (aspect_ratio === "9:16") { width = 720; height = 1280; }

      console.log(`\n=== Thumbnail Generation Started ===`);
      console.log(`Title: "${title}" | Style: ${style} | Color: ${color_scheme}`);

      // Step 1: AI designs the layout
      let layoutPlan: ILayoutPlan;
      if (text_overlay) {
         layoutPlan = await analyzeTitleAndPlanLayout(title, user_prompt, style, color_scheme);
      } else {
         const sd = stylePrompts[style] || stylePrompts["Bold & Graphic"];
         const cd = colorSchemeDescriptions[color_scheme] || "";
         layoutPlan = {
            layout_style: "center",
            image_prompt: `Professional YouTube thumbnail background. ${sd}. ${cd}. Topic: "${title}". NO TEXT. NO LETTERS. NO WORDS.`,
            text_lines: [], text_tilt: 0, text_alignment: "center",
            panel_color: "#000000", accent_color: "#FF0000", badges: [],
         };
      }

      // Step 2: Append aggressive no-text instruction
      const imagePrompt = layoutPlan.image_prompt +
         " CRITICAL RULE: ABSOLUTELY ZERO TEXT, LETTERS, WORDS, NUMBERS, SIGNS, LABELS, WATERMARKS OR TYPOGRAPHY ANYWHERE IN THE IMAGE. 100% text-free. Any whiteboards, screens, or signs must be completely blank.";

      // Step 3: Generate background
      let rawImageBuffer: Buffer;
      try {
         rawImageBuffer = await generateWithGemini(imagePrompt);
      } catch (e: any) {
         console.warn(`[Gemini] ${e.message} — trying SDXL...`);
         try {
            rawImageBuffer = await generateWithSDXL(imagePrompt, width, height);
         } catch (e2: any) {
            console.warn(`[SDXL] ${e2.message} — using stock photo...`);
            const stopWords = new Set(["the","a","an","is","for","to","my","youtube","video","in","with","and","how","of","on","at","by"]);
            const kw = [...(title||"").toLowerCase().split(/\W+/), ...(user_prompt||"").toLowerCase().split(/\W+/)]
               .filter(w => w.length > 2 && !stopWords.has(w)).slice(0, 3).join(",") || "technology,modern";
            const r = await fetch(`https://loremflickr.com/${width}/${height}/${encodeURIComponent(kw)}`);
            rawImageBuffer = Buffer.from(await r.arrayBuffer());
         }
      }

      // Step 4: Overlay the dynamic layout
      const finalBuffer = await overlayDynamicLayout(rawImageBuffer, layoutPlan, width, height, text_overlay);

      console.log(`=== Generation Complete ===\n`);

      // Step 5: Save + upload
      const filePath = path.join("images", `thumb-${Date.now()}.png`);
      fs.mkdirSync("images", { recursive: true });
      fs.writeFileSync(filePath, finalBuffer);

      const upload = await cloudinary.uploader.upload(filePath, { resource_type: "image" });

      thumbnail.image_url = upload.url;
      thumbnail.prompt_used = imagePrompt;
      thumbnail.isGenerating = false;
      await thumbnail.save();

      res.json({ message: "Thumbnail Generated", thumbnail });
      fs.unlinkSync(filePath);
   } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.message });
   }
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete Thumbnail
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
