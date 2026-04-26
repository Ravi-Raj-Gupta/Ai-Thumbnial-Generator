import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { colorSchemes, type AspectRatio, type IThumbnail, type ThumbnailStyle } from "../assets/assets";
import Softbackdrop from "../components/Softbackdrop";
import AspectRatioSelector from "../components/AspectRatioSelector";
import StyleSelector from "../components/StyleSelector";
import ColorSchemeSelector from "../components/ColorSchemeSelector";
import PreviewPanel from "../components/PreviewPanel";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../configs/api";

const Generate = () => {
   const { id } = useParams();
   const { pathname } = useLocation();
   const navigate = useNavigate();
   const { isLoggedIn } = useAuth();

   const [title, setTitle] = useState("");
   const [additionalDetails, setAdditionalDetails] = useState("");
   const [thumbnail, setThumbnail] = useState<IThumbnail | null>(null);
   const [loading, setLoading] = useState(false);
   const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
   const [colorSchemeId, setColorSchemeId] = useState<string>(colorSchemes[0].id);
   const [style, setStyle] = useState<ThumbnailStyle>("Bold & Graphic");
   const [styledropdownopen, setStyledropdownopen] = useState(false);

   const resetForm = () => {
      setThumbnail(null);
      setTitle("");
      setAdditionalDetails("");
      setAspectRatio("16:9");
      setColorSchemeId(colorSchemes[0].id);
      setStyle("Bold & Graphic");
      setLoading(false);
   };

   const handleGenerateThumbnail = async () => {
      if (!isLoggedIn) {
         navigate("/login");
         return toast.error("Please login to generate thumbnails");
      }
      if (!title.trim()) {
         return toast.error("Title is required");
      }
      try {
         setLoading(true);
         const apiPayload = {
            title,
            prompt: additionalDetails,
            style,
            aspect_ratio: aspectRatio,
            color_scheme: colorSchemeId,
            text_overlay: true,
         };
         const { data } = await api.post("/api/thumbnail/generate", apiPayload);
         if (data.thumbnail) {
            setThumbnail(data.thumbnail as IThumbnail);
            navigate(`/generate/${data.thumbnail._id}`);
            toast.success(data.message || "Thumbnail generation started");
         }
      } catch (error: any) {
         toast.error(error?.response?.data?.message || error.message);
         setLoading(false);
      }
   };

   const fetchThumbnail = async () => {
      try {
         const { data } = await api.get(`/api/user/thumbnails/${id}`);
         const fetchedThumbnail = (data?.thumbnail || data?.thumbail) as IThumbnail | undefined;

         if (!fetchedThumbnail) {
            throw new Error("Thumbnail not found");
         }

         setThumbnail(fetchedThumbnail);
         setLoading(Boolean(fetchedThumbnail && !fetchedThumbnail.image_url));
         setAdditionalDetails(fetchedThumbnail.user_prompt || "");
         setTitle(fetchedThumbnail.title || "");
         setAspectRatio((fetchedThumbnail.aspect_ratio || "16:9") as AspectRatio);
         setStyle(fetchedThumbnail.style);
         setColorSchemeId(fetchedThumbnail.color_scheme || colorSchemes[0].id);
      } catch (error: any) {
         toast.error(error?.response?.data?.message || error.message);
      }
   };

   useEffect(() => {
      if (isLoggedIn && id) {
         void fetchThumbnail();
      }
   }, [id, isLoggedIn]);

   useEffect(() => {
      if (!id || !loading || !isLoggedIn) {
         return;
      }

      const interval = setInterval(() => {
         void fetchThumbnail();
      }, 5000);

      return () => clearInterval(interval);
   }, [id, loading, isLoggedIn]);

   useEffect(() => {
      if (!id && pathname === "/generate") {
         resetForm();
      }
   }, [id, pathname]);

   return (
      <>
         <Softbackdrop />
         <div className="min-h-screen pt-24">
            <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:pb-8">
               <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
                  <div className={`space-y-6 ${id ? "pointer-events-none opacity-85" : ""}`}>
                     <div className="space-y-6 rounded-2xl border border-white/12 bg-white/8 p-6 shadow-2xl">
                        <div>
                           <h2 className="mb-1 text-xl font-bold text-zinc-100">
                              Create your thumbnail
                           </h2>
                           <p className="text-sm text-zinc-400">
                              Describe your video and let AI bring it to life.
                           </p>
                        </div>
                        <div className="space-y-5">
                           <div>
                              <label htmlFor="title" className="mb-2 block text-sm font-medium">
                                 Title or topic
                              </label>
                              <input
                                 id="title"
                                 type="text"
                                 value={title}
                                 onChange={(e) => setTitle(e.target.value)}
                                 maxLength={100}
                                 placeholder="eg. 10 tips for better sleep"
                                 className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-3.5 text-zinc-50 placeholder:text-zinc-400 focus:ring-2 focus:ring-pink-500"
                              />
                              <div className="flex justify-end">
                                 <span className="text-sm text-zinc-400">{title.length}/100</span>
                              </div>
                           </div>

                           <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />

                           <StyleSelector
                              value={style}
                              onChange={setStyle}
                              isOpen={styledropdownopen}
                              setIsOpen={setStyledropdownopen}
                           />

                           <ColorSchemeSelector value={colorSchemeId} onChange={setColorSchemeId} />

                           <div className="space-y-2">
                              <label htmlFor="details" className="mb-2 block text-sm font-medium">
                                 Additional prompts <span className="text-xs text-zinc-400">(optional)</span>
                              </label>
                              <textarea
                                 id="details"
                                 value={additionalDetails}
                                 onChange={(e) => setAdditionalDetails(e.target.value)}
                                 rows={3}
                                 className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                 placeholder="Add any specific style, mood, or preferences..."
                              />
                           </div>
                        </div>

                        {!id && (
                           <button
                              onClick={handleGenerateThumbnail}
                              disabled={loading}
                              className="w-full rounded-xl bg-linear-to-b from-pink-500 to-pink-600 py-3.5 text-[15px] font-medium transition-colors hover:from-pink-600 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              {loading ? "Generating..." : "Generate Thumbnail"}
                           </button>
                        )}
                     </div>
                  </div>

                  <div className="mb-4 p-6 font-semibold text-zinc-100">
                     <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-zinc-100">Preview</h2>
                        {id && (
                           <button
                              type="button"
                              onClick={() => navigate("/generate")}
                              className="pointer-events-auto rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-200 transition hover:bg-white/10"
                           >
                              Create new
                           </button>
                        )}
                     </div>
                     <PreviewPanel thumbnail={thumbnail} isLoading={loading} aspectRatio={aspectRatio} />
                  </div>
               </div>
            </main>
         </div>
      </>
   );
};

export default Generate;
