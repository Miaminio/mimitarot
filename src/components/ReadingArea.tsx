import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { allTarotCards, type TarotCard as TarotCardType } from '@/lib/tarot-data';
import { canDrawToday, markDrawUsed } from '@/lib/daily-limit';
import TarotCard from './TarotCard';
import { Sparkles, Shuffle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type SpreadType = 'choice' | 'timeline' | null;
type Phase = 'input' | 'shuffling' | 'selecting' | 'reading';

const decisionKeywords = ['选择', '还是', '应该', '要不要', '能不能', '是否', 'A还是B', '决定', '二选一', '该不该', '或者'];
const fortuneKeywords = ['运势', '未来', '接下来', '发展', '前景', '趋势', '会怎样', '结果', '走向', '将来'];

const quickQuestions = [
  { label: '🌙 下周运势如何？', text: '下周运势如何？' },
  { label: '💕 感情未来走向？', text: '感情未来走向？' },
  { label: '💼 事业转机在哪？', text: '事业转机在哪？' },
  { label: '✨ 今日灵感启示', text: '今日灵感启示' },
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
  const requiredCards = spreadType === 'choice' ? 2 : 3;

  const streamInterpretation = useCallback(async (q: string, cards: TarotCardType[], spread: SpreadType) => {
    setIsInterpreting(true);
    setInterpretation('');

    try {
      const resp = await fetch(READING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ question: q, cards, spreadType: spread }),
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
        streamInterpretation(question, newSelected, spreadType);
      }, 800);
    }
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
              <p className="text-gold font-display text-lg mb-2">选择 {requiredCards} 张牌</p>
              <p className="text-muted-foreground text-sm mb-8">
                已选 {selectedCards.length} / {requiredCards}
                {' · '}
                {spreadType === 'choice' ? '二选一牌阵' : '时间流牌阵'}
              </p>
              <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-gold/10 p-4 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent">
                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 gap-2 justify-items-center">
                  {shuffledDeck.map((card, i) => (
                    <TarotCard
                      key={card.id}
                      card={card}
                      size="sm"
                      index={i}
                      isFlipped={flippedIndices.has(i)}
                      isSelected={selectedCards.some(c => c.id === card.id)}
                      onClick={() => handleCardSelect(card, i)}
                    />
                  ))}
                </div>
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
                  <p className="text-gold font-display text-sm">星光解读</p>
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
