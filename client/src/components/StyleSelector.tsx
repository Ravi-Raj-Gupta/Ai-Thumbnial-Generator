import {
   useCallback,
   useEffect,
   useId,
   useLayoutEffect,
   useRef,
   useState,
   type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { ThumbnailStyle } from "../assets/assets";
import { thumbnailStyles } from "../assets/assets";
import {
   ChevronDownIcon,
   CpuIcon,
   ImageIcon,
   PenToolIcon,
   SparkleIcon,
   SquareIcon,
} from "lucide-react";

const StyleSelector = ({
   value,
   onChange,
   isOpen,
   setIsOpen,
}: {
   value: ThumbnailStyle;
   onChange: (style: ThumbnailStyle) => void;
   isOpen: boolean;
   setIsOpen: (isOpen: boolean) => void;
}) => {
   const id = useId();
   const triggerRef = useRef<HTMLButtonElement>(null);
   const panelRef = useRef<HTMLDivElement>(null);
   const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });

   const styleDescriptions: Record<ThumbnailStyle, string> = {
      "Bold & Graphic": "High contrast, bold typography, striking visuals",
      Minimalist: "Clean, simple, lots of white space",
      Photorealistic: "Photo-based, natural looking",
      Illustrated: "Hand-drawn, artistic, creative",
      "Tech/Futuristic": "Modern, sleek, tech-inspired",
   };

   const styleIcons: Record<ThumbnailStyle, ReactNode> = {
      "Bold & Graphic": (
         <SparkleIcon className="size-5 shrink-0 text-pink-400/90" />
      ),
      Minimalist: <SquareIcon className="size-5 shrink-0 text-zinc-300" />,
      Photorealistic: <ImageIcon className="size-5 shrink-0 text-sky-400/90" />,
      Illustrated: (
         <PenToolIcon className="size-5 shrink-0 text-amber-400/90" />
      ),
      "Tech/Futuristic": (
         <CpuIcon className="size-5 shrink-0 text-violet-400/90" />
      ),
   };

   const updateMenuPosition = useCallback(() => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const estimatedPanelHeight = 260; // approximate height of dropdown
      setMenuPos({
         top: rect.top - estimatedPanelHeight - 8,
         left: rect.left,
         width: rect.width,
      });
   }, []);

   useLayoutEffect(() => {
      if (!isOpen) return;
      updateMenuPosition();
      const w = window;
      w.addEventListener("resize", updateMenuPosition);
      w.addEventListener("scroll", updateMenuPosition, true);
      return () => {
         w.removeEventListener("resize", updateMenuPosition);
         w.removeEventListener("scroll", updateMenuPosition, true);
      };
   }, [isOpen, updateMenuPosition]);

   useEffect(() => {
      if (!isOpen) return;
      const onDoc = (e: PointerEvent) => {
         const t = e.target as Node;
         if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) {
            return;
         }
         setIsOpen(false);
      };
      document.addEventListener("pointerdown", onDoc, true);
      return () => document.removeEventListener("pointerdown", onDoc, true);
   }, [isOpen, setIsOpen]);

   useEffect(() => {
      if (!isOpen) return;
      const onKey = (e: KeyboardEvent) => {
         if (e.key === "Escape") setIsOpen(false);
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
   }, [isOpen, setIsOpen]);

   const dropdown =
      isOpen &&
      createPortal(
         <div
            ref={panelRef}
            role="listbox"
            aria-label="Thumbnail style"
            className="fixed z-[60] overflow-hidden rounded-lg border border-white/10 bg-black/40 shadow-xl shadow-black/50 backdrop-blur-md"
            style={{
               top: menuPos.top,
               left: menuPos.left,
               width: Math.max(menuPos.width, 200),
            }}
         >
            <ul className="max-h-[min(22rem,calc(100vh-8rem))] overflow-y-auto py-2">
               {thumbnailStyles.map((style) => {
                  const selected = value === style;
                  return (
                     <li key={style}>
                        <button
                           type="button"
                           role="option"
                           aria-selected={selected}
                           onClick={() => {
                              onChange(style);
                              setIsOpen(false);
                           }}
                           className={[
                              "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                              selected
                                 ? "bg-white/10 text-white"
                                 : "text-white/70 hover:bg-white/5 hover:text-white",
                           ].join(" ")}
                        >
                           <span
                              className={[
                                 "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded border transition-colors",
                                 selected
                                    ? "border-white/20 bg-white/10"
                                    : "border-white/15 bg-transparent",
                              ].join(" ")}
                           >
                              {styleIcons[style]}
                           </span>
                           <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                 <span className="font-semibold text-sm">
                                    {style}
                                 </span>
                              </span>
                              <span className="mt-1 block text-xs leading-snug text-white/50">
                                 {styleDescriptions[style]}
                              </span>
                           </span>
                        </button>
                     </li>
                  );
               })}
            </ul>
         </div>,
         document.body,
      );

   return (
      <div className="relative overflow-visible">
         <label
            htmlFor={id}
            className="block text-sm mb-2 font-medium text-zinc-100"
         >
            Style
         </label>
         <button
            ref={triggerRef}
            id={id}
            type="button"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            onClick={() => setIsOpen(!isOpen)}
            className="group w-full flex items-start justify-between gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-left text-white transition-all duration-200 hover:bg-white/[0.08] hover:border-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            data-open={isOpen}
         >
            <div className="flex min-w-0 flex-1 items-start gap-3">
               <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 transition-colors group-hover:bg-white/10">
                  {styleIcons[value]}
               </span>
               <div className="min-w-0 space-y-1">
                  <span className="block text-sm font-medium leading-tight">
                     {value}
                  </span>
                  <p className="text-xs leading-snug text-white/40">
                     {styleDescriptions[value]}
                  </p>
               </div>
            </div>
            <ChevronDownIcon
               className={[
                  "mt-1 h-4 w-4 shrink-0 text-white/40 transition-transform duration-200",
                  isOpen ? "rotate-180 text-white/60" : "",
               ].join(" ")}
            />
         </button>
         {dropdown}
      </div>
   );
};

export default StyleSelector;
