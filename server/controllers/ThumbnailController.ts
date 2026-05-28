import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import ai from "../configs/ai.js";
import sharp from "sharp";
import cloudinary from "../configs/cloudinary.js";

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

interface ITextPanel {
   text: string;
   role: "intro" | "title" | "subtitle" | "cta";
   color: string;          
   bgColor: string | null; 
   fontSizeMultiplier: number;
   bold: boolean;
   allCaps: boolean;
}

interface IInfoBadge {
   label: string;
   icon: "rupee" | "star" | "book" | "building" | "play" | "users" | "chart" | "check";
}

interface ICornerDecoration {
   position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
   type: "ribbon" | "fold";
   color: string;
   label?: string; 
}

interface ILayoutPlan {
   layout_style: "split_right" | "split_left" | "center";
   panel_color: string;    
   panel_opacity: number;  
   image_prompt: string;   
   text_panels: ITextPanel[];
   info_badges: IInfoBadge[];
   corner_decorations: ICornerDecoration[];
   star_callout: { show: boolean; stars: number; label: string } | null;
   subscriber_callout: { show: boolean; counts: string[] } | null;
}

async function analyzeTitleAndPlanLayout(
   title: string,
   user_prompt: string,
   style: string,
   color_scheme: string,
): Promise<ILayoutPlan> {
   const styleDesc =
      stylePrompts[style as keyof typeof stylePrompts] || stylePrompts["Bold & Graphic"];
   const colorDesc =
      colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions] ||
      "vibrant and energetic";

   const plannerPrompt = `You are a world-class YouTube thumbnail designer specialising in high Click-Through-Rate thumbnails, inspired by the best Indian YouTubers.

Design a professional thumbnail layout for the video below and return ONLY a valid JSON object — no markdown, no code fences, no extra text.

Video Title: "${title}"
User Description: "${user_prompt || "No extra details provided."}"
Visual Style: ${styleDesc}
Color Scheme: ${colorDesc}

=== DESIGN RULES ===

1. layout_style: RANDOMLY choose between "split_left" (text on left half) and "split_right" (text on right half). Occasionally use "center". DO NOT always pick split_left!

2. panel_color: A richly saturated dark hex color for the solid text-zone background. Match the vibe of the topic (e.g., #0D2355 navy, #1a0520 purple, #0D2010 green, #1A0505 maroon).

3. panel_opacity: 0.88–0.95 for split layouts. Use 0.0 for center.

4. image_prompt: Precise, text-free prompt. MUST include:
   - A highly expressive human subject relevant to the topic
   - For "split_left": "subject positioned on the far RIGHT side of the frame"
   - For "split_right": "subject positioned on the far LEFT side of the frame"
   - "The [left/right] half of the frame is naturally dark, matching the panel color, with clean uncluttered space"
   - End with: "ABSOLUTELY NO TEXT, LETTERS, WORDS, NUMBERS, SIGNS, or TYPOGRAPHY anywhere in the image."

5. text_panels: 2–5 lines, each with a role: "intro", "title", "subtitle", "cta". 
   - VARY THE COMBINATION! Sometimes use [title, subtitle], sometimes [intro, title, cta], etc.
   - VARY THE TITLE COLOR! Do NOT always use yellow. Pick from: "#FFD700" (Gold), "#00FFFF" (Cyan), "#FF3B3B" (Red), "#7CFC00" (Lime), or "#FFFFFF" (White).
   - bgColor: Decide WHICH line gets a colored banner strip. Usually the 'cta' or 'subtitle'. Use hex like "#C62828", "#1565C0", "#E65100". Leave others null.
   - fontSizeMultiplier: 0.85–1.15.
   - bold: true for main lines.
   - allCaps: always true.

6. info_badges: 0–4 circular icon badges placed in the IMAGE zone (e.g. "PLACEMENTS", "ACADEMICS", "CAMPUS"). ONLY use these for educational/review/comparison content! Leave [] for most topics.

7. corner_decorations: Corner triangle accents. 
   - Use "fold" (all 4 corners) OR "ribbon" (top-left).
   - ONLY use for special topics (reviews, new launches). Leave [] for most topics.

8. star_callout: For review / rating / comparison videos ONLY. Leave null for others.

9. subscriber_callout: For channel growth / milestone videos ONLY. Leave null for others.

*** CRITICAL: EVERY THUMBNAIL MUST FEEL UNIQUE. Randomly swap layout sides (left vs right), change text colors, and vary the number of text lines! ***

=== EXAMPLE JSON OUTPUT (college review video) ===
{
  "layout_style": "split_left",
  "panel_color": "#0D2355",
  "panel_opacity": 0.93,
  "image_prompt": "A smiling confident young Indian man in casual clothes pointing to the left, standing on the far RIGHT side of the frame. Slightly blurred college campus gate visible behind him. The left half of the image is naturally dark navy with clean, uncluttered space. ABSOLUTELY NO TEXT, LETTERS, WORDS, or NUMBERS in the image.",
  "text_panels": [
    { "text": "NIT JAMSHEDPUR", "role": "title", "color": "#FFD700", "bgColor": null, "fontSizeMultiplier": 1.05, "bold": true, "allCaps": true },
    { "text": "COLLEGE REVIEW", "role": "subtitle", "color": "#FFFFFF", "bgColor": "#C62828", "fontSizeMultiplier": 1.0, "bold": true, "allCaps": true },
    { "text": "HONEST & DETAILED", "role": "cta", "color": "#7CFC00", "bgColor": null, "fontSizeMultiplier": 0.9, "bold": false, "allCaps": true }
  ],
  "info_badges": [
    { "label": "PLACEMENTS", "icon": "rupee" },
    { "label": "ACADEMICS", "icon": "book" },
    { "label": "RATING", "icon": "star" },
    { "label": "CAMPUS", "icon": "building" }
  ],
  "corner_decorations": [
    { "position": "top-left", "type": "fold", "color": "#CC0000" },
    { "position": "top-right", "type": "fold", "color": "#CC0000" },
    { "position": "bottom-left", "type": "fold", "color": "#CC0000" },
    { "position": "bottom-right", "type": "fold", "color": "#CC0000" }
  ],
  "star_callout": { "show": true, "stars": 4.5, "label": "4.5 STARS" },
  "subscriber_callout": null
}

Respond with ONLY the JSON.`;

   console.log(`[Layout Planner] Analyzing title with Gemini...`);

   try {
      const response = await ai.models.generateContent({
         model: "gemini-3.5-flash",
         contents: plannerPrompt,
         config: { temperature: 0.8 },
      });

      const rawText = response.text || "";
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const plan: ILayoutPlan = JSON.parse(cleanJson);

      if (!plan.layout_style) plan.layout_style = "split_left";
      if (!plan.panel_color) plan.panel_color = "#0a0a1a";
      if (typeof plan.panel_opacity !== "number") plan.panel_opacity = 0.90;
      if (!plan.text_panels || plan.text_panels.length === 0) {
         plan.text_panels = [
            {
               text: title.toUpperCase(),
               role: "title",
               color: "#FFD700",
               bgColor: null,
               fontSizeMultiplier: 1.0,
               bold: true,
               allCaps: true,
            },
         ];
      }
      if (!Array.isArray(plan.info_badges)) plan.info_badges = [];
      if (!Array.isArray(plan.corner_decorations)) plan.corner_decorations = [];

      console.log(
         `[Layout Planner] layout=${plan.layout_style}, panels=${plan.text_panels.length}, ` +
         `badges=${plan.info_badges.length}, corners=${plan.corner_decorations.length}, ` +
         `star=${!!plan.star_callout?.show}, subs=${!!plan.subscriber_callout?.show}`,
      );
      return plan;
   } catch (err: any) {
      console.warn(`[Layout Planner] Parse failed: ${err.message}. Using safe fallback.`);
      return {
         layout_style: "split_left",
         panel_color: "#0a0a1a",
         panel_opacity: 0.90,
         image_prompt: `A highly expressive human subject on the far RIGHT side of the frame. ${styleDesc} style. ${colorDesc} color scheme. The left half of the image is naturally dark and empty. ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS in the image.`,
         text_panels: [
            { text: "MUST WATCH", role: "intro", color: "#FFFFFF", bgColor: null, fontSizeMultiplier: 1.0, bold: false, allCaps: true },
            {
               text: title.toUpperCase().split(" ").slice(0, 3).join(" "),
               role: "title",
               color: "#FFD700",
               bgColor: null,
               fontSizeMultiplier: 1.0,
               bold: true,
               allCaps: true,
            },
         ],
         info_badges: [],
         corner_decorations: [],
         star_callout: null,
         subscriber_callout: null,
      };
   }
}

async function generateWithSDXL(prompt: string, width: number, height: number): Promise<Buffer> {
   const sdxlUrl = `https:
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

function escapeXml(s: string): string {
   return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
}

const badgeIconSymbols: Record<string, string> = {
   rupee:    "&#x20B9;", 
   star:     "&#x2605;", 
   book:     "&#x2261;", 
   building: "&#x2302;", 
   play:     "&#x25B6;", 
   users:    "&#x25A0;", 
   chart:    "&#x25B2;", 
   check:    "&#x2713;", 
};

function renderInfoBadge(
   cx: number,
   cy: number,
   badge: IInfoBadge,
   radius: number,
): string {
   const icon = badgeIconSymbols[badge.icon] || "&#x25CF;";
   const iconFs = Math.floor(radius * 0.85);
   const labelFs = Math.floor(radius * 0.50);
   const ringW = Math.max(2, Math.floor(radius * 0.09));

   return `<g filter="url(#badgeShadow)">
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="#FFFFFF" opacity="0.97"/>
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#FFD700" stroke-width="${ringW * 1.5}"/>
      <text x="${cx}" y="${cy + Math.floor(iconFs * 0.35)}" text-anchor="middle"
         font-family="Arial,Helvetica,sans-serif" font-size="${iconFs}"
         fill="#1a1a2e" font-weight="bold">${icon}</text>
      <text x="${cx}" y="${cy + radius + Math.floor(labelFs * 1.55)}" text-anchor="middle"
         font-family="'Arial Black','Impact',sans-serif" font-size="${labelFs}"
         fill="#FFFFFF" font-weight="900" letter-spacing="0.5"
         filter="url(#dropShadow)">${escapeXml(badge.label.toUpperCase())}</text>
   </g>`;
}

function renderCornerDecoration(
   width: number,
   height: number,
   dec: ICornerDecoration,
): string {
   const isRibbon = dec.type === "ribbon";
   const s = isRibbon ? Math.floor(width * 0.115) : Math.floor(width * 0.082);
   const labelFs = Math.floor(s * 0.27);
   const opacity = isRibbon ? 0.93 : 0.97;

   switch (dec.position) {
      case "top-left": {
         const pts = `0,0 ${s},0 0,${s}`;
         const lx = Math.floor(s * 0.30);
         const ly = Math.floor(s * 0.42);
         return `<g filter="url(#badgeShadow)">
            <polygon points="${pts}" fill="${dec.color}" opacity="${opacity}"/>
            ${dec.label
               ? `<text x="${lx}" y="${ly}" text-anchor="middle"
                  transform="rotate(-45 ${lx} ${ly})"
                  font-family="'Impact','Arial Black',sans-serif"
                  font-size="${labelFs}" fill="#FFFFFF" font-weight="900">${escapeXml(dec.label)}</text>`
               : ""}
         </g>`;
      }
      case "top-right": {
         const pts = `${width},0 ${width - s},0 ${width},${s}`;
         return `<g filter="url(#badgeShadow)">
            <polygon points="${pts}" fill="${dec.color}" opacity="${opacity}"/>
         </g>`;
      }
      case "bottom-left": {
         const pts = `0,${height} ${s},${height} 0,${height - s}`;
         return `<g filter="url(#badgeShadow)">
            <polygon points="${pts}" fill="${dec.color}" opacity="${opacity}"/>
         </g>`;
      }
      case "bottom-right": {
         const pts = `${width},${height} ${width - s},${height} ${width},${height - s}`;
         return `<g filter="url(#badgeShadow)">
            <polygon points="${pts}" fill="${dec.color}" opacity="${opacity}"/>
         </g>`;
      }
      default:
         return "";
   }
}

function renderStarCallout(
   x: number,
   y: number,
   label: string,
   scale: number,
): string {
   const w = Math.floor(220 * scale);
   const h = Math.floor(72 * scale);
   const rx = Math.floor(h * 0.22);
   const starFs = Math.floor(36 * scale);
   const textFs = Math.floor(22 * scale);
   return `<g filter="url(#badgeShadow)">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#FFD700" opacity="0.97"/>
      <text x="${x + Math.floor(w * 0.18)}" y="${y + Math.floor(h * 0.70)}" text-anchor="middle"
         font-family="Arial,Helvetica,sans-serif" font-size="${starFs}" fill="#E65100">&#x2605;</text>
      <text x="${x + Math.floor(w * 0.60)}" y="${y + Math.floor(h * 0.68)}" text-anchor="middle"
         font-family="'Impact','Arial Black',sans-serif" font-size="${textFs}"
         fill="#1a1a1a" font-weight="900">${escapeXml(label.toUpperCase())}</text>
   </g>`;
}

function renderSubscriberBadge(
   x: number,
   y: number,
   count: string,
   scale: number,
): string {
   const w = Math.floor(150 * scale);
   const h = Math.floor(54 * scale);
   const rx = Math.floor(h * 0.35);
   const textFs = Math.floor(26 * scale);
   const dotFs = Math.floor(20 * scale);
   return `<g filter="url(#badgeShadow)">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"
         fill="rgba(0,0,0,0.82)" stroke="#FFFFFF" stroke-width="${Math.max(1, Math.floor(2 * scale))}"/>
      <text x="${x + Math.floor(w * 0.20)}" y="${y + Math.floor(h * 0.68)}" text-anchor="middle"
         font-family="Arial,sans-serif" font-size="${dotFs}" fill="#AAAAFF">&#x25CF;</text>
      <text x="${x + Math.floor(w * 0.63)}" y="${y + Math.floor(h * 0.68)}" text-anchor="middle"
         font-family="'Impact','Arial Black',sans-serif" font-size="${textFs}"
         fill="#FFFFFF" font-weight="900">${escapeXml(count)}</text>
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

   const {
      layout_style,
      panel_color,
      panel_opacity,
      text_panels,
      info_badges,
      corner_decorations,
      star_callout,
      subscriber_callout,
   } = plan;

   const scale = width / 1280;
   const baseFontSize = Math.floor(width / 13);   
   const padding = Math.floor(width * 0.048);      
   const featherW = Math.floor(width * 0.07);      
   const lineSpacing = 1.22;

   const textZoneWidth = layout_style === "center" ? width : Math.floor(width * 0.50);
   const textZoneX = layout_style === "split_right" ? Math.floor(width * 0.50) : 0;
   const imageZoneX = layout_style === "split_right" ? 0 : (layout_style === "center" ? 0 : Math.floor(width * 0.50));
   const imageZoneWidth = layout_style === "center" ? width : Math.floor(width * 0.50);

   let textX: number;
   let svgTextAnchor: string;
   if (layout_style === "split_left") {
      textX = padding;
      svgTextAnchor = "start";
   } else if (layout_style === "split_right") {
      textX = textZoneX + padding;
      svgTextAnchor = "start";
   } else {
      textX = width / 2;
      svgTextAnchor = "middle";
   }

   const roleFsMap: Record<string, number> = {
      intro: 0.52,
      title: 1.30,
      subtitle: 0.78,
      cta: 0.70,
   };

   const maxTextWidth = textZoneWidth > width * 0.6 ? textZoneWidth * 0.9 : width * 0.53; 

   const lineFontSizes: number[] = text_panels.map((p) => {
      const intendedFs = baseFontSize * (roleFsMap[p.role] ?? 1.0) * (p.fontSizeMultiplier ?? 1.0);
      
      const estCharWidthFactor = p.allCaps !== false ? 0.60 : 0.55;
      const estimatedWidth = p.text.length * intendedFs * estCharWidthFactor;
      
      if (estimatedWidth > maxTextWidth) {
         
         return Math.floor(maxTextWidth / (p.text.length * estCharWidthFactor));
      }
      return Math.floor(intendedFs);
   });

   const totalTextH = lineFontSizes.reduce((sum, fs) => sum + fs * lineSpacing, 0);

   let startY: number;
   if (layout_style === "center") {
      startY = height * 0.56 - totalTextH / 2;
   } else {
      startY = height / 2 - totalTextH / 2;
   }
   
   startY = Math.max(padding, Math.min(startY, height - totalTextH - padding));

   const pOpacity = Math.min(0.98, Math.max(0, panel_opacity ?? 0.90));
   const safeColor = panel_color || "#0a0a1a";

   const svgParts: string[] = [];

   if (layout_style === "split_left") {
      
      svgParts.push(
         `<rect x="0" y="0" width="${textZoneWidth + featherW}" height="${height}" fill="url(#panelGrad)"/>`,
      );
   } else if (layout_style === "split_right") {
      
      svgParts.push(
         `<rect x="${textZoneX - featherW}" y="0" width="${textZoneWidth + featherW}" height="${height}" fill="url(#panelGrad)"/>`,
      );
   } else {
      
      svgParts.push(
         `<rect x="0" y="${Math.floor(height * 0.40)}" width="${width}" height="${Math.floor(height * 0.60)}" fill="url(#centerGrad)"/>`,
      );
   }

   let currentY = startY;
   for (let i = 0; i < text_panels.length; i++) {
      const panel = text_panels[i];
      const fs = lineFontSizes[i];
      const lineBottom = currentY + fs;
      const raw = panel.allCaps !== false ? panel.text.toUpperCase() : panel.text;
      const escaped = escapeXml(raw);
      const strokeW = Math.max(2, Math.floor(fs / 13));
      const fontWeight = panel.bold ? "900" : "700";
      const letterSpacing = panel.role === "title" ? "3" : "1";

      if (panel.bgColor) {
         const vPad = Math.floor(fs * 0.22);
         const bannerH = fs + vPad * 2;
         const bannerY = currentY - vPad;
         const textWidth = raw.length * fs * (panel.allCaps !== false ? 0.60 : 0.55);
         
         let stripWidth = textZoneWidth;
         if (layout_style !== "center") {
             stripWidth = Math.min(textZoneWidth, textWidth + padding * 2);
         }
         
         if (layout_style === "split_left") {
            svgParts.push(
               `<rect x="0" y="${bannerY}" width="${stripWidth}" height="${bannerH}" fill="${panel.bgColor}"/>`,
            );
         } else if (layout_style === "split_right") {
            svgParts.push(
               `<rect x="${width - stripWidth}" y="${bannerY}" width="${stripWidth}" height="${bannerH}" fill="${panel.bgColor}"/>`,
            );
         } else {
            svgParts.push(
               `<rect x="${padding}" y="${bannerY}" width="${width - padding * 2}" height="${bannerH}" fill="${panel.bgColor}" rx="${Math.floor(bannerH * 0.10)}"/>`,
            );
         }
      }

      svgParts.push(`<g filter="url(#dropShadow)">`);
      
      svgParts.push(
         `<text x="${textX}" y="${lineBottom}" text-anchor="${svgTextAnchor}"
            font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
            font-size="${fs}" font-weight="${fontWeight}" letter-spacing="${letterSpacing}"
            fill="none" stroke="#000000" stroke-width="${strokeW * 2.5}" stroke-linejoin="round"
            opacity="0.90">${escaped}</text>`,
      );
      
      svgParts.push(
         `<text x="${textX}" y="${lineBottom}" text-anchor="${svgTextAnchor}"
            font-family="'Impact','Arial Black','Helvetica Neue',sans-serif"
            font-size="${fs}" font-weight="${fontWeight}" letter-spacing="${letterSpacing}"
            fill="${panel.color}">${escaped}</text>`,
      );
      svgParts.push(`</g>`);

      currentY += fs * lineSpacing;
   }

   if (info_badges && info_badges.length > 0) {
      const badgeR = Math.floor(width * 0.045);  
      const colGap = Math.floor(width * 0.14);   
      const rowGap = Math.floor(height * 0.28);  
      const cols = 2;
      const rows = Math.ceil(info_badges.length / cols);
      const gridW = (cols - 1) * colGap;
      const gridH = (rows - 1) * rowGap;

      let gridCX: number;
      if (layout_style === "split_left") {
         gridCX = imageZoneX + Math.floor(imageZoneWidth * 0.42);
      } else if (layout_style === "split_right") {
         gridCX = imageZoneX + Math.floor(imageZoneWidth * 0.58);
      } else {
         gridCX = Math.floor(width * 0.80);
      }
      const gridCY = height * 0.50;
      const gridStartX = gridCX - gridW / 2;
      const gridStartY = gridCY - gridH / 2;

      for (let bi = 0; bi < info_badges.length; bi++) {
         const col = bi % cols;
         const row = Math.floor(bi / cols);
         const bx = gridStartX + col * colGap;
         const by = gridStartY + row * rowGap;
         svgParts.push(renderInfoBadge(bx, by, info_badges[bi], badgeR));
      }
   }

   for (const dec of (corner_decorations ?? [])) {
      svgParts.push(renderCornerDecoration(width, height, dec));
   }

   if (star_callout?.show) {
      let scX: number;
      if (layout_style === "split_left") {
         scX = imageZoneX + Math.floor(imageZoneWidth * 0.05);
      } else {
         scX = imageZoneX + Math.floor(imageZoneWidth * 0.54);
      }
      svgParts.push(renderStarCallout(scX, Math.floor(height * 0.05), star_callout.label, scale));
   }

   if (subscriber_callout?.show && subscriber_callout.counts?.length > 0) {
      let scX: number;
      if (layout_style === "split_left") {
         scX = imageZoneX + Math.floor(imageZoneWidth * 0.04);
      } else if (layout_style === "split_right") {
         scX = imageZoneX + Math.floor(imageZoneWidth * 0.52);
      } else {
         scX = Math.floor(width * 0.62);
      }
      for (let ci = 0; ci < Math.min(subscriber_callout.counts.length, 3); ci++) {
         const cy = Math.floor(height * 0.20) + ci * Math.floor(height * 0.16);
         svgParts.push(renderSubscriberBadge(scX, cy, subscriber_callout.counts[ci], scale));
      }
   }

   let panelGradDef: string;
   if (layout_style === "split_left") {
      
      const solidPct = Math.floor(100 * (textZoneWidth / (textZoneWidth + featherW)));
      panelGradDef = `<linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0%"           stop-color="${safeColor}" stop-opacity="${pOpacity}"/>
         <stop offset="${solidPct}%" stop-color="${safeColor}" stop-opacity="${pOpacity}"/>
         <stop offset="100%"         stop-color="${safeColor}" stop-opacity="0"/>
      </linearGradient>`;
   } else if (layout_style === "split_right") {
      
      const fadePct = Math.floor(100 * (featherW / (textZoneWidth + featherW)));
      panelGradDef = `<linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0%"          stop-color="${safeColor}" stop-opacity="0"/>
         <stop offset="${fadePct}%" stop-color="${safeColor}" stop-opacity="${pOpacity}"/>
         <stop offset="100%"        stop-color="${safeColor}" stop-opacity="${pOpacity}"/>
      </linearGradient>`;
   } else {
      panelGradDef = `<linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%"   stop-color="#000000" stop-opacity="0"/>
         <stop offset="100%" stop-color="#000000" stop-opacity="0.85"/>
      </linearGradient>`;
   }

   const svgOverlay = `<svg width="${width}" height="${height}" xmlns="http:
   <defs>
      ${panelGradDef}
      <linearGradient id="centerGrad" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%"   stop-color="#000000" stop-opacity="0"/>
         <stop offset="35%"  stop-color="#000000" stop-opacity="0.50"/>
         <stop offset="100%" stop-color="#000000" stop-opacity="0.90"/>
      </linearGradient>
      <filter id="dropShadow" x="-15%" y="-15%" width="130%" height="130%">
         <feDropShadow dx="3" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.95"/>
      </filter>
      <filter id="badgeShadow" x="-30%" y="-30%" width="160%" height="160%">
         <feDropShadow dx="2" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.75"/>
      </filter>
   </defs>
   ${svgParts.join("\n   ")}
</svg>`;

   const result = await sharp(imageBuffer)
      .resize(width, height, { fit: "cover" })
      .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
      .png()
      .toBuffer();

   console.log(`[Sharp] Professional overlay applied. Final size: ${(result.length / 1024).toFixed(1)} KB`);
   return result;
}

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

      let layoutPlan: ILayoutPlan;
      if (text_overlay) {
         layoutPlan = await analyzeTitleAndPlanLayout(title, user_prompt, style, color_scheme);
      } else {
         
         const styleDesc =
            stylePrompts[style as keyof typeof stylePrompts] || stylePrompts["Bold & Graphic"];
         const colorDesc =
            colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions] || "";
         layoutPlan = {
            layout_style: "center",
            panel_color: "#0a0a1a",
            panel_opacity: 0.0,
            image_prompt: `A highly professional YouTube thumbnail background. Style: ${styleDesc}. Color: ${colorDesc}. Topic: "${title}". ABSOLUTELY NO TEXT, LETTERS, WORDS, or TYPOGRAPHY in the image.`,
            text_panels: [],
            info_badges: [],
            corner_decorations: [],
            star_callout: null,
            subscriber_callout: null,
         };
      }

      const imagePrompt =
         layoutPlan.image_prompt +
         " ABSOLUTELY NO TEXT, LETTERS, WORDS, NUMBERS, WATERMARKS, SIGNS, OR TYPOGRAPHY ANYWHERE IN THE IMAGE. The image must be 100% text-free.";

      const rawImageBuffer = await generateWithSDXL(imagePrompt, width, height);

      const finalBuffer = await overlayDynamicLayout(
         rawImageBuffer,
         layoutPlan,
         width,
         height,
         text_overlay,
      );

      console.log(`=== Thumbnail Generation Complete ===\n`);

      const uploadResult: any = await new Promise((resolve, reject) => {
         cloudinary.uploader
            .upload_stream({ resource_type: "image" }, (error, result) => {
               if (error) reject(error);
               else resolve(result);
            })
            .end(finalBuffer);
      });

      thumbnail.image_url = uploadResult.url;
      thumbnail.prompt_used = imagePrompt;
      thumbnail.isGenerating = false;
      await thumbnail.save();

      res.json({ message: "Thumbnail Generated", thumbnail });
   } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.message });
   }
};

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
