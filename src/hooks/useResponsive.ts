import * as React from "react";


const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;


export function useBreakpoint(breakpoint: Breakpoint): boolean {
  // On calcule la vraie valeur dès le premier rendu, pour éviter le flash "faux mobile" au chargement.
  const [matches, setMatches] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`).matches;
  });

  React.useEffect(() => {
    // On recrée la media query à chaque changement de breakpoint demandé.
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);

    // Cette fonction se déclenche automatiquement quand la largeur d'écran franchit le seuil.
    const onChange = () => setMatches(mql.matches);

    // On resynchronise une fois au montage, au cas où la taille aurait changé entre-temps.
    onChange();

    // On écoute les changements de taille tant que le composant est affiché.
    mql.addEventListener("change", onChange);

    // On arrête d'écouter quand le composant disparaît, pour ne pas laisser de fuite mémoire.
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return matches;
}

// Hook tout-en-un qui regroupe tous les breakpoints utiles en un seul endroit.
export function useResponsive() {
  // Chaque ligne vérifie un seuil de largeur précis.
  const isSm = useBreakpoint("sm");
  const isMd = useBreakpoint("md");
  const isLg = useBreakpoint("lg");
  const isXl = useBreakpoint("xl");
  const is2xl = useBreakpoint("2xl");

  return {
    // isMobile est vrai tant que l'écran n'a pas atteint la taille tablette.
    isMobile: !isMd,

    // isTablet est vrai seulement entre la taille tablette et la taille desktop.
    isTablet: isMd && !isLg,

    // isDesktop est vrai à partir de la taille desktop.
    isDesktop: isLg,

    // Les breakpoints bruts, si un composant a besoin d'une précision plus fine.
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
  };
}

// Raccourci pratique quand un composant n'a besoin de savoir qu'une seule chose : est-on sur mobile ou pas.
export function useIsMobile(): boolean {
  return !useBreakpoint("md");
}