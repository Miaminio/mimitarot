import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { allTarotCards, type TarotCard as TarotCardType } from '@/lib/tarot-data';
import TarotCard from './TarotCard';
import { X, Eye, EyeOff } from 'lucide-react';

const categories = [
  { key: 'major', label: '大阿尔卡纳' },
  { key: '权杖', label: '权杖' },
  { key: '圣杯', label: '圣杯' },
  { key: '宝剑', label: '宝剑' },
  { key: '星币', label: '星币' },
] as const;

type CategoryKey = typeof categories[number]['key'];

const CardGrid = () => {
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [showReversed, setShowReversed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('major');

  const filteredCards = useMemo(() => {
    if (activeCategory === 'major') {
      return allTarotCards.filter(c => c.arcana === 'major');
    }
    return allTarotCards.filter(c => c.suit === activeCategory);
  }, [activeCategory]);

  return (
    <section className="relative z-10 py-16 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-gold-gradient font-display text-2xl md:text-3xl mb-2">牌义百科</h2>
        <p className="text-muted-foreground text-sm md:text-base">点击任意卡牌，探索它的奥秘</p>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-1 md:gap-2 mb-10 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-full font-display text-xs md:text-sm tracking-wider transition-all ${
              activeCategory === cat.key
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'text-muted-foreground hover:text-foreground border border-transparent hover:border-muted/30'
            }`}
          >
            {cat.label}
            <span className="ml-1.5 text-[10px] opacity-60">
              {cat.key === 'major' ? '22' : '14'}
            </span>
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-wrap justify-center gap-2 md:gap-3"
          >
            {filteredCards.map((card, i) => (
              <TarotCard
                key={card.id}
                card={card}
                size="sm"
                index={i}
                onClick={() => { setSelectedCard(card); setShowReversed(false); }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
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
              className="bg-card border border-gold/20 rounded-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ boxShadow: '0 0 60px hsl(40 55% 58% / 0.15), 0 0 120px hsl(260 40% 14% / 0.3)' }}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Section with glow */}
              <div className="relative flex justify-center py-6 bg-gradient-to-b from-secondary/80 to-card">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="relative"
                >
                  <div className="absolute -inset-4 rounded-2xl bg-gold/10 blur-2xl animate-pulse-gold" />
                  <img
                    src={selectedCard.image}
                    alt={selectedCard.name}
                    className="relative w-48 md:w-56 rounded-lg border border-gold/20 shadow-2xl"
                    style={{ boxShadow: '0 0 30px hsl(40 55% 58% / 0.2)' }}
                  />
                </motion.div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content Section */}
              <div className="px-6 pb-6 pt-4">
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
