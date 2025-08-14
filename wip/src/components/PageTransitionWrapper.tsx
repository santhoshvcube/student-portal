import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, x: "-100vw", scale: 0.8 },
  in: { opacity: 1, x: 0, scale: 1 },
  out: { opacity: 0, x: "100vw", scale: 0.8 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.5
};

export const transitionStyles = {
  slideLeft: {
    initial: { opacity: 0, x: "100vw" },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: "-100vw" },
  },
  slideRight: {
    initial: { opacity: 0, x: "-100vw" },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: "100vw" },
  },
  fadeIn: {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  },
  zoomIn: {
    initial: { opacity: 0, scale: 0.5 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.5 },
  },
  crossFadeScale: {
    initial: { opacity: 0, scale: 0.9 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.9 },
  },
  slideUp: {
    initial: { opacity: 0, y: "100vh" },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: "100vh" },
  },
};

interface PageTransitionWrapperProps {
  children: React.ReactNode;
  transitionType?: keyof typeof transitionStyles;
}

const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({ 
  children, 
  transitionType = "slideLeft" 
}) => {
  const selectedVariants = transitionStyles[transitionType] || pageVariants;

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={selectedVariants}
      transition={pageTransition}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransitionWrapper;
