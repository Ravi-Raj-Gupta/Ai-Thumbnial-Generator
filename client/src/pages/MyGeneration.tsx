import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, Eye, ImagePlus, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { IThumbnail } from "../assets/assets";
import Softbackdrop from "../components/Softbackdrop";
import api from "../configs/api";
import { useAuth } from "../context/AuthContext";

const aspectRatioClassMap: Record<string, string> = {
   "16:9": "aspect-[16/9]",
   "1:1": "aspect-square",
   "9:16": "aspect-[9/16]",
};

const statusOptions = ["all", "ready", "generating"] as const;
type FilterStatus = (typeof statusOptions)[number];

const MyGeneration = () => {
   const navigate = useNavigate();
   const { isLoggedIn } = useAuth();
   const [thumbnails, setThumbnails] = useState<IThumbnail[]>([]);
   const [loading, setLoading] = useState(true);
   const [deleteId, setDeleteId] = useState<string | null>(null);
   const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

   const fetchThumbnails = async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!isLoggedIn) {
         setLoading(false);
         return;
      }

      if (!silent) {
         setLoading(true);
      }

      try {
         const { data } = await api.get("/api/user/thumbnails");
         setThumbnails((data?.thumbnail as IThumbnail[]) ?? []);
      } catch (error: any) {
         toast.error(error?.response?.data?.message || error.message || "Unable to load thumbnails");
      } finally {
         if (!silent) {
            setLoading(false);
         }
      }
   };

   useEffect(() => {
      void fetchThumbnails();
   }, [isLoggedIn]);

   useEffect(() => {
      if (!isLoggedIn || !thumbnails.some((item) => item.isGenerating)) {
         return;
      }

      const interval = setInterval(() => {
         void fetchThumbnails({ silent: true });
      }, 5000);

      return () => clearInterval(interval);
   }, [isLoggedIn, thumbnails]);

   const filteredThumbnails = useMemo(() => {
      if (statusFilter === "ready") {
         return thumbnails.filter((item) => !item.isGenerating);
      }

      if (statusFilter === "generating") {
         return thumbnails.filter((item) => item.isGenerating);
      }

      return thumbnails;
   }, [statusFilter, thumbnails]);

   const handleDelete = async (
      event: MouseEvent<HTMLButtonElement>,
      thumbnailId: string,
   ) => {
      event.stopPropagation();
      try {
         setDeleteId(thumbnailId);
         const { data } = await api.delete(`/api/thumbnail/delete/${thumbnailId}`);
         setThumbnails((current) => current.filter((item) => item._id !== thumbnailId));
         toast.success(data?.message || "Thumbnail deleted");
      } catch (error: any) {
         toast.error(error?.response?.data?.message || error.message || "Unable to delete thumbnail");
      } finally {
         setDeleteId(null);
      }
   };

   const handleDownload = (event: MouseEvent<HTMLButtonElement>, thumb: IThumbnail) => {
      event.stopPropagation();
      if (!thumb.image_url) {
         return;
      }

      const link = document.createElement("a");
      link.href = thumb.image_url;
      link.download = `${thumb.title.replace(/\s+/g, "-").toLowerCase() || "thumbnail"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   if (!isLoggedIn) {
      return (
         <>
            <Softbackdrop />
            <div className="flex min-h-screen items-center justify-center px-6 pt-24 text-center md:px-16 lg:px-24 xl:px-32">
               <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-2xl backdrop-blur">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-pink-400/30 bg-pink-500/10 text-pink-200">
                     <ImagePlus className="size-7" />
                  </div>
                  <h1 className="mt-6 text-3xl font-bold text-white">
                     Save and manage all your generations in one place
                  </h1>
                  <p className="mt-3 leading-7 text-zinc-300">
                     Login first to see your saved thumbnails, track in-progress generations,
                     preview results, and clean up old drafts.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                     <Link
                        to="/login"
                        className="rounded-2xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-500"
                     >
                        Login to continue
                     </Link>
                     <Link
                        to="/generate"
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
                     >
                        Go to generator
                     </Link>
                  </div>
               </div>
            </div>
         </>
      );
   }

   return (
      <>
         <Softbackdrop />
         <div className="min-h-screen px-6 pb-20 pt-32 md:px-16 lg:px-24 xl:px-32">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
               <div>
                  <h1 className="text-3xl font-bold text-zinc-100">My Generations</h1>
                  <p className="mt-2 text-sm text-zinc-400">
                     View, preview, download, and manage your AI-generated thumbnails.
                  </p>
               </div>

               <div className="flex flex-wrap items-center gap-3">
                  {statusOptions.map((option) => {
                     const isActive = statusFilter === option;
                     return (
                        <button
                           key={option}
                           type="button"
                           onClick={() => setStatusFilter(option)}
                           className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                              isActive
                                 ? "bg-pink-600 text-white"
                                 : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                           }`}
                        >
                           {option}
                        </button>
                     );
                  })}
                  <button
                     type="button"
                     onClick={() => void fetchThumbnails()}
                     className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
                  >
                     Refresh
                  </button>
               </div>
            </div>

            {loading && (
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                     <div
                        key={index}
                        className="rounded-2xl border border-white/10 bg-white/6 p-3"
                     >
                        <div className="h-[260px] animate-pulse rounded-2xl bg-white/10" />
                     </div>
                  ))}
               </div>
            )}

            {!loading && filteredThumbnails.length === 0 && (
               <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-10 text-center">
                  <h2 className="text-xl font-semibold text-zinc-100">
                     {thumbnails.length === 0
                        ? "No thumbnails generated yet"
                        : `No ${statusFilter} thumbnails found`}
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                     Start a new generation and your thumbnails will appear here automatically.
                  </p>
                  <button
                     type="button"
                     onClick={() => navigate("/generate")}
                     className="mt-6 rounded-2xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-500"
                  >
                     Generate thumbnail
                  </button>
               </div>
            )}

            {!loading && filteredThumbnails.length > 0 && (
               <div className="columns-1 gap-8 sm:columns-2 lg:columns-3 2xl:columns-4">
                  {filteredThumbnails.map((thumb) => {
                     const aspectClass =
                        aspectRatioClassMap[thumb.aspect_ratio ?? "16:9"] ?? aspectRatioClassMap["16:9"];
                     const imageUrl = thumb.image_url;

                     return (
                        <div
                           key={thumb._id}
                           onClick={() => navigate(`/generate/${thumb._id}`)}
                           className="group relative mb-8 cursor-pointer break-inside-avoid rounded-2xl border border-white/10 bg-white/6 shadow-xl transition hover:border-white/20"
                        >
                           <div
                              className={`relative overflow-hidden rounded-t-2xl bg-black ${aspectClass}`}
                           >
                              {thumb.image_url ? (
                                 <img
                                    src={thumb.image_url}
                                    alt={thumb.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                 />
                              ) : (
                                 <div className="flex h-full min-h-[260px] items-center justify-center text-sm text-zinc-300">
                                    {thumb.isGenerating
                                       ? "Generating thumbnail..."
                                       : "Thumbnail unavailable"}
                                 </div>
                              )}

                              {thumb.isGenerating && (
                                 <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 text-sm font-medium text-white">
                                    <Loader2 className="size-4 animate-spin" />
                                    Generating...
                                 </div>
                              )}
                           </div>

                           <div className="space-y-3 p-4">
                              <div>
                                 <h2 className="line-clamp-2 text-base font-semibold text-zinc-100">
                                    {thumb.title}
                                 </h2>
                                 <p className="mt-1 text-sm text-zinc-400">{thumb.style}</p>
                              </div>

                              <div className="flex items-center justify-between gap-3 text-xs text-zinc-400">
                                 <span>{thumb.aspect_ratio ?? "16:9"}</span>
                                 <span>{thumb.color_scheme ?? "vibrant"}</span>
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                 <div className="min-w-0 text-xs text-zinc-500">
                                    Created:{" "}
                                    {thumb.createdAt
                                       ? new Date(thumb.createdAt).toLocaleDateString()
                                       : "N/A"}
                                 </div>

                                 <div className="flex shrink-0 gap-2">
                                    {imageUrl && (
                                       <button
                                          type="button"
                                          onClick={(event) => {
                                             event.stopPropagation();
                                             const previewParams = new URLSearchParams({
                                                thumbnail_url: imageUrl,
                                                title: thumb.title,
                                             });
                                             navigate(`/preview?${previewParams.toString()}`);
                                          }}
                                          title="Preview"
                                          className="flex items-center justify-center rounded-lg border border-white/10 p-2 text-zinc-100 transition hover:bg-white/10"
                                       >
                                          <Eye size={18} />
                                       </button>
                                    )}
                                    {imageUrl && (
                                       <button
                                          type="button"
                                          onClick={(event) => handleDownload(event, thumb)}
                                          title="Download"
                                          className="flex items-center justify-center rounded-lg border border-white/10 p-2 text-zinc-100 transition hover:bg-white/10"
                                       >
                                          <Download size={18} />
                                       </button>
                                    )}
                                    <button
                                       type="button"
                                       disabled={deleteId === thumb._id}
                                       onClick={(event) => void handleDelete(event, thumb._id)}
                                       title="Delete"
                                       className="flex items-center justify-center rounded-lg border border-red-400/30 p-2 text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                       {deleteId === thumb._id ? (
                                          <Loader2 size={18} className="animate-spin" />
                                       ) : (
                                          <Trash2 size={18} />
                                       )}
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>
      </>
   );
};

export default MyGeneration;
