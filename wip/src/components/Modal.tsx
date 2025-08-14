import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'md', hideCloseButton = false }) => {
  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 }
  };

  const modalVariants = {
    hidden: {
      y: "100vh",
      opacity: 0,
      scale: 0.8
    },
    visible: {
      y: "0",
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    },
    exit: {
      y: "100vh",
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  let maxWidthClass = 'max-w-md';
  if (size === 'lg') maxWidthClass = 'max-w-2xl';
  if (size === 'xl') maxWidthClass = 'max-w-4xl';
  if (size === 'full') maxWidthClass = 'max-w-full h-full';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className={`bg-white p-8 rounded-lg shadow-xl relative w-full ${maxWidthClass} mx-auto overflow-auto max-h-[90vh]`}
            variants={modalVariants}
            onClick={e => e.stopPropagation()}
          >
            {!hideCloseButton && (
             <button
               onClick={onClose}
               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
             >
               <X className="w-6 h-6" />
             </button>
            )}
            {title && <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">{title}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
