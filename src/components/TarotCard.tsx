import { useState } from 'react';
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
  sm: 'w-16 h-28 md:w-20 md:h-34',
  md: 'w-24 h-40 md:w-28 md:h-48',
  lg: 'w-36 h-60 md:w-44 md:h-72',
};

const TarotCard = ({ card, isFlipped = false, onClick, size = 'md', index = 0, isSelected = false }: TarotCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      className={`${sizeClasses[size]} cursor-pointer relative`}
      style={{ perspective: '1000px' }}
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
          className={`absolute inset-0 rounded-lg border-2 ${isSelected ? 'border-gold card-glow-active' : 'border-gold-subtle card-glow'} bg-secondary overflow-hidden`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cosmic-deep via-secondary to-cosmic-deep" />
          <div className="absolute inset-1.5 rounded-md border border-gold/20" />
          <div className="absolute inset-3 rounded-sm border border-gold/10 flex items-center justify-center">
            <div className="relative">
              <div className="text-gold/60 font-display text-lg md:text-xl">✦</div>
              <div className="absolute inset-0 text-gold/20 font-display text-lg md:text-xl animate-pulse-gold">✦</div>
            </div>
          </div>
          {/* Corner stars */}
          <div className="absolute top-2 left-2 text-gold/20 text-[8px]">✧</div>
          <div className="absolute top-2 right-2 text-gold/20 text-[8px]">✧</div>
          <div className="absolute bottom-2 left-2 text-gold/20 text-[8px]">✧</div>
          <div className="absolute bottom-2 right-2 text-gold/20 text-[8px]">✧</div>
        </div>

        {/* Card Front */}
        <div
          className="absolute inset-0 rounded-lg border-2 border-gold-subtle bg-card card-glow overflow-hidden flex flex-col"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Image area */}
          <div className="flex-1 relative overflow-hidden bg-secondary/50">
            {card?.image && (
              <img
                src={card.image}
                alt={card.name}
                className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImgLoaded(true)}
                loading="lazy"
              />
            )}
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gold/30 font-display text-xs animate-pulse-gold">✦</div>
              </div>
            )}
          </div>

          {/* Text area */}
          <div className="px-1.5 py-1 md:px-2 md:py-1.5 text-center bg-gradient-to-t from-card via-card to-card/80 border-t border-gold/10">
            <div className="text-foreground font-display text-[10px] md:text-xs font-semibold leading-tight truncate">
              {card?.name}
            </div>
            {size !== 'sm' && (
              <div className="text-gold/50 font-display text-[8px] md:text-[9px] leading-tight truncate mt-0.5">
                {card?.nameEn}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TarotCard;
