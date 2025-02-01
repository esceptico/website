import { motion } from 'framer-motion';

export function PhotoGalleryLoading() {
  return (
    <div className="min-h-screen overflow-hidden bg-[var(--theme-bg)] flex items-center justify-center">
      <div className="space-y-8">
        <motion.div 
          className="flex gap-[4vmin]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="h-[56vmin] w-[40vmin] bg-white/5 animate-pulse rounded-sm"
              style={{
                animationDelay: `${i * 150}ms`
              }}
            />
          ))}
        </motion.div>
        
        <div className="flex justify-center">
          <div className="text-white/50 font-medium">Loading gallery...</div>
        </div>
      </div>
    </div>
  );
} 