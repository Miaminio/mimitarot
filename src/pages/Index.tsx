import { useState } from 'react';
import StarryBackground from '@/components/StarryBackground';
import HeroSection from '@/components/HeroSection';
import ReadingArea from '@/components/ReadingArea';
import CardGrid from '@/components/CardGrid';
import AmbientAudio from '@/components/AmbientAudio';
import { getRemainingDraws } from '@/lib/daily-limit';

type View = 'home' | 'reading' | 'encyclopedia';

const Index = () => {
  const [view, setView] = useState<View>('home');

  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-x-hidden">
      <StarryBackground />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-gold-subtle/20">
        <button
          onClick={() => setView('home')}
          className="font-display text-gold text-sm tracking-widest hover:text-gold-light transition-colors"
        >
          星光塔罗
        </button>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setView('reading')}
            className={`font-display text-xs tracking-wider transition-colors ${view === 'reading' ? 'text-gold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            抽牌占卜
          </button>
          <button
            onClick={() => setView('encyclopedia')}
            className={`font-display text-xs tracking-wider transition-colors ${view === 'encyclopedia' ? 'text-gold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            牌义百科
          </button>
          <span className="text-gold/40 text-xs font-body">
            今日剩余 {getRemainingDraws()} 次
          </span>
        </div>
      </nav>

      {/* Views */}
      {view === 'home' && (
        <>
          <HeroSection />
          <ReadingArea />
        </>
      )}

      {view === 'reading' && <ReadingArea />}

      {view === 'encyclopedia' && <CardGrid />}

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-gold-subtle/10">
        <p className="text-muted-foreground/40 font-body text-xs">
          塔罗仅供娱乐与自我探索，不构成任何专业建议
        </p>
      </footer>

      <AmbientAudio />
    </div>
  );
};

export default Index;
