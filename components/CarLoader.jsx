'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function CarLoader({ loading }) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur"
        >
          {/* Road Line */}
          <div className="relative w-96 h-2 bg-yellow-500 rounded-full overflow-hidden">
            {/* Car Animation */}
            <motion.div
              initial={{ x: -100 }}
              animate={{ x: 420 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
              className="absolute -top-8"
            >
              <Image
                src="/carloader.png" // ✅ your custom car in public/
                alt="Car Loader"
                width={90}
                height={45}
                priority
                className="drop-shadow-xl"
              />
            </motion.div>
          </div>

          {/* Processing Text */}
          <div className="mt-8 flex items-center space-x-2 text-white text-lg font-semibold">
            <span>Processing your booking</span>
            {/* Animated Dots */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
            >
              .
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse', delay: 0.2 }}
            >
              .
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse', delay: 0.4 }}
            >
              .
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
