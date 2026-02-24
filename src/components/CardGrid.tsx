import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { allTarotCards, type TarotCard as TarotCardType } from '@/lib/tarot-data';
import TarotCard from './TarotCard';
import { X, Eye, EyeOff } from 'lucide-react';

const CardGrid = () => {
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [showReversed, setShowReversed] = useState(false);

  return (
    <section className="relative z-10 py-16 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-gold-gradient font-display text-2xl md:text-3xl mb-2">牌义百科</h2>
        <p className="text-muted-foreground text-sm md:text-base">点击任意卡牌，探索它的奥秘</p>
      </motion.div>

      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2 md:gap-3">
        {allTarotCards.map((card, i) => (
          <TarotCard
            key={card.id}
            card={card}
            size="sm"
            index={i}
            onClick={() => { setSelectedCard(card); setShowReversed(false); }}
          />
        ))}
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              className="bg-card border border-gold-subtle rounded-2xl max-w-lg w-full card-glow-active overflow-hidden max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Section */}
              <div className="relative">
                <div className="aspect-[3/4] max-h-[40vh] overflow-hidden bg-secondary">
                  <img
                    src={selectedCard.image}
                    alt={selectedCard.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
                {/* Gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
              </div>

              {/* Content Section */}
              <div className="px-6 pb-6 -mt-4 relative">
                <p className="text-gold/50 font-display text-[10px] tracking-[0.2em] uppercase mb-1">
                  {selectedCard.arcana === 'major' ? '大阿尔卡纳' : `小阿尔卡纳 · ${selectedCard.suit}`}
                </p>
                <h3 className="text-gold-gradient font-display text-3xl mb-0.5">{selectedCard.name}</h3>
                <p className="text-muted-foreground font-display text-sm mb-4">{selectedCard.nameEn}</p>

                {/* Visual Description */}
                <div className="bg-secondary/40 rounded-lg p-4 mb-4 border border-gold/5">
                  <p className="text-gold/40 font-display text-[10px] tracking-widest uppercase mb-2">牌面描述</p>
                  <p className="text-foreground/70 font-body text-sm leading-relaxed italic">
                    {selectedCard.visualDescription}
                  </p>
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <button
                    onClick={() => setShowReversed(false)}
                    className={`font-display text-xs tracking-wider px-3 py-1.5 rounded-full transition-all ${!showReversed ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Eye size={12} className="inline mr-1.5 -mt-0.5" />
                    正位
                  </button>
                  <button
                    onClick={() => setShowReversed(true)}
                    className={`font-display text-xs tracking-wider px-3 py-1.5 rounded-full transition-all ${showReversed ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <EyeOff size={12} className="inline mr-1.5 -mt-0.5" />
                    逆位
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {!showReversed ? (
                    <motion.div
                      key="upright"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-3">
                        <p className="text-gold font-display text-xs tracking-wider mb-1.5">✦ 关键词</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCard.upright.split('、').map((kw, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-gold/10 text-gold/80 font-body">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-4 border border-gold/5">
                        <p className="text-gold/50 font-display text-[10px] tracking-widest uppercase mb-2">正位深意</p>
                        <p className="text-foreground/80 font-body text-sm leading-relaxed">
                          {selectedCard.uprightDeep}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="reversed"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-3">
                        <p className="text-muted-foreground font-display text-xs tracking-wider mb-1.5">✧ 关键词</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCard.reversed.split('、').map((kw, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-4 border border-muted/20">
                        <p className="text-muted-foreground/70 font-display text-[10px] tracking-widest uppercase mb-2">逆位警示</p>
                        <p className="text-foreground/70 font-body text-sm leading-relaxed">
                          {selectedCard.reversedWarning}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CardGrid;
