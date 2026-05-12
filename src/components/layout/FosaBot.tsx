import mascot from "@/assets/casaniers-mascot.png";
import { X, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

type Message = {
    text: string;
    isUser: boolean;
    gesture: string;
    action: string;
};

export const FosaBot = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentMascotGesture, setCurrentMascotGesture] = useState("👋");
    const [currentMascotAction, setCurrentMascotAction] = useState("wave");
    const [messages, setMessages] = useState<Message[]>([
        {
            text: "🐧 *Je tape sur mon torse fièrement* Salooooooot ! Moi c'est Casio, la mascotte des Casaniers ! *sourit largement* Je suis là pour te présenter ma famille et nos PC sur-mesure. Alors, t'es chaud ? *fait un signe de la main*",
            isUser: false,
            gesture: "👋",
            action: "wave",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Charger les voix disponibles
    useEffect(() => {
        speechSynthesisRef.current = window.speechSynthesis;

        const loadVoices = () => {
            const voices = speechSynthesisRef.current?.getVoices() || [];
            const frenchMaleVoice = voices.find(
                (v) =>
                    (v.lang === "fr-FR" || v.lang === "fr") &&
                    (v.name.toLowerCase().includes("male") ||
                        v.name.toLowerCase().includes("homme") ||
                        v.name.toLowerCase().includes("thomas") ||
                        v.name.toLowerCase().includes("microsoft") ||
                        !v.name.toLowerCase().includes("female"))
            );
            const frenchVoice = voices.find(
                (v) => v.lang === "fr-FR" || v.lang === "fr"
            );
            setSelectedVoice(frenchMaleVoice || frenchVoice || null);
        };

        loadVoices();
        if (speechSynthesisRef.current) {
            speechSynthesisRef.current.onvoiceschanged = loadVoices;
        }

        return () => {
            speechSynthesisRef.current?.cancel();
        };
    }, []);

    const speakText = (text: string) => {
        if (!speechSynthesisRef.current) return;
        const cleanText = text
            .replace(/[*_~`]/g, "")
            .replace(/[🐧👋🎯✅🚚💰🏠💪🤞✌️📍👍🤗⚡]/g, "");

        speechSynthesisRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "fr-FR";
        utterance.rate = 0.85;
        utterance.pitch = 0.7;
        utterance.volume = 1;
        if (selectedVoice) utterance.voice = selectedVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        currentUtteranceRef.current = utterance;
        speechSynthesisRef.current.speak(utterance);
    };

    const stopSpeaking = () => {
        speechSynthesisRef.current?.cancel();
        setIsSpeaking(false);
    };

    const animateMascotGesture = (gesture: string, action: string, duration = 1200) => {
        setCurrentMascotGesture(gesture);
        setCurrentMascotAction(action);

        const mascotElement = document.querySelector(".casio-mascot-image");
        if (mascotElement) {
            const animClass = `animate-${action}`;
            mascotElement.classList.add(animClass);
            setTimeout(() => mascotElement.classList.remove(animClass), duration);
        }

        setTimeout(() => {
            setCurrentMascotGesture("😊");
            setCurrentMascotAction("idle");
        }, duration);
    };

    const handleSendMessage = () => {
        if (!input.trim()) return;

        const userInput = input;
        setMessages((prev) => [
            ...prev,
            { text: userInput, isUser: true, gesture: "💭", action: "user" },
        ]);
        setInput("");
        setIsTyping(true);
        animateMascotGesture("🤔", "thinking");

        setTimeout(() => {
            const lowerInput = userInput.toLowerCase();
            let reply = "";
            let gesture = "😊";
            let action = "idle";

            if (lowerInput.includes("qui") || lowerInput.includes("c'est") || lowerInput.includes("vous êtes")) {
                reply = "🏠 *Je tape sur ma poitrine avec fierté* Écoute bien mon frère ! Les Casaniers, c'est MA famille ! *regard fier* Une bande de passionnés basée à Tananarive. On assemble des PC gaming et stations de travail SUR-MESURE. *montre les composants imaginaires* Des composants importés DIRECTEMENT d'Europe, pas d'intermédiaires ! Chaque machine est unique, construite avec AMOUR, et on a un SAV local hyper réactif. *sourit* C'est beau non ?";
                gesture = "💪";
                action = "punch";
            } else if (lowerInput.includes("pourquoi") || lowerInput.includes("spécial") || lowerInput.includes("différent")) {
                reply = "🎯 *Je lève un doigt* Alors laisse-moi te compter ça mon gars ! *compte sur ses doigts* Numéro 1 : l'importation directe d'Europe - pas de revendeur, donc TOI tu payes moins cher ! *lève un deuxième doigt* Numéro 2 : garantie 24 mois avec SAV local, on est là pour toi ! *troisième doigt* Numéro 3 : notre showroom à Tananarive, tu peux VENIR TOUCHER et TESTER tes futurs PCs ! *quatrième doigt* Et surtout, TOUT est personnalisable selon TON budget et TES envies. *clin d'œil* Ça te plaît hein ?";
                gesture = "🤞";
                action = "point";
            } else if (lowerInput.includes("prix") || lowerInput.includes("tarif") || lowerInput.includes("coût") || lowerInput.includes("combien")) {
                reply = "💰 *Je sors mon carnet de notes* Alors mon poto, accroche-toi bien ! *regarde ses notes* Les prix commencent à 2 490 000 Ar pour une config gaming d'entrée. Elle fait tourner tous les jeux récents, tranquille ! *tourne la page* Notre configuration VEDETTE avec la RTX 4070, elle est à partir de 5 990 000 Ar. Et pour les pros qui veulent le top du top, on monte jusqu'à 8 990 000 Ar avec les RTX 4090. *tape sur la table* Mais attends, le MEILLEUR : utilise notre CONFIGURATEUR, tu auras un devis EXACT et GRATUIT ! *sourit fièrement*";
                gesture = "💰";
                action = "celebrate";
            } else if (lowerInput.includes("garantie")) {
                reply = "✅ *Je lève 2 doigts* GARANTIE 24 MOIS mon frère ! Pièces et main-d'œuvre ! *tape du poing* Et ce n'est pas une garantie BIDON avec un centre d'appel au bout du monde. Oh que non ! *secoue la tête* On assure le SAV NOUS-MÊMES à Tananarive. Un problème ? *montre le chemin* Tu viens nous voir, on le règle sur place. Pas de passes, pas d'intermédiaires. *regard sérieux* C'est ça, être un Casanier. La qualité et la confiance !";
                gesture = "✌️";
                action = "wave";
            } else if (lowerInput.includes("livraison") || lowerInput.includes("delai") || lowerInput.includes("transport")) {
                reply = "🚚 *Je mime un camion* Livraison GRATUITE sur Tananarive, en 48h chrono ! Et pour le reste de Madagascar, compte 3 à 5 jours ouvrés. *mime l'emballage* On emballe les PC comme des œufs : DOUBLE carton, mousse anti-choc de ouf, film plastique. Et assurance incluse évidemment. *tape du bois* On a déjà livré plus de 500 PC sans AUCUNE casse, zéro dégât ! *sourit* On est des pros mon gars !";
                gesture = "🚚";
                action = "celebrate";
            } else if (lowerInput.includes("config") || lowerInput.includes("personnalisé") || lowerInput.includes("composant")) {
                reply = "⚡ *Je frotte mes mains* Ahhh, ma partie préférée ! *sautille* Avec notre configurateur, tu choisis TOUT ! *énumère* Processeur : Intel ou AMD Ryzen, tu décides ! Carte graphique : NVIDIA ou AMD, comme tu veux ! RAM, stockage (SSD ou HDD), carte mère, alimentation... *gestes dans tous les sens* Et même le RGB si tu veux que ça clignote PARTOUT ! *rit* C'est comme construire ta voiture de rêve, mais pour ton PC. Allez, viens je te montre !";
                gesture = "⚡";
                action = "celebrate";
            } else if (lowerInput.includes("showroom") || lowerInput.includes("voir") || lowerInput.includes("test")) {
                reply = "📍 *Je pointe du doigt* Notre showroom est à Tananarive, quartier Andraharo ! *fait signe* Tu peux y VENIR, TOUCHER, TESTER nos machines en VRAI ! *montre* On a des PC gaming montés, des stations de travail de ouf, et nos techniciens sont sur place pour répondre à toutes tes questions. *regarde sa montre* Horaires : lundi au samedi, 9h à 18h. Passe nous voir mon gars ! *sourit* Je t'offre le café moi-même !";
                gesture = "📍";
                action = "point";
            } else if (lowerInput.includes("merci") || lowerInput.includes("cool") || lowerInput.includes("super")) {
                reply = "🥹 *Je suis ému là* *essuie une larme* Merci à TOI de t'intéresser à nous mon frère ! C'est grâce à des clients comme toi qu'on peut continuer à faire ce qu'on aime avec passion. *tape sur l'épaule* Si t'as d'autres questions, je suis LÀ. Ou mieux, va faire un tour sur notre configurateur ! *thumbs up* T'es un boss !";
                gesture = "👍";
                action = "wave";
            } else {
                reply = "🐧 *Je hoche la tête* Écoute-moi bien mon gars ! *ouvre les bras* Je peux te parler de QUI on est : Les Casaniers, des passionnés de PC à Tananarive. POURQUOI on est spéciaux : sur-mesure, import direct d'Europe, SAV local. *compte sur ses doigts* Nos PRIX : à partir de 2 490 000 Ar. La GARANTIE : 24 mois, solide ! La LIVRAISON : gratuite et rapide ! *sourit* Et notre SHOWROOM à Andraharo, viens faire un tour ! *te regarde* Alors, qu'est-ce que tu veux savoir ? Je suis tout ouïe mon ami !";
                gesture = "🤗";
                action = "wave";
            }

            animateMascotGesture(gesture, action);
            setMessages((prev) => [...prev, { text: reply, isUser: false, gesture, action }]);
            setIsTyping(false);
            speakText(reply);
        }, 1000);
    };

    return (
        <>
            {/* ── Bouton flottant (mascotte) ── */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 z-50 group focus:outline-none"
                    aria-label="Ouvrir le chat avec Casio"
                >
                    {/* Halo animé */}
                    <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />

                    {/* Bulle d'appel */}
                    <span className="absolute -top-10 right-0 bg-white dark:bg-gray-800 text-black dark:text-white text-[11px] font-semibold px-3 py-1.5 rounded-2xl rounded-br-none shadow-lg border-2 border-amber-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        🐧 Besoin d'aide ?
                    </span>

                    {/* Avatar mascotte */}
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl border-4 border-white dark:border-gray-900 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
                        <img
                            src={mascot}
                            alt="Casio"
                            className="h-14 w-14 object-contain"
                        />
                    </div>

                    {/* Badge vert "en ligne" */}
                    <span className="absolute bottom-0.5 right-0.5 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />

                    {/* Emoji geste */}
                    <span className="absolute -top-3 -left-2 text-xl animate-bounce drop-shadow">
                        {currentMascotGesture}
                    </span>
                </button>
            )}

            {/* ── Fenêtre de chat ── */}
            {isChatOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[370px] sm:w-[420px] bg-background rounded-2xl shadow-2xl border-2 border-border overflow-hidden flex flex-col animate-slide-up theme-transition">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white/30 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={mascot}
                                        alt="Casio"
                                        className={`casio-mascot-image h-11 w-11 object-contain transition-transform duration-300 ${currentMascotAction !== "idle" ? "scale-110" : ""
                                            }`}
                                    />
                                </div>
                                {isSpeaking && (
                                    <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-base flex items-center gap-2">
                                    Casio 🐧
                                    <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        🎙️ VOIX D'HOMME
                                    </span>
                                </p>
                                <p className="text-[10px] opacity-80 flex items-center gap-1.5">
                                    <span className={isSpeaking ? "text-green-400" : "text-gray-400"}>●</span>
                                    {isSpeaking ? "Parle en ce moment..." : "En ligne · Prêt à répondre"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={isSpeaking ? stopSpeaking : undefined}
                                className={`p-1.5 rounded-lg transition-colors ${isSpeaking
                                        ? "bg-red-500/20 hover:bg-red-500/40 animate-pulse"
                                        : "opacity-40 cursor-default"
                                    }`}
                                title={isSpeaking ? "Couper la voix" : "Aucune lecture"}
                            >
                                {isSpeaking ? (
                                    <VolumeX className="h-4 w-4" />
                                ) : (
                                    <Volume2 className="h-4 w-4" />
                                )}
                            </button>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 h-80 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-secondary/30 to-background theme-transition">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.isUser ? "justify-end" : "justify-start"} animate-fade-up`}
                            >
                                {!msg.isUser && (
                                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mr-2 mt-1 shrink-0 overflow-hidden">
                                        <img src={mascot} alt="" className="h-6 w-6 object-contain" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${msg.isUser
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-card border-2 border-border rounded-bl-none shadow-md theme-transition"
                                        }`}
                                >
                                    {msg.text}
                                    {!msg.isUser && (
                                        <div className="flex gap-2 mt-2 pt-1 border-t border-border">
                                            <button
                                                onClick={() => speakText(msg.text)}
                                                className="text-[10px] opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity"
                                            >
                                                <Volume2 className="h-3 w-3" /> Réécouter
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden">
                                    <img src={mascot} alt="" className="h-6 w-6 object-contain" />
                                </div>
                                <div className="bg-card border-2 border-border rounded-2xl rounded-bl-none p-3 shadow-md theme-transition">
                                    <div className="flex gap-2 items-center">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span className="text-xs text-muted-foreground">Casio réfléchit...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t-2 border-border bg-background theme-transition shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                placeholder="Pose ta question à Casio..."
                                className="flex-1 px-3 py-2 text-sm border-2 border-border rounded-lg focus:outline-none focus:border-primary bg-background text-foreground theme-transition"
                            />
                            <Button onClick={handleSendMessage} size="sm" className="btn-primary shrink-0">
                                Envoyer
                            </Button>
                        </div>

                        {/* Suggestions */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {[
                                { emoji: "🏠", text: "Qui sont les Casaniers ?" },
                                { emoji: "💰", text: "Quels sont les prix ?" },
                                { emoji: "✅", text: "La garantie ?" },
                                { emoji: "🚚", text: "La livraison ?" },
                                { emoji: "📍", text: "Le showroom ?" },
                            ].map((s) => (
                                <button
                                    key={s.text}
                                    onClick={() => setInput(s.text)}
                                    className="text-[10px] px-2.5 py-1.5 bg-secondary hover:bg-secondary/80 transition rounded-full border border-border flex items-center gap-1"
                                >
                                    <span>{s.emoji}</span>
                                    <span>{s.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-10deg); }
        }
        @keyframes punch {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15) translateX(10px); }
        }
        @keyframes point {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(15px); }
        }
        @keyframes celebrate {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-15px) scale(1.05); }
          75% { transform: translateY(10px) scale(0.95); }
        }
        .animate-wave { animation: wave 0.8s ease-in-out; }
        .animate-punch { animation: punch 0.5s ease-in-out; }
        .animate-point { animation: point 0.8s ease-in-out; }
        .animate-celebrate { animation: celebrate 1s ease-in-out; }
        .theme-transition {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>
        </>
    );
};