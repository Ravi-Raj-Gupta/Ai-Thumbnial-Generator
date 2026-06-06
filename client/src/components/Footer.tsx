import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { footerData } from "../data/footer";
import type { IFooterLink } from "../types";

export default function Footer() {
   return (
      <footer className="mt-40 border-t border-white/10 bg-black/20 pt-16 pb-8">
         <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32">
            <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-24">
               <motion.div
                  className="flex flex-col items-start max-w-sm"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
               >
                  <Link to="/" className="flex items-center gap-3 sm:gap-4 md:gap-5">
                     <img
                        className="size-8 sm:size-9 md:size-10 aspect-square transition-all"
                        src="/favicon.svg"
                        alt="ClickFrame logo"
                     />
                     <span className="text-xl sm:text-2xl font-bold text-white tracking-wide transition-all">
                        Click<span className="text-pink-500">Frame</span>
                     </span>
                  </Link>
                  <p className="mt-6 text-sm leading-relaxed text-zinc-400">
                     Making every creator feel valued, no matter the size of the audience. Stop wasting hours and let AI design thumbnails that get clicks.
                  </p>
               </motion.div>

               <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-10 sm:gap-16 w-full md:w-auto"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 70, mass: 1 }}
               >
                  {footerData.map((section, index) => (
                     <div key={index}>
                        <h4 className="font-semibold text-white">{section.title}</h4>
                        <ul className="mt-6 space-y-3">
                           {section.links.map((link: IFooterLink, linkIndex: number) => (
                              <li key={linkIndex}>
                                 <Link
                                    to={link.href}
                                    className="text-sm text-zinc-400 transition hover:text-pink-400"
                                 >
                                    {link.name}
                                 </Link>
                              </li>
                           ))}
                        </ul>
                     </div>
                  ))}
               </motion.div>
            </div>

            <motion.div
               className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500"
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
            >
               <p className="text-center md:text-left">
                  &copy; {new Date().getFullYear()} ClickFrame by Ravi Raj ❤️. All rights reserved.
               </p>
               <div className="flex items-center gap-6">
                  <Link to="/privacy-policy" className="transition hover:text-zinc-300">Privacy Policy</Link>
                  <Link to="/terms-of-service" className="transition hover:text-zinc-300">Terms of Service</Link>
               </div>
            </motion.div>
         </div>
      </footer>
   );
}
