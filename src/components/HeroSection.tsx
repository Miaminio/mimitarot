import { motion } from 'framer-motion';
import { Moon, Star } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative z-10 min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.div
          className="flex items-center justify-center gap-3 mb-6"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Star className="w-4 h-4 text-gold/40" />
          <Moon className="w-8 h-8 text-gold" />
          <Star className="w-4 h-4 text-gold/40" />
        </motion.div>

        <h1 className="text-gold-gradient font-display text-4xl md:text-6xl lg:text-7xl tracking-wider mb-4">
          星光塔罗
        </h1>

        <div className="w-24 h-[1px] bg-gold/30 mx-auto mb-4" />

        <p className="text-muted-foreground font-body text-lg md:text-xl max-w-md mx-auto leading-relaxed">
          在星辰的指引下，探寻内心的答案
        </p>

        <motion.div
          className="mt-8 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="w-1 h-1 rounded-full bg-gold/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
          <div className="w-1 h-1 rounded-full bg-gold/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
