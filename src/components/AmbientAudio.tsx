import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

const AmbientAudio = () => {
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Use a royalty-free ambient audio from a CDN
    const audio = new Audio('https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3');
    audio.loop = true;
    audio.volume = 0.15;
    audio.muted = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (muted) {
      audioRef.current.muted = false;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.muted = true;
    }
    setMuted(!muted);
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      onClick={toggle}
      className="fixed bottom-4 right-4 z-40 w-10 h-10 rounded-full bg-secondary/80 border border-gold/15 backdrop-blur-sm flex items-center justify-center text-gold/60 hover:text-gold transition-colors"
      title={muted ? '开启氛围音乐' : '关闭音乐'}
    >
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </motion.button>
  );
};

export default AmbientAudio;
