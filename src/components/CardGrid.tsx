import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { allTarotCards, type TarotCard as TarotCardType } from '@/lib/tarot-data';
import TarotCard from './TarotCard';
import { X } from 'lucide-react';

const CardGrid = () => {
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);

  return (
    <section className="relative z-10 py-16 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-gold-gradient font-display text-2xl md:text-3xl mb-2">每日一牌</h2>
        <p className="text-muted-foreground text-sm md:text-base">点击任意卡牌，探索它的奥秘</p>
      </motion.div>

      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2 md:gap-3">
        {allTarotCards.map((card, i) => (
          <TarotCard
            key={card.id}
            card={card}
            size="sm"
            index={i}
            onClick={() => setSelectedCard(card)}
          />
        ))}
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              className="bg-card border border-gold-subtle rounded-xl p-6 md:p-8 max-w-md w-full card-glow-active"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center">
                <p className="text-gold/60 font-display text-xs tracking-widest uppercase mb-1">
                  {selectedCard.arcana === 'major' ? '大阿尔卡纳' : `小阿尔卡纳 · ${selectedCard.suit}`}
                </p>
                <h3 className="text-gold-gradient font-display text-3xl mb-1">{selectedCard.name}</h3>
                <p className="text-muted-foreground font-display text-sm mb-6">{selectedCard.nameEn}</p>

                <div className="w-16 h-[1px] bg-gold/30 mx-auto mb-6" />

                <p className="text-foreground/80 text-base leading-relaxed mb-6">
                  {selectedCard.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-gold text-xs font-display mb-1">正位</p>
                    <p className="text-foreground/70 text-sm">{selectedCard.upright}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-gold/60 text-xs font-display mb-1">逆位</p>
                    <p className="text-foreground/70 text-sm">{selectedCard.reversed}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CardGrid;
