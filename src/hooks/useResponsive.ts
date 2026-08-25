import * as React from "react";

// Les breakpoints reprennent exactement ceux de Tailwind CSS par défaut,
// pour que ton JS et ton CSS soient toujours d'accord entre eux.
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook générique : retourne true si la largeur de l'écran est
 * SUPÉRIEURE OU ÉGALE au breakpoint donné.
 * Exemple : useBreakpoint("lg") -> true si écran >= 1024px
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);

    // Fonction appelée à chaque fois que la taille d'écran change
    const onChange = () => setMatches(mql.matches);

    onChange(); // valeur initiale au montage du composant
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return matches;
}

/**
 * Hook tout-en-un : retourne l'état responsive complet de la page.
 * Utilise-le une seule fois dans un composant pour avoir accès à tout.
 */
export function useResponsive() {
  const isSm = useBreakpoint("sm");   // >= 640px
  const isMd = useBreakpoint("md");   // >= 768px
  const isLg = useBreakpoint("lg");   // >= 1024px
  const isXl = useBreakpoint("xl");   // >= 1280px
  const is2xl = useBreakpoint("2xl"); // >= 1536px

  return {
    // Catégories simples, les plus utilisées au quotidien
    isMobile: !isMd,           // écran < 768px (téléphone)
    isTablet: isMd && !isLg,   // écran entre 768px et 1024px (tablette)
    isDesktop: isLg,           // écran >= 1024px (ordinateur)

    // Breakpoints détaillés, si tu as besoin de plus de précision
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
  };
}


export function useIsMobile(): boolean {
  return !useBreakpoint("md");
}