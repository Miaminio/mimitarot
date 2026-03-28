import { Link } from 'react-router-dom';
import StarryBackground from '@/components/StarryBackground';

type PlaceholderPageProps = {
  title: string;
  subtitle?: string;
};

const PlaceholderPage = ({ title, subtitle }: PlaceholderPageProps) => {
  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-x-hidden">
      <StarryBackground />
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-gold-subtle/20">
        <Link
          to="/"
          className="font-display text-gold text-sm tracking-widest hover:text-gold-light transition-colors"
        >
          星光塔罗
        </Link>
      </nav>
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-gold-gradient font-display text-2xl md:text-3xl tracking-wider mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground font-body text-base max-w-md mb-10">{subtitle}</p>
        )}
        <p className="text-muted-foreground/70 font-body text-sm mb-8">页面建设中，敬请期待</p>
        <Link
          to="/"
          className="inline-flex items-center rounded-full border border-gold/25 bg-secondary/40 px-6 py-2.5 font-display text-sm text-gold/90 backdrop-blur-sm transition-colors hover:border-gold/40 hover:bg-secondary/60"
        >
          返回首页
        </Link>
      </main>
    </div>
  );
};

export default PlaceholderPage;
