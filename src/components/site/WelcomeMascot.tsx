import { useState, useEffect, useRef, useCallback } from "react";
import mascotPeeking from "@/assets/11.png";
import { useAuth } from "@/contexts/AuthContext";

const REPEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes
const DISPLAY_DURATION = 5000; // 5 secondes affiché
const FADE_OUT_DURATION = 800; // durée du fondu de sortie (doit matcher la classe duration-* plus bas)

export const WelcomeMascot = () => {
  const { isAuthenticated, user } = useAuth();
  const wasAuthenticated = useRef(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getFirstName = () => {
    if (user?.prenom) return user.prenom;
    if (user?.nom) return user.nom;
    if (user?.email) return user.email.split("@")[0];
    return "";
  };

  const clearAllTimers = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  const showMascot = useCallback(() => {
    clearAllTimers();
    setLeaving(false);
    setVisible(true);

    leaveTimerRef.current = setTimeout(() => {
      setLeaving(true);
    }, DISPLAY_DURATION - FADE_OUT_DURATION);

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setLeaving(false);
    }, DISPLAY_DURATION);
  }, []);

  useEffect(() => {
    // Déclenchement immédiat sur la transition false -> true (login en direct)
    if (isAuthenticated && !wasAuthenticated.current) {
      showMascot();
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, showMascot]);

  useEffect(() => {
    // Réapparition périodique tant que l'utilisateur reste connecté
    if (isAuthenticated) {
      intervalRef.current = setInterval(() => {
        showMascot();
      }, REPEAT_INTERVAL);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, showMascot]);

  useEffect(() => {
    return () => {
      clearAllTimers();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-20 lg:top-28 right-0 z-[60] flex flex-col items-end pointer-events-none transition-all ease-out duration-700 ${
        leaving ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
      }`}
    >
      {/* Bulle de dialogue */}
      <div className="relative mr-5 mb-1.5 max-w-[240px] bg-popover border border-border rounded-2xl rounded-br-sm shadow-lg px-4 py-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <p className="text-sm font-medium text-foreground whitespace-nowrap">
          Coucou {getFirstName()} 👋
        </p>
        {/* Petite pointe de bulle */}
        <span className="absolute -bottom-1.5 right-5 w-3 h-3 bg-popover border-b border-r border-border rotate-45" />
      </div>

      {/* Mascotte qui regarde derrière le bord */}
      <img
        src={mascotPeeking}
        alt=""
        aria-hidden
        className="h-28 lg:h-32 w-auto object-contain drop-shadow-lg animate-in slide-in-from-right duration-500"
      />
    </div>
  );
};