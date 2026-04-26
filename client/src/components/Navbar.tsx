import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
   const { isLoggedIn, user, logout } = useAuth();
   const [isOpen, setIsOpen] = useState(false);
   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
   const navigate = useNavigate();

   return (
      <>
         <motion.nav
            className="fixed top-0 z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
         >
            <Link to="/">
               <img src="/logo.svg" alt="logo" className="h-8.5 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-8 transition duration-500">
               <Link to="/" className="hover:text-pink-300 transition">
                  Home
               </Link>
               <Link to="/generate" className="hover:text-pink-300 transition">
                  Generate
               </Link>
               <Link to="/my-generation" className="hover:text-pink-300 transition">
                  My Generations
               </Link>
               <Link to="/about" className="hover:text-pink-300 transition">
                  About
               </Link>
               <Link to="/contact" className="hover:text-pink-300 transition">
                  Contact Us
               </Link>
            </div>

            <div className="flex items-center gap-2">
               {isLoggedIn ? (
                  <>
                     <div className="relative group hidden md:block">
                        <button className="flex size-9 items-center justify-center rounded-full border-2 border-white/10 bg-white/20 font-medium text-white">
                           {user?.name?.charAt(0).toUpperCase()}
                        </button>
                        <div className="invisible absolute right-0 top-11 z-50 w-36 rounded-xl border border-white/10 bg-black/80 p-2 opacity-0 shadow-xl backdrop-blur transition-all group-hover:visible group-hover:opacity-100">
                           <p className="px-3 py-2 text-xs text-zinc-400">{user?.name}</p>
                           <button
                              onClick={logout}
                              className="w-full rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
                           >
                              Logout
                           </button>
                        </div>
                     </div>
                     <div className="relative md:hidden">
                        <button
                           onClick={() => setIsUserMenuOpen((prev) => !prev)}
                           className="flex size-9 items-center justify-center rounded-full border-2 border-white/10 bg-white/20 font-medium text-white"
                        >
                           {user?.name?.charAt(0).toUpperCase()}
                        </button>
                        {isUserMenuOpen && (
                           <div className="absolute right-0 top-11 z-50 w-36 rounded-xl border border-white/10 bg-black/85 p-2 shadow-xl backdrop-blur">
                              <p className="px-3 py-2 text-xs text-zinc-400">{user?.name}</p>
                              <button
                                 onClick={() => {
                                    setIsUserMenuOpen(false);
                                    logout();
                                 }}
                                 className="w-full rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
                              >
                                 Logout
                              </button>
                           </div>
                        )}
                     </div>
                  </>
               ) : (
                  <button
                     onClick={() => navigate("/login")}
                     className="hidden md:block px-6 py-2.5 bg-pink-600 hover:bg-pink-700 active:scale-95 transition-all rounded-full"
                  >
                     Get Started
                  </button>
               )}

               <button
                  onClick={() => {
                     setIsUserMenuOpen(false);
                     setIsOpen(true);
                  }}
                  className="md:hidden flex items-center justify-center"
               >
                  <MenuIcon size={26} className="active:scale-90 transition" />
               </button>
            </div>
         </motion.nav>

         <div
            className={`fixed inset-0 z-100 bg-black/40 backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-400 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
         >
            <Link onClick={() => setIsOpen(false)} to="/">
               Home
            </Link>
            <Link onClick={() => setIsOpen(false)} to="/generate">
               Generate
            </Link>
            <Link onClick={() => setIsOpen(false)} to="/my-generation">
               My Generations
            </Link>
            <Link onClick={() => setIsOpen(false)} to="/about">
               About
            </Link>
            <Link onClick={() => setIsOpen(false)} to="/contact">
               Contact us
            </Link>

            {isLoggedIn ? (
               <button
                  onClick={() => {
                     setIsOpen(false);
                     logout();
                  }}
               >
                  Logout
               </button>
            ) : (
               <Link onClick={() => setIsOpen(false)} to="/login">
                  Login
               </Link>
            )}
            <button
               onClick={() => setIsOpen(false)}
               className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-pink-600 hover:bg-pink-700 transition text-white rounded-md flex"
            >
               <XIcon />
            </button>
         </div>
      </>
   );
}
