import { yt_html } from "../assets/assets";
import { Link, useSearchParams } from "react-router-dom";

const YtPreview = () => {
   const [searchParams] = useSearchParams();

   const thumbnailUrl = searchParams.get("thumbnail_url");
   const title = searchParams.get("title");

   if (!thumbnailUrl || !title) {
      return (
         <div className="fixed inset-0 z-100 flex items-center justify-center bg-black px-6 text-white">
            <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
               <h1 className="text-xl font-semibold">Preview unavailable</h1>
               <p className="mt-2 text-sm text-zinc-400">
                  We could not find the thumbnail details needed for the YouTube preview.
               </p>
               <Link
                  to="/my-generation"
                  className="mt-5 inline-flex rounded-full bg-pink-600 px-5 py-2.5 text-sm font-medium transition hover:bg-pink-700"
               >
                  Back to My Generations
               </Link>
            </div>
         </div>
      );
   }

   const previewHtml = yt_html
      .replace("%%THUMBNAIL_URL%%", thumbnailUrl)
      .replace("%%TITLE%%", title);

   return (
      <div className="fixed inset-0 z-100 bg-black">
         <iframe
            srcDoc={previewHtml}
            title="YouTube Thumbnail Preview"
            width="100%"
            height="100%"
            allowFullScreen
         />
      </div>
   );
};

export default YtPreview;
