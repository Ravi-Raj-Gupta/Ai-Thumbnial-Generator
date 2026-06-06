'use client'
import { CheckIcon, ChevronRightIcon, VideoIcon } from "lucide-react";
import TiltedImage from "../components/TiltImage";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { span } from "motion/react-client";

export default function HeroSection() {

    const navigate = useNavigate()

    const specialFeatures = [
        "No design skills needed",
        "Fast Generation",
        "High Ctr templates",
    ];

    return (
        <div className="relative flex flex-col items-center justify-center px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32">
            <div className="absolute top-30 -z-10 left-1/4 size-72 bg-pink-600 blur-[300px]"></div>
            <Link to="/generate">
                <motion.div className="group flex items-center justify-between sm:justify-start gap-2 sm:gap-3 rounded-full p-1 sm:p-1.5 pr-4 sm:pr-5 mt-44 text-pink-100 bg-pink-200/15 cursor-pointer max-w-[90vw] mx-auto"
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    <span className="shrink-0 bg-pink-800 text-white text-[10px] sm:text-xs px-3 sm:px-3.5 py-1 rounded-full">
                        NEW
                    </span>
                    <p className="flex items-center gap-1 text-xs sm:text-sm md:text-base text-left">
                        <span>Generate your first thumbnail for free</span>
                        <ChevronRightIcon size={16} className="group-hover:translate-x-0.5 transition duration-300 shrink-0" />
                    </p>
                </motion.div>
            </Link>
            <motion.h1 className="text-4xl/tight sm:text-5xl/tight md:text-6xl/21 font-medium max-w-5xl text-center"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
            >
                <span className="md:whitespace-nowrap">Generate High-CTR </span>
                <br className="hidden md:block" />
                <span className="md:whitespace-nowrap">
                    Thumbnails with <br className="sm:hidden" /><span className="move-gradient px-3 sm:px-4 rounded-xl text-nowrap">ClickFrame</span>
                </span>
            </motion.h1>
            <motion.p className="text-base text-center text-slate-200 max-w-lg mt-6"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                Stop wasting hours on creating thumbnails for your videos. Get high quality thumbnails in seconds.</motion.p>
            <motion.div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full justify-center px-4"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                <button onClick={() => navigate('/generate')} className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-7 h-11 w-full sm:w-auto">
                    Generate Now
                </button>
                <button className="flex justify-center items-center gap-2 border border-pink-900 hover:bg-pink-950/50 transition rounded-full px-6 h-11 w-full sm:w-auto">
                    <VideoIcon strokeWidth={1} />
                    <span>See how it works</span>
                </button>
            </motion.div>

            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-14 mt-12">
                {specialFeatures.map((feature, index) => (
                    <motion.p className="flex items-center gap-2" key={index}
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2, duration: 0.3 }}
                    >
                        <CheckIcon className="size-5 text-pink-600" />
                        <span className="text-slate-400">{feature}</span>
                    </motion.p>
                ))}
            </div>
            <TiltedImage />
        </div>
    );
}