"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const imgList = ["/images/image77.png", "/images/image89.png", "/images/image90.png", "/images/image91.png"];

export default function SlideImageHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imgList.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-65 sm:w-[320px] md:w-75 lg:w-105">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full"
        >
          <Image
            src={imgList[currentImageIndex]}
            width={300}
            height={300}
            alt="Main dish"
            className="w-full h-auto object-cover"
            priority={currentImageIndex === 0}
            fetchPriority="high"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
