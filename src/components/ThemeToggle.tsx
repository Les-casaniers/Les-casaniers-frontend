// components/ThemeToggle.tsx
import { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return saved === 'dark' || (!saved && prefersDark);
    }
    return false;
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Effet ripple
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, active: true });
    setTimeout(() => setRipple({ x: 0, y: 0, active: false }), 600);

    // Animation de transition
    setIsAnimating(true);
    
    // Animation de fondu pour le body
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    setTimeout(() => {
      setIsDark(!isDark);
      setTimeout(() => setIsAnimating(false), 300);
    }, 50);
  };

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={toggleTheme}
        className={`
          relative group overflow-hidden
          w-10 h-10 rounded-full
          bg-secondary hover:bg-border
          text-muted-foreground hover:text-foreground
          transition-all duration-500 ease-out
          hover:scale-110 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
          ${isAnimating ? 'animate-pulse' : ''}
        `}
        aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {/* Ripple effect */}
        {ripple.active && (
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${ripple.x}px ${ripple.y}px, hsl(var(--foreground) / 0.2), transparent 70%)`,
              animation: 'ripple 0.6s ease-out',
            }}
          />
        )}

        {/* Icônes avec animation 3D */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Icône Soleil */}
          <div
            className={`
              absolute transition-all duration-500 ease-out
              ${isDark 
                ? 'rotate-0 opacity-100 scale-100 translate-y-0' 
                : 'rotate-[-90deg] opacity-0 scale-0 translate-y-2'
              }
            `}
          >
            <Sun className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
          </div>
          
          {/* Icône Lune */}
          <div
            className={`
              absolute transition-all duration-500 ease-out
              ${!isDark 
                ? 'rotate-0 opacity-100 scale-100 translate-y-0' 
                : 'rotate-[90deg] opacity-0 scale-0 translate-y-2'
              }
            `}
          >
            <Moon className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12" />
          </div>
        </div>

        {/* Effet de brillance au hover */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      </button>

      {/* Particules décoratives (optionnel) */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-foreground/30"
              style={{
                top: '50%',
                left: '50%',
                animation: `particle ${0.5 + i * 0.05}s ease-out forwards`,
                transform: `rotate(${i * 45}deg) translateX(20px)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Tooltip moderne */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-foreground text-background text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
        {isDark ? 'Mode clair ☀️' : 'Mode sombre 🌙'}
      </div>

      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes particle {
          0% {
            transform: rotate(var(--deg)) translateX(0);
            opacity: 0.8;
          }
          100% {
            transform: rotate(var(--deg)) translateX(40px);
            opacity: 0;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};