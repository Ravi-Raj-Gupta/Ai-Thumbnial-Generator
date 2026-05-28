import { DownloadIcon, ImageIcon, Loader2Icon } from "lucide-react";
import type { AspectRatio, IThumbnail } from "../assets/assets";

const PreviewPanel = ({
   thumbnail,
   isLoading,
   aspectRatio,
}: {
   thumbnail: IThumbnail | null;
   isLoading: boolean;
   aspectRatio: AspectRatio;
}) => {
   const aspectClasses = {
      "16:9": "aspect-video",
      "1:1": "aspect-square",
      "9:16": "aspect-[9/16]",
   } as Record<AspectRatio, string>;

   const onDownload = async () => {
      if (!thumbnail?.image_url) return;

      try {
         const response = await fetch(thumbnail.image_url);
         const blob = await response.blob();
         const blobUrl = URL.createObjectURL(blob);

         const link = document.createElement("a");
         link.href = blobUrl;
         link.download = `${thumbnail.title.replace(/\s+/g, "-").toLowerCase() || "thumbnail"}.png`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);

         URL.revokeObjectURL(blobUrl);
      } catch {
         
         window.open(thumbnail.image_url, "_blank");
      }
   };

   return (
      <div className="relative mx-auto w-full max-w-2xl">
         <div
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 ${aspectClasses[aspectRatio]}`}
         >
            {isLoading && (
               <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40">
                  <Loader2Icon className="size-8 animate-spin text-zinc-400" />
                  <div className="text-center">
                     <p className="mt-1 text-sm text-zinc-200">
                        AI is creating your thumbnail
                     </p>
                     <p className="text-xs text-zinc-400">This may take 10 to 20 seconds</p>
                  </div>
               </div>
            )}

            {!isLoading && thumbnail?.image_url && (
               <div className="group relative h-full w-full">
                  <img
                     className="h-full w-full object-cover"
                     src={thumbnail.image_url}
                     alt={thumbnail.title}
                  />
                  <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                     <button
                        onClick={onDownload}
                        type="button"
                        className="mb-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition-all hover:scale-105 hover:shadow-pink-500/40 active:scale-95"
                     >
                        <DownloadIcon className="size-4" />
                        Download Thumbnail
                     </button>
                  </div>
               </div>
            )}

            {!isLoading && !thumbnail?.image_url && (
               <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-white/20 bg-white/10">
                  <div className="flex size-20 items-center justify-center rounded-full bg-white/10 max-sm:hidden">
                     <ImageIcon className="size-10 text-white opacity-50" />
                  </div>
                  <div className="px-4 text-center">
                     <p className="text-zinc-200">Generate your first thumbnail</p>
                     <p className="mt-1 text-xs text-zinc-300">
                        Fill out the form and click Generate.
                     </p>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default PreviewPanel;
