import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { allTarotCards, type TarotCard as TarotCardType } from '@/lib/tarot-data';
import { X, Eye, EyeOff, Search } from 'lucide-react';

const categories = [
  { key: 'major', label: '大阿尔卡纳', count: 22 },
  { key: '权杖', label: '权杖', count: 14 },
  { key: '圣杯', label: '圣杯', count: 14 },
  { key: '宝剑', label: '宝剑', count: 14 },
  { key: '星币', label: '星币', count: 14 },
] as const;

type CategoryKey = typeof categories[number]['key'];

const CardGrid = () => {
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [showReversed, setShowReversed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('major');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCards = useMemo(() => {
    let cards: TarotCardType[];
    if (activeCategory === 'major') {
      cards = allTarotCards.filter(c => c.arcana === 'major');
    } else {
      cards = allTarotCards.filter(c => c.suit === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      cards = allTarotCards.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.upright.toLowerCase().includes(q) ||
        c.reversed.toLowerCase().includes(q)
      );
    }
    return cards;
  }, [activeCategory, searchQuery]);

  return (
    <section className="relative z-10 py-12 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center mb-6"
      >
        <h2 className="text-gold-gradient font-display text-2xl md:text-3xl mb-2">牌义图鉴</h2>
        <p className="text-muted-foreground text-sm md:text-base">78 张韦特塔罗全图鉴，点击探索奥秘</p>
      </motion.div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索牌名（中英文）或关键词..."
            className="w-full bg-secondary/50 border border-gold/15 rounded-full pl-9 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/40 font-body text-sm transition-all"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex justify-center gap-1 md:gap-2 mb-8 flex-wrap">
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
              <span className="ml-1.5 text-[10px] opacity-60">{cat.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Card Grid — show faces */}
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={searchQuery ? 'search' : activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-3 md:gap-4"
          >
            {filteredCards.map((card, i) => (
              <EncyclopediaCard
                key={card.id}
                card={card}
                index={i}
                onClick={() => { setSelectedCard(card); setShowReversed(false); }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
        {filteredCards.length === 0 && (
          <p className="text-center text-muted-foreground py-16 font-body">未找到匹配的卡牌</p>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            showReversed={showReversed}
            setShowReversed={setShowReversed}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

/* ─── Encyclopedia Card (face-up thumbnail) ─── */
const EncyclopediaCard = ({ card, index, onClick }: { card: TarotCardType; index: number; onClick: () => void }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.6), duration: 0.35 }}
      whileHover={{ y: -6, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="aspect-[2/3] rounded-lg overflow-hidden border border-gold/15 group-hover:border-gold/40 transition-all relative bg-secondary/60 card-glow group-hover:card-glow-active">
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gold/30 font-display text-xs animate-pulse-gold">✦</div>
          </div>
        )}
      </div>
      <p className="text-center text-foreground font-display text-[10px] md:text-xs mt-1.5 truncate leading-tight">
        {card.name}
      </p>
    </motion.div>
  );
};

/* ─── Detail Modal ─── */
const CardDetailModal = ({
  card,
  showReversed,
  setShowReversed,
  onClose,
}: {
  card: TarotCardType;
  showReversed: boolean;
  setShowReversed: (v: boolean) => void;
  onClose: () => void;
}) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-card border border-gold/20 rounded-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent"
      style={{ boxShadow: '0 0 60px hsl(40 55% 58% / 0.15), 0 0 120px hsl(260 40% 14% / 0.3)' }}
      initial={{ scale: 0.85, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.85, opacity: 0, y: 20 }}
      transition={{ type: 'spring', damping: 25 }}
      onClick={e => e.stopPropagation()}
    >
      {/* Image */}
      <div className="relative flex justify-center py-6 bg-gradient-to-b from-secondary/80 to-card">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-2xl bg-gold/10 blur-2xl animate-pulse-gold" />
          <img
            src={card.image}
            alt={card.name}
            className="relative w-48 md:w-56 rounded-lg border border-gold/20 shadow-2xl"
            style={{ boxShadow: '0 0 30px hsl(40 55% 58% / 0.2)' }}
          />
        </motion.div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 pt-4">
        <p className="text-gold/50 font-display text-[10px] tracking-[0.2em] uppercase mb-1">
          {card.arcana === 'major' ? '大阿尔卡纳' : `小阿尔卡纳 · ${card.suit}`}
        </p>
        <h3 className="text-gold-gradient font-display text-3xl mb-0.5">{card.name}</h3>
        <p className="text-muted-foreground font-display text-sm mb-4">{card.nameEn}</p>

        {/* Visual Description */}
        <div className="bg-secondary/40 rounded-lg p-4 mb-4 border border-gold/5">
          <p className="text-gold/40 font-display text-[10px] tracking-widest uppercase mb-2">牌面描述</p>
          <p className="text-foreground/70 font-body text-sm leading-relaxed italic">{card.visualDescription}</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => setShowReversed(false)}
            className={`font-display text-xs tracking-wider px-3 py-1.5 rounded-full transition-all ${!showReversed ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Eye size={12} className="inline mr-1.5 -mt-0.5" />正位
          </button>
          <button
            onClick={() => setShowReversed(true)}
            className={`font-display text-xs tracking-wider px-3 py-1.5 rounded-full transition-all ${showReversed ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <EyeOff size={12} className="inline mr-1.5 -mt-0.5" />逆位
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!showReversed ? (
            <motion.div key="u" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              <div className="mb-3">
                <p className="text-gold font-display text-xs tracking-wider mb-1.5">✦ 关键词</p>
                <div className="flex flex-wrap gap-1.5">
                  {card.upright.split('、').map((kw, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-gold/10 text-gold/80 font-body">{kw}</span>
                  ))}
                </div>
              </div>
              <div className="bg-secondary/30 rounded-lg p-4 border border-gold/5">
                <p className="text-gold/50 font-display text-[10px] tracking-widest uppercase mb-2">正位深意</p>
                <p className="text-foreground/80 font-body text-sm leading-relaxed">{card.uprightDeep}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="r" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              <div className="mb-3">
                <p className="text-muted-foreground font-display text-xs tracking-wider mb-1.5">✧ 关键词</p>
                <div className="flex flex-wrap gap-1.5">
                  {card.reversed.split('、').map((kw, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body">{kw}</span>
                  ))}
                </div>
              </div>
              <div className="bg-secondary/30 rounded-lg p-4 border border-muted/20">
                <p className="text-muted-foreground/70 font-display text-[10px] tracking-widest uppercase mb-2">逆位警示</p>
                <p className="text-foreground/70 font-body text-sm leading-relaxed">{card.reversedWarning}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  </motion.div>
);

export default CardGrid;
