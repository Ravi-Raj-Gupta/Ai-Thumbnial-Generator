import { CheckCircle2Icon, SparklesIcon, ZapIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Softbackdrop from "../components/Softbackdrop";

const pillars = [
   "Generate YouTube-ready thumbnails in a few clicks",
   "Keep every generation saved in one clean dashboard",
   "Preview thumbnails in a YouTube-style layout before publishing",
];

export default function About() {
   return (
      <>
         <Softbackdrop />
         <main className="min-h-screen px-6 pb-24 pt-28 md:px-16 lg:px-24 xl:px-32">
            <section className="mx-auto max-w-6xl">
               <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                  <div className="space-y-6">
                     <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-zinc-200">
                        <SparklesIcon className="size-4 text-pink-300" />
                        About the product
                     </div>
                     <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl">
                        AI Thumbnail Generator helps creators move from idea to
                        publish-ready visual faster.
                     </h1>
                     <p className="max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
                        The goal is simple: reduce the busywork around thumbnail
                        creation so you can focus on better videos, stronger
                        packaging, and more consistent publishing.
                     </p>
                     <div className="space-y-3">
                        {pillars.map((item) => (
                           <div
                              key={item}
                              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                           >
                              <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-pink-300" />
                              <p className="text-zinc-200">{item}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-black/25 p-8 shadow-2xl backdrop-blur">
                     <div className="mb-6 inline-flex rounded-2xl border border-pink-400/20 bg-pink-500/10 p-4 text-pink-200">
                        <ZapIcon className="size-8" />
                     </div>
                     <h2 className="text-2xl font-semibold text-white">
                        Built for creators who care about CTR
                     </h2>
                     <p className="mt-4 leading-7 text-zinc-300">
                        From solo YouTubers to small media teams, this tool is
                        designed to make experimentation easier. Try styles,
                        aspect ratios, and color directions without starting from
                        scratch every time.
                     </p>
                     <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                           to="/generate"
                           className="rounded-2xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-500"
                        >
                           Start generating
                        </Link>
                        <Link
                           to="/contact"
                           className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
                        >
                           Talk to us
                        </Link>
                     </div>
                  </div>
               </div>
            </section>
         </main>
      </>
   );
}
