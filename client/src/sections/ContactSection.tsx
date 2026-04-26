import { ArrowRightIcon, MailIcon, MessageSquareTextIcon } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";

export default function ContactSection() {
   return (
      <section
         id="contact"
         className="px-4 md:px-16 lg:px-24 xl:px-32"
      >
         <SectionTitle
            text1="Contact"
            text2="Grow your channel"
            text3="Have questions, ideas, or need help with your thumbnail workflow? We are here to help."
         />

         <div className="mx-auto mt-16 grid max-w-5xl gap-5 lg:grid-cols-[1fr_0.9fr]">
            <motion.div
               initial={{ y: 120, opacity: 0 }}
               whileInView={{ y: 0, opacity: 1 }}
               viewport={{ once: true }}
               transition={{ type: "spring", stiffness: 260, damping: 60, mass: 1 }}
               className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur"
            >
               <div className="inline-flex rounded-2xl border border-pink-400/20 bg-pink-500/10 p-3 text-pink-200">
                  <MessageSquareTextIcon className="size-6" />
               </div>
               <h3 className="mt-6 text-2xl font-semibold text-white">
                  Need creator support?
               </h3>
               <p className="mt-3 max-w-xl leading-7 text-zinc-300">
                  Reach out for onboarding help, product questions, feature
                  requests, or anything else that would make your workflow
                  smoother.
               </p>

               <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-3 text-zinc-200">
                     <MailIcon className="size-5 text-pink-300" />
                     <span>support@aithumbnailgenerator.dev</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                     Fastest way to contact us is through the dedicated contact
                     page.
                  </p>
               </div>
            </motion.div>

            <motion.div
               initial={{ y: 140, opacity: 0 }}
               whileInView={{ y: 0, opacity: 1 }}
               viewport={{ once: true }}
               transition={{ type: "spring", stiffness: 240, damping: 60, mass: 1 }}
               className="rounded-[2rem] border border-white/10 bg-black/20 p-8 shadow-2xl backdrop-blur"
            >
               <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">
                  Let&apos;s talk
               </p>
               <h3 className="mt-3 text-2xl font-semibold text-white">
                  Open the full contact workspace
               </h3>
               <p className="mt-3 leading-7 text-zinc-300">
                  Fill in your details, share your goal, and we&apos;ll open your
                  email app with a ready-to-send message.
               </p>
               <Link
                  to="/contact"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-pink-600 px-6 py-3 font-medium text-white transition hover:bg-pink-500"
               >
                  Go to Contact Us
                  <ArrowRightIcon className="size-4" />
               </Link>
            </motion.div>
         </div>
      </section>
   );
}
