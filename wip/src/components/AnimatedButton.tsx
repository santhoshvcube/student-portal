import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowDownTrayIcon, 
  CheckIcon, 
  XMarkIcon, 
  EnvelopeIcon, 
  TrashIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const iconMap = {
  download: ArrowDownTrayIcon,
  pdf: DocumentArrowDownIcon,
  docx: DocumentTextIcon,
  email: EnvelopeIcon,
  delete: TrashIcon,
  check: CheckIcon,
  xmark: XMarkIcon,
  // Add more as needed
};

interface AnimatedButtonProps {
  label?: string;
  onClick?: () => void;
  isLoading?: boolean;
  icon?: string | React.ComponentType<any>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  animationType?: 'default' | 'download-pdf' | 'download-docx' | 'email' | 'delete' | 'pulse' | 'shake';
  children?: React.ReactNode;
  [key: string]: any;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  label,
  onClick,
  isLoading = false,
  icon = null,
  type = 'button',
  className = '',
  disabled = false,
  animationType = 'default',
  children,
  ...props
}) => {
  const IconComponent = typeof icon === 'string' ? iconMap[icon as keyof typeof iconMap] : icon;

  const buttonVariants = {
    initial: { scale: 1, boxShadow: '0 0px 0px rgba(0,0,0,0)' },
    hover: { scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
    tap: { scale: 0.95 },
    loading: {
      rotate: [0, 360],
      transition: { repeat: Infinity, duration: 1, ease: 'linear' },
    },
    pulse: {
      scale: [1, 1.05, 1],
      boxShadow: ['0 0px 0px rgba(0,0,0,0)', '0 0px 10px rgba(251, 191, 36, 0.7)', '0 0px 0px rgba(0,0,0,0)'],
      transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
    },
    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.4 },
    },
    'download-pdf': {
      y: [0, -10, 0],
      rotate: [0, -10, 0, 10, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    'download-docx': {
      y: [0, -5, 0],
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    'email-send': {
        x: [0, 20, -20, 0],
        opacity: [1, 0.5, 0.5, 1],
        transition: { duration: 0.8, ease: 'easeInOut' }
    },
    'delete-shrink': {
      scaleY: [1, 0.5, 0],
      opacity: [1, 0.5, 0],
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold
        transition duration-300 ease-in-out
        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={
        isLoading
          ? (animationType === 'pulse' ? 'pulse' : 'loading')
          : (animationType === 'shake' ? 'shake' : 'initial')
      }
      {...props}
    >
      {isLoading && (animationType !== 'pulse' && animationType !== 'shake') ? (
        <motion.span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></motion.span>
      ) : (
        <>
          {IconComponent && (
            <motion.span
              className="w-5 h-5"
              variants={buttonVariants[animationType as keyof typeof buttonVariants]}
              initial="initial"
              animate={animationType}
              key={animationType === 'default' ? 'no-animation' : animationType}
            >
              <IconComponent />
            </motion.span>
          )}
          <span>{label || children}</span>
        </>
      )}
    </motion.button>
  );
};

export default AnimatedButton;
