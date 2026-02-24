import { motion } from 'framer-motion';
import type { TarotCard as TarotCardType } from '@/lib/tarot-data';

interface TarotCardProps {
  card?: TarotCardType;
  isFlipped?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  index?: number;
  isSelected?: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-24 md:w-20 md:h-30',
  md: 'w-24 h-36 md:w-28 md:h-42',
  lg: 'w-32 h-48 md:w-40 md:h-60',
};

const TarotCard = ({ card, isFlipped = false, onClick, size = 'md', index = 0, isSelected = false }: TarotCardProps) => {
  return (
    <motion.div
      className={`${sizeClasses[size]} perspective-1000 cursor-pointer relative`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Card Back */}
        <div
          className={`absolute inset-0 rounded-lg border ${isSelected ? 'border-gold card-glow-active' : 'border-gold-subtle card-glow'} bg-secondary flex items-center justify-center`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-1 rounded-md border border-gold-subtle opacity-50" />
          <div className="w-3/4 h-3/4 border border-gold-subtle rounded-sm flex items-center justify-center">
            <div className="text-gold-gradient font-display text-xs md:text-sm">✦</div>
          </div>
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-gold-subtle opacity-40" />
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-gold-subtle opacity-40" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-gold-subtle opacity-40" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-gold-subtle opacity-40" />
        </div>

        {/* Card Front */}
        <div
          className="absolute inset-0 rounded-lg border border-gold-subtle bg-card card-glow flex flex-col items-center justify-center p-2 text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-gold font-display text-[10px] md:text-xs mb-1 leading-tight">
            {card?.nameEn}
          </div>
          <div className="text-foreground font-display text-sm md:text-base font-semibold mb-1">
            {card?.name}
          </div>
          <div className="w-8 h-[1px] bg-gold/30 my-1" />
          <div className="text-muted-foreground text-[9px] md:text-[10px] leading-tight">
            {card?.upright}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TarotCard;
