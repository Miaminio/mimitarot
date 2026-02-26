import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { allTarotCards, type TarotCard as TarotCardType } from '@/lib/tarot-data';
import { canDrawToday, markDrawUsed } from '@/lib/daily-limit';
import TarotCard from './TarotCard';
import { Sparkles, Shuffle, Send, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

type SpreadType = 'choice' | 'timeline' | null;
type Phase = 'input' | 'shuffling' | 'selecting' | 'reading';
type Persona = 'seer' | 'healer';

const decisionKeywords = ['选择', '还是', '应该', '要不要', '能不能', '是否', 'A还是B', '决定', '二选一', '该不该', '或者'];
const fortuneKeywords = ['运势', '未来', '接下来', '发展', '前景', '趋势', '会怎样', '结果', '走向', '将来'];

const quickQuestions = [
  { label: '🌙 下周运势如何？', text: '下周运势如何？' },
  { label: '💕 感情未来走向？', text: '感情未来走向？' },
  { label: '💼 事业转机在哪？', text: '事业转机在哪？' },
  { label: '✨ 今日灵感启示', text: '今日灵感启示' },
];

const personaOptions: { key: Persona; label: string; desc: string }[] = [
  { key: 'seer', label: '🔥 毒舌预言家', desc: '直接、犀利、一针见血' },
  { key: 'healer', label: '🌿 治愈咨询师', desc: '温柔、包容、抚慰心灵' },
];

// Ziwei daily tips
const ziweiTips = [
  '紫微斗数提示：今日天机化禄，适合做重要决策，灵感与智慧并行。',
  '紫微斗数提示：太阳入命，光芒万丈，宜展现自我，不宜退缩。',
  '紫微斗数提示：天同星守照，适宜休养身心，以柔克刚方为上策。',
  '紫微斗数提示：武曲化权在迁移宫，出行与变动皆有良机。',
  '紫微斗数提示：紫微天府双星会照，贵人运旺盛，把握人际机缘。',
  '紫微斗数提示：廉贞化忌，慎防感情纠葛，凡事三思而后行。',
  '紫微斗数提示：天梁星照命，今日适合助人，施比受更有福。',
  '紫微斗数提示：巨门化禄，口才出众之日，表达与沟通皆顺畅。',
  '紫微斗数提示：七杀入财帛宫，财运有冲劲，宜大胆不宜犹豫。',
  '紫微斗数提示：天相合太阴，感性与理性交融，内心清明如镜。',
];

function detectIntent(question: string): SpreadType {
  if (decisionKeywords.some(k => question.includes(k))) return 'choice';
  if (fortuneKeywords.some(k => question.includes(k))) return 'timeline';
  return 'timeline';
}

const READING_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tarot-reading`;

const ReadingArea = () => {
  const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [spreadType, setSpreadType] = useState<SpreadType>(null);
  const [shuffledDeck, setShuffledDeck] = useState<TarotCardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarotCardType[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [interpretation, setInterpretation] = useState('');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [persona, setPersona] = useState<Persona>('healer');
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [isReshuffling, setIsReshuffling] = useState(false);
  const requiredCards = spreadType === 'choice' ? 2 : 3;

  const dailyZiwei = useMemo(() => {
    const dayIndex = new Date().getDate() % ziweiTips.length;
    return ziweiTips[dayIndex];
  }, []);

  const streamInterpretation = useCallback(async (q: string, cards: TarotCardType[], spread: SpreadType, style: Persona) => {
    setIsInterpreting(true);
    setInterpretation('');

    try {
      const resp = await fetch(READING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ question: q, cards, spreadType: spread, persona: style }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) { toast.error('请求过于频繁，请稍后再试'); return; }
        if (resp.status === 402) { toast.error('AI 额度不足，请稍后再试'); return; }
        toast.error('AI 解读暂时不可用');
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setInterpretation(fullText);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error('Stream error:', e);
      toast.error('解读连接中断，请重试');
    } finally {
      setIsInterpreting(false);
    }
  }, []);

  const startReading = useCallback((q: string) => {
    if (!q.trim()) return;
    if (!canDrawToday()) {
      toast.error('今日抽牌次数已用完，明天再来吧 ✨');
      return;
    }
    setQuestion(q);
    const intent = detectIntent(q);
    setSpreadType(intent);
    setPhase('shuffling');
    setSelectedCards([]);
    setFlippedIndices(new Set());
    setInterpretation('');

    setTimeout(() => {
      const shuffled = [...allTarotCards].sort(() => Math.random() - 0.5);
      setShuffledDeck(shuffled);
      setPhase('selecting');
    }, 2000);
  }, []);

  const handleSubmit = useCallback(() => {
    startReading(question);
  }, [question, startReading]);

  const handleQuickQuestion = (text: string) => {
    setQuestion(text);
    startReading(text);
  };

  const handleCardSelect = (card: TarotCardType, index: number) => {
    if (selectedCards.length >= requiredCards) return;
    if (selectedCards.find(c => c.id === card.id)) return;

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);
    setFlippedIndices(prev => new Set(prev).add(index));

    if (newSelected.length === requiredCards) {
      markDrawUsed();
      setTimeout(() => {
        setPhase('reading');
        streamInterpretation(question, newSelected, spreadType, persona);
      }, 800);
    }
  };

  const handleReshuffle = () => {
    setIsReshuffling(true);
    setSelectedCards([]);
    setFlippedIndices(new Set());
    setTimeout(() => {
      const shuffled = [...allTarotCards].sort(() => Math.random() - 0.5);
      setShuffledDeck(shuffled);
      setIsReshuffling(false);
    }, 1200);
  };

  const handleReset = () => {
    setPhase('input');
    setQuestion('');
    setSpreadType(null);
    setSelectedCards([]);
    setFlippedIndices(new Set());
    setInterpretation('');
  };

  const spreadLabels = spreadType === 'choice'
    ? ['选项 A', '选项 B']
    : ['过去', '现在', '未来'];

  // Fan layout calculations
  const totalCards = shuffledDeck.length;
  const fanAngleRange = Math.min(totalCards * 1.8, 160); // degrees

  return (
    <section className="relative z-10 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Sparkles className="w-6 h-6 text-gold mx-auto mb-4 animate-pulse-gold" />
          <h2 className="text-gold-gradient font-display text-2xl md:text-4xl mb-3">探寻指引</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            写下你的困惑，让塔罗为你指引方向
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Persona Selector */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <button
                    onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-secondary/50 text-gold/80 hover:text-gold font-display text-xs tracking-wider transition-all"
                  >
                    {personaOptions.find(p => p.key === persona)?.label}
                    <ChevronDown size={12} className={`transition-transform ${showPersonaMenu ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showPersonaMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-gold/20 rounded-xl overflow-hidden shadow-xl z-50 w-56"
                      >
                        {personaOptions.map(p => (
                          <button
                            key={p.key}
                            onClick={() => { setPersona(p.key); setShowPersonaMenu(false); }}
                            className={`w-full text-left px-4 py-3 hover:bg-gold/10 transition-colors ${persona === p.key ? 'bg-gold/5' : ''}`}
                          >
                            <div className="font-display text-sm text-foreground">{p.label}</div>
                            <div className="font-body text-xs text-muted-foreground">{p.desc}</div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Quick Questions */}
              <div className="flex flex-wrap justify-center gap-2 mb-2">
                {quickQuestions.map((q) => (
                  <motion.button
                    key={q.text}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickQuestion(q.text)}
                    className="px-4 py-2 rounded-full border border-gold/20 bg-gold/5 hover:bg-gold/15 text-gold/80 hover:text-gold font-body text-sm transition-all backdrop-blur-sm"
                  >
                    {q.label}
                  </motion.button>
                ))}
              </div>

              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="输入你的问题... 例如：我该选择A工作还是B工作？"
                  className="w-full bg-secondary/50 border border-gold/20 rounded-xl p-4 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 resize-none h-24 font-body text-base transition-all"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!question.trim()}
                  className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-gold/20 hover:bg-gold/30 flex items-center justify-center text-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                </button>
              </div>
              {!canDrawToday() && (
                <p className="text-center text-muted-foreground text-xs">今日免费抽牌已使用，明天再来吧 ✨</p>
              )}
            </motion.div>
          )}

          {phase === 'shuffling' && (
            <motion.div
              key="shuffling"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                className="w-12 h-12 mx-auto mb-6"
              >
                <Shuffle className="w-12 h-12 text-gold" />
              </motion.div>
              <p className="text-gold font-display text-lg animate-pulse-gold">洗牌中...</p>
              <p className="text-muted-foreground text-sm mt-2">
                牌阵：{spreadType === 'choice' ? '二选一' : '时间流（过去·现在·未来）'}
              </p>
            </motion.div>
          )}

          {phase === 'selecting' && (
            <motion.div
              key="selecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-gold font-display text-lg mb-1">选择 {requiredCards} 张牌</p>
              <p className="text-muted-foreground text-sm mb-2">
                已选 {selectedCards.length} / {requiredCards}
                {' · '}
                {spreadType === 'choice' ? '二选一牌阵' : '时间流牌阵'}
              </p>

              {/* Reshuffle button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReshuffle}
                disabled={isReshuffling}
                className="mb-6 px-4 py-2 rounded-full border border-gold/20 bg-gold/5 text-gold/70 hover:text-gold font-display text-xs tracking-wider transition-all disabled:opacity-40"
              >
                <RefreshCw size={12} className={`inline mr-1.5 -mt-0.5 ${isReshuffling ? 'animate-spin' : ''}`} />
                重新洗牌
              </motion.button>

              {/* Fan Spread */}
              <div className="relative mx-auto" style={{ height: '340px', maxWidth: '700px' }}>
                <AnimatePresence>
                  {!isReshuffling && shuffledDeck.map((card, i) => {
                    const angle = -fanAngleRange / 2 + (fanAngleRange / (totalCards - 1)) * i;
                    const isSelected = selectedCards.some(c => c.id === card.id);
                    const isFlipped = flippedIndices.has(i);

                    return (
                      <motion.div
                        key={card.id}
                        className="absolute cursor-pointer"
                        style={{
                          left: '50%',
                          bottom: '-60px',
                          width: '60px',
                          height: '96px',
                          transformOrigin: 'bottom center',
                          zIndex: i,
                        }}
                        initial={{ rotate: 0, x: '-50%', opacity: 0, scale: 0.5 }}
                        animate={{
                          rotate: angle,
                          x: '-50%',
                          opacity: isSelected ? 0.3 : 1,
                          scale: 1,
                          y: 0,
                        }}
                        exit={{ opacity: 0, scale: 0.3, y: 50 }}
                        transition={{ delay: Math.min(i * 0.008, 0.5), duration: 0.4, type: 'spring', damping: 20 }}
                        whileHover={!isSelected ? { y: -30, scale: 1.15, zIndex: 100 } : {}}
                        whileTap={!isSelected ? { scale: 0.95 } : {}}
                        onClick={() => !isSelected && handleCardSelect(card, i)}
                      >
                        <div
                          className={`w-full h-full rounded-md border ${isSelected ? 'border-gold/50' : 'border-gold/20'} bg-secondary overflow-hidden shadow-lg`}
                          style={{ perspective: '600px' }}
                        >
                          <motion.div
                            className="w-full h-full relative"
                            style={{ transformStyle: 'preserve-3d' }}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6 }}
                          >
                            {/* Back */}
                            <div
                              className="absolute inset-0 rounded-md bg-gradient-to-br from-cosmic-deep via-secondary to-cosmic-deep flex items-center justify-center"
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              <div className="text-gold/40 font-display text-sm">✦</div>
                            </div>
                            {/* Front */}
                            <div
                              className="absolute inset-0 rounded-md overflow-hidden"
                              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            >
                              <img src={card.image} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Selected slots */}
              <div className={`flex justify-center gap-4 mt-4`}>
                {spreadLabels.map((label, i) => (
                  <div key={label} className="text-center">
                    <div className={`w-14 h-20 rounded-md border-2 border-dashed ${selectedCards[i] ? 'border-gold/50' : 'border-gold/15'} flex items-center justify-center bg-secondary/30`}>
                      {selectedCards[i] ? (
                        <img src={selectedCards[i].image} alt={selectedCards[i].name} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <span className="text-gold/20 font-display text-lg">{i + 1}</span>
                      )}
                    </div>
                    <p className="text-gold/40 font-display text-[10px] mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'reading' && (
            <motion.div
              key="reading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="bg-secondary/30 border border-gold/10 rounded-xl p-4 mb-6">
                <p className="text-muted-foreground text-xs font-display mb-1">你的问题</p>
                <p className="text-foreground text-sm">{question}</p>
              </div>

              <div className={`grid ${spreadType === 'choice' ? 'grid-cols-2' : 'grid-cols-3'} gap-4 md:gap-6`}>
                {selectedCards.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="text-center"
                  >
                    <p className="text-gold/60 text-xs font-display mb-3 tracking-widest uppercase">
                      {spreadLabels[i]}
                    </p>
                    <div className="flex justify-center mb-3">
                      <TarotCard card={card} isFlipped size="lg" index={0} />
                    </div>
                    <p className="text-foreground font-display text-sm">{card.name}</p>
                    <p className="text-muted-foreground text-xs mt-1">{card.upright}</p>
                  </motion.div>
                ))}
              </div>

              {/* AI Interpretation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-secondary/30 border border-gold/10 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <p className="text-gold font-display text-sm">
                    {persona === 'seer' ? '🔥 毒舌预言' : '🌿 治愈解读'}
                  </p>
                  {isInterpreting && <Loader2 className="w-3 h-3 text-gold/50 animate-spin" />}
                </div>

                {interpretation ? (
                  <div className="prose prose-sm prose-invert max-w-none text-foreground/80 font-body text-base leading-relaxed">
                    <ReactMarkdown>{interpretation}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-gold/40 animate-spin" />
                    <span className="text-muted-foreground text-sm ml-2">正在连接星光...</span>
                  </div>
                )}
              </motion.div>

              {/* Ziwei Module */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="bg-accent/30 border border-gold/10 rounded-xl p-4 text-center"
              >
                <p className="text-gold/60 font-display text-[10px] tracking-[0.2em] uppercase mb-2">☯ 今日紫微简评</p>
                <p className="text-foreground/70 font-body text-sm leading-relaxed italic">{dailyZiwei}</p>
              </motion.div>

              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="text-gold/60 hover:text-gold text-sm font-display transition-colors"
                >
                  ← 重新开始
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ReadingArea;
