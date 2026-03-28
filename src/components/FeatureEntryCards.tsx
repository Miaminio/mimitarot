import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitCompare, Heart, Sun, History, Info } from 'lucide-react';

const entries = [
  {
    to: '/compare',
    title: '选哪个更好？',
    subtitle: '看看两个选择的未来',
    icon: GitCompare,
  },
  {
    to: '/love',
    title: '感情专区',
    subtitle: '关于爱情的问题',
    icon: Heart,
  },
  {
    to: '/daily',
    title: '每日塔罗',
    subtitle: '今天的指引',
    icon: Sun,
  },
  {
    to: '/records',
    title: '我的记录',
    subtitle: '查看历史占卜',
    icon: History,
  },
  {
    to: '/about',
    title: '关于我们',
    subtitle: '了解Mimitarot',
    icon: Info,
  },
] as const;

const FeatureEntryCards = () => {
  return (
    <div className="mt-8 pt-6 border-t border-gold/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 max-w-6xl mx-auto">
        {entries.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={item.to}
              className="group block h-full rounded-xl border border-gold/15 bg-secondary/35 backdrop-blur-md px-4 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:scale-[1.02] hover:border-gold/30 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold/90 transition-colors group-hover:bg-gold/15">
                  <item.icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-display text-sm text-gold/95 tracking-wide group-hover:text-gold transition-colors">
                    {item.title}
                  </div>
                  <div className="font-body text-xs text-muted-foreground mt-0.5 leading-snug">
                    {item.subtitle}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeatureEntryCards;
