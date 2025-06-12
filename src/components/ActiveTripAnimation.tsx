import React from 'react';
import { motion } from 'framer-motion';

interface ActiveTripAnimationProps {
  shopper: {
    name: string;
    avatar: string;
  };
}

export const ActiveTripAnimation: React.FC<ActiveTripAnimationProps> = ({ shopper }) => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Pulsing border */}
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-blue-500"
        animate={{
          scale: [1, 1.02, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Shopping cart animation */}
      <motion.div
        className="absolute top-2 right-2"
        animate={{
          x: [0, -10, 0],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
          <img
            src={shopper.avatar}
            alt={shopper.name}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span>Shopping in progress...</span>
        </div>
      </motion.div>

      {/* Background gradient animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg"
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

export default ActiveTripAnimation; 