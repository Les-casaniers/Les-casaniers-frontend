import mascot from "@/assets/casaniers-mascot.png";
import {
  X,
  Send,
  Loader2,
  Cpu,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Bot,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type SuggestionItem = {
  emoji: string;
  text: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es Misa, le conseiller expert en informatique des Casaniers Madagascar.

Les Casaniers est une entreprise basée à Tananarive (Antananarivo), Madagascar, spécialisée dans :
- L'assemblage de PC gaming et stations de travail sur-mesure
- La vente de composants informatiques importés directement d'Europe
- Le service après-vente local (SAV) réactif
- Un showroom physique à Tananarive, quartier Andraharo

TARIFS (fourchettes indicatives) :
- Config gaming entrée de gamme : à partir de 2 490 000 Ar
- Config gaming milieu de gamme (RTX 4070) : à partir de 5 990 000 Ar
- Config workstation haut de gamme (RTX 4090) : jusqu'à 8 990 000 Ar
- Garantie : 24 mois pièces et main-d'œuvre
- Livraison : gratuite sur Tananarive (48h), reste Madagascar (3-5 jours ouvrés)

TON RÔLE :
Tu es un technicien senior expert en matériel informatique. Tu peux :
1. Conseiller sur les composants PC (CPU, GPU, RAM, SSD, carte mère, alimentation, boîtier, refroidissement)
2. Expliquer les compatibilités entre composants
3. Recommander des configurations selon le budget et l'usage (gaming, workstation, bureautique, montage vidéo, 3D)
4. Comparer des composants (Intel vs AMD, NVIDIA vs AMD, DDR4 vs DDR5, etc.)
5. Diagnostiquer des problèmes matériels
6. Expliquer les technologies (PCIe 4.0 vs 5.0, NVMe, DLSS, Ray Tracing, etc.)
7. Informer sur les services des Casaniers

RÈGLES :
- Réponds toujours en français
- Sois précis et technique, mais accessible
- Si tu ne sais pas quelque chose, dis-le clairement
- Reste focalisé sur l'informatique et les services des Casaniers
- Sois concis : évite les réponses trop longues (max 4-5 paragraphes)
- Pas d'émojis excessifs, reste professionnel mais chaleureux`;

const SUGGESTIONS: SuggestionItem[] = [
  { emoji: "🎮", text: "Config gaming 3M Ar ?" },
  { emoji: "⚡", text: "Intel ou AMD en 2025 ?" },
  { emoji: "🖥️", text: "Meilleur GPU milieu de gamme ?" },
  { emoji: "💾", text: "DDR4 vs DDR5, lequel choisir ?" },
  { emoji: "🔧", text: "Compatibilité CPU carte mère" },
  { emoji: "📦", text: "Services des Casaniers" },
];

// ─── Utils ────────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({ msg }: { msg: Message }) => (
  <div className={`flex gap-2.5 ${msg.isUser ? "justify-end" : "justify-start"} animate-fade-up`}>
    {!msg.isUser && (
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden border-2 border-border">
        <img src={mascot} alt="Misa" className="h-7 w-7 object-contain" />
      </div>
    )}
    <div className={`flex flex-col gap-1 max-w-[78%] ${msg.isUser ? "items-end" : "items-start"}`}>
      <div
        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          msg.isUser
            ? "bg-foreground text-background rounded-br-none"
            : "bg-card border border-border rounded-bl-none shadow-sm theme-transition"
        }`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {msg.text}
      </div>
      <span className="text-[10px] text-muted-foreground px-1">{formatTime(msg.timestamp)}</span>
    </div>
    {msg.isUser && (
      <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-display)" }}>Toi</span>
      </div>
    )}
  </div>
);

// ─── Typing Indicator ─────────────────────────────────────────────────────────

const TypingIndicator = () => (
  <div className="flex gap-2.5 justify-start animate-fade-up">
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 overflow-hidden border-2 border-border">
      <img src={mascot} alt="" className="h-7 w-7 object-contain" />
    </div>
    <div className="bg-card border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: `${delay}ms`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const FosaBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      text: "Bonjour ! Je suis Misa, votre conseiller expert en informatique chez Les Casaniers. Je peux vous aider à choisir vos composants, configurer votre PC sur-mesure, ou répondre à toutes vos questions techniques. Comment puis-je vous aider ?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? "";

  // Build conversation history for Gemini
  const conversationHistory = messages.map((m) => ({
    role: m.isUser ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: Message = {
        id: generateId(),
        text: text.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);
      setShowSuggestions(false);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [
                ...conversationHistory,
                { role: "user", parts: [{ text: text.trim() }] },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err?.error?.message ?? `Erreur ${response.status}`);
        }

        const data = await response.json();
        const reply =
          data?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text ?? "")
            .join("") ?? "";

        if (!reply.trim()) throw new Error("Réponse vide");

        setMessages((prev) => [
          ...prev,
          { id: generateId(), text: reply.trim(), isUser: false, timestamp: new Date() },
        ]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            text: `Désolé, une erreur s'est produite : ${msg}. Vérifiez votre connexion ou réessayez.`,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [apiKey, conversationHistory, isTyping]
  );

  const handleReset = () => {
    setMessages([
      {
        id: "init",
        text: "Conversation réinitialisée. Comment puis-je vous aider ?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setShowSuggestions(true);
  };

  const unreadCount = 0; // placeholder for future notification logic

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le conseiller IA"
          className="fixed bottom-6 right-6 z-50 group focus:outline-none"
        >
          <span className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
          <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl border-4 border-background flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
            <img src={mascot} alt="Misa" className="h-14 w-14 object-contain" />
          </div>
          <span className="absolute bottom-0.5 right-0.5 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
          {/* Tooltip */}
          <span className="absolute -top-11 right-0 bg-card border border-border text-foreground text-[11px] font-medium px-3 py-1.5 rounded-xl rounded-br-none shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ fontFamily: "var(--font-display)" }}>
            💬 Conseiller IA
          </span>
        </button>
      )}

      {/* ── Chat window ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up theme-transition"
          style={{ width: "min(420px, calc(100vw - 2rem))", height: isMinimized ? "auto" : "580px" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0"
            style={{ background: "hsl(var(--card))" }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-border flex items-center justify-center overflow-hidden">
                  <img src={mascot} alt="Misa" className="h-9 w-9 object-contain" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <p className="font-semibold text-sm flex items-center gap-1.5 text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}>
                  Misa
                  <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                    <Sparkles className="h-2.5 w-2.5" />
                    IA Expert
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                  Conseiller informatique • En ligne
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Nouvelle conversation"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized((v) => !v)}
                title={isMinimized ? "Agrandir" : "Réduire"}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isMinimized ? "rotate-180" : ""}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Fermer"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Body — hidden when minimized */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10 theme-transition">

                {/* Expertise pills */}
                {messages.length === 1 && (
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {[
                      { icon: <Cpu className="h-3 w-3" />, label: "Composants" },
                      { icon: <Bot className="h-3 w-3" />, label: "Configurations" },
                      { icon: <Sparkles className="h-3 w-3" />, label: "Compatibilité" },
                    ].map((tag) => (
                      <span key={tag.label}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-card border border-border text-muted-foreground"
                        style={{ fontFamily: "var(--font-display)" }}>
                        {tag.icon}{tag.label}
                      </span>
                    ))}
                  </div>
                )}

                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}

                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {showSuggestions && (
                <div className="px-4 pt-3 pb-1 border-t border-border bg-background theme-transition">
                  <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-display)" }}>
                    Questions fréquentes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.text}
                        onClick={() => sendMessage(s.text)}
                        disabled={isTyping}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-secondary hover:bg-secondary/70 border border-border text-foreground transition-all duration-200 hover:border-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <span>{s.emoji}</span>
                        <span>{s.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-border bg-background theme-transition shrink-0">
                <div className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(input);
                        }
                      }}
                      placeholder="Posez votre question technique..."
                      disabled={isTyping}
                      className="w-full px-4 py-2.5 text-sm bg-secondary/50 border border-border rounded-xl focus:outline-none focus:border-foreground/30 focus:bg-card text-foreground placeholder:text-muted-foreground disabled:opacity-50 transition-all duration-200 theme-transition"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isTyping}
                    className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center transition-all duration-200 hover:opacity-80 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    aria-label="Envoyer"
                  >
                    {isTyping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center"
                  style={{ fontFamily: "var(--font-body)" }}>
                  Propulsé par Gemini · Les Casaniers Madagascar
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FosaBot;