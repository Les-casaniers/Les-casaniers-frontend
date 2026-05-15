import { SiteLayout } from "@/components/site/SiteLayout";
import { useEffect, useState, useRef } from "react";
import { User, Heart, Package, MapPin, LogOut, Settings, Bell, Award, Edit3, Volume2, VolumeX, X } from "lucide-react";
import { useShop } from "@/store/shop";
import { products, formatAr } from "@/lib/products";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import fosa from "@/assets/casaniers-mascot.png";

type Tab = "overview" | "orders" | "favorites" | "address" | "settings";

const Account = () => {
  const [tab, setTab] = useState<Tab>("overview");
  const { favorites, toggleFavorite } = useShop();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => { 
    document.title = "Mon compte â€” Les Casaniers Madagascar"; 
  }, []);

  // Charger les voix disponibles
  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    
    const loadVoices = () => {
      const voices = speechSynthesisRef.current?.getVoices() || [];
      
      const frenchMaleVoice = voices.find(voice => 
        (voice.lang === 'fr-FR' || voice.lang === 'fr') && 
        (voice.name.toLowerCase().includes('male') || 
         voice.name.toLowerCase().includes('homme') ||
         voice.name.toLowerCase().includes('thomas') ||
         !voice.name.toLowerCase().includes('female'))
      );
      
      const frenchVoice = voices.find(voice => voice.lang === 'fr-FR' || voice.lang === 'fr');
      setSelectedVoice(frenchMaleVoice || frenchVoice || null);
    };
    
    loadVoices();
    
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (currentUtteranceRef.current) {
        speechSynthesisRef.current?.cancel();
      }
    };
  }, []);

  const speakText = (text: string, onEnd?: () => void) => {
    if (!speechSynthesisRef.current) return;
    
    const cleanText = text.replace(/[*_~`]/g, '').replace(/[ðŸ§ðŸ‘‹ðŸŽ¯âœ…ðŸššðŸ’°ðŸ ðŸ’ª]/g, '');
    
    if (currentUtteranceRef.current) {
      speechSynthesisRef.current.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.volume = 1;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => setIsSpeaking(false);
    
    currentUtteranceRef.current = utterance;
    speechSynthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleMascotClick = () => {
    setIsChatOpen(true);
    let message = "";
    switch(tab) {
      case "overview":
        message = "ðŸ§ *Je tape sur ma poitrine* Salut Hery ! Bienvenue dans ton espace ! *regarde autour* Ici tu peux voir tes commandes, tes favoris, et gÃ©rer ton compte. T'as 2 commandes en cours et 1 280 points fidÃ©litÃ© ! *sourit* Tu veux que je t'aide Ã  naviguer ?";
        break;
      case "orders":
        message = "ðŸ§ *Je pointe du doigt* Tes commandes sont ici ! *compte* T'as dÃ©jÃ  achetÃ© le Aurora Gaming et le Office Essentiel avec nous. *fait un clin d'Å“il* Satisfait du service ? N'hÃ©site pas Ã  laisser un avis !";
        break;
      case "favorites":
        message = `ðŸ§ *Je saute de joie* Tu as ${favorites.length} produit${favorites.length > 1 ? 's' : ''} dans tes favoris ! *montre l'Ã©cran* Une petite pÃ©pite se cache parmi eux. Tu veux que je te les prÃ©sente ?`;
        break;
      case "address":
        message = "ðŸ§ *Je montre du doigt* Tes adresses de livraison sont en sÃ©curitÃ© ici ! *sourit* On livre partout Ã  Madagascar, avec soin et rapiditÃ©. Besoin d'ajouter une nouvelle adresse ?";
        break;
      case "settings":
        message = "ðŸ§ *Je fais le cafÃ© imaginaire* Ah, les paramÃ¨tres ! *tape sur l'Ã©paule* Tu peux modifier ton email, ton tÃ©lÃ©phone et ton mot de passe ici. Tout est sÃ©curisÃ© avec nous !";
        break;
      default:
        message = "ðŸ§ *Je hoche la tÃªte* Bienvenue dans ton compte Hery ! *sourit* Je suis lÃ  pour t'aider Ã  naviguer. Tu as des questions sur tes commandes ou tes favoris ?";
    }
    setCurrentMessage(message);
    speakText(message);
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    let message = "";
    switch(newTab) {
      case "overview":
        message = "ðŸ§ *Regarde autour* Vue d'ensemble ! *montre* Tes statistiques et ta derniÃ¨re commande sont ici. Tout roule ?";
        break;
      case "orders":
        message = "ðŸ§ *Compte sur ses doigts* Tes commandes ! *sourit* Tu peux suivre leur statut en temps rÃ©el. La derniÃ¨re est en prÃ©paration !";
        break;
      case "favorites":
        message = `ðŸ§ *Frotte ses mains* Tes ${favorites.length} favoris ! *clin d'Å“il* Des petits bijoux technologiques. Passe ta souris dessus, je te les prÃ©sente !`;
        break;
      case "address":
        message = "ðŸ§ *Pointe la carte* Tes adresses de livraison ! *sourit* On livre partout Ã  Madagascar avec soin. Besoin d'en ajouter une ?";
        break;
      case "settings":
        message = "ðŸ§ *Tapote l'Ã©cran* Les paramÃ¨tres ! *regard sÃ©rieux* Tout est sÃ©curisÃ© avec nous. Tu peux modifier tes infos en toute tranquillitÃ©.";
        break;
    }
    setCurrentMessage(message);
    speakText(message);
  };

  const speakAboutProduct = (productName: string, productPrice: string) => {
    const message = `ðŸ§ *Je pointe* Ahh, ${productName} ! *s'approche* Ã€ ${productPrice} seulement. *fait un clin d'Å“il* Un excellent choix ! Tu veux l'ajouter au panier ?`;
    setCurrentMessage(message);
    speakText(message);
  };

  const favProducts = products.filter((p) => favorites.includes(p.id));

  const fakeOrders = [
    { id: "FOSA-2026-0481", date: "12 mars 2026", status: "LivrÃ©", total: 5990000, item: "Aurora Gaming" },
    { id: "FOSA-2026-0312", date: "28 janv. 2026", status: "En prÃ©paration", total: 1890000, item: "Office Essentiel" },
  ];

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-gradient-hero border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container-x py-12 relative flex items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-3xl bg-gradient-accent flex items-center justify-center shadow-glow">
              <User className="h-10 w-10 text-accent-foreground" />
            </div>
            {/* MASCOTTE CLIQUABLE */}
            <div 
              onClick={handleMascotClick}
              className="absolute -bottom-2 -right-2 cursor-pointer group"
            >
              <div className="relative">
                <div className={`absolute inset-0 bg-amber-500/20 rounded-full blur-xl scale-150 transition-all duration-500 ${isSpeaking ? 'bg-green-500/30 scale-175 animate-pulse' : 'group-hover:bg-amber-500/30'}`} />
                <img 
                  src={fosa} 
                  alt="Casio - Cliquez pour parler" 
                  className={`h-12 w-12 object-contain transition-all duration-300 ${isSpeaking ? 'animate-bounce' : 'group-hover:scale-110'}`}
                />
                {isSpeaking && (
                  <div className="absolute -top-6 -right-6 bg-foreground text-background text-[8px] px-1.5 py-0.5 rounded-full whitespace-nowrap animate-pulse">
                    ðŸŽ™ï¸ Parle...
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="pill mb-2">Le Coucou ðŸ‘‹</div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Bonjour, Hery !</h1>
            <p className="text-muted-foreground text-sm">Membre depuis janvier 2026 Â· <span className="text-accent font-semibold">Statut Or</span></p>
          </div>
        </div>
      </section>

      <section className="container-x py-10 grid lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <nav className="card-soft p-3 space-y-1 lg:sticky lg:top-32">
            {([
              { k: "overview", label: "Vue d'ensemble", icon: Award },
              { k: "orders", label: "Mes commandes", icon: Package },
              { k: "favorites", label: "Favoris", icon: Heart },
              { k: "address", label: "Adresses", icon: MapPin },
              { k: "settings", label: "ParamÃ¨tres", icon: Settings },
            ] as { k: Tab; label: string; icon: typeof User }[]).map((i) => (
              <button 
                key={i.k} 
                onClick={() => handleTabChange(i.k)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === i.k ? "bg-gradient-accent text-accent-foreground shadow-glow" : "hover:bg-secondary"
                }`}
              >
                <i.icon className="h-4 w-4" /> {i.label}
              </button>
            ))}
            <hr className="border-border my-2" />
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4" /> DÃ©connexion
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-9 space-y-6">
          {tab === "overview" && (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                <Stat icon={Package} label="Commandes" value="2" tag="Actives" />
                <Stat icon={Heart} label="Favoris" value={String(favorites.length)} />
                <Stat icon={Award} label="Points fidÃ©litÃ©" value="1 280" tag="+ Or" />
              </div>
              <div className="card-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-xl">DerniÃ¨re commande</h2>
                  <Button variant="ghost" size="sm" onClick={() => handleTabChange("orders")}>Tout voir</Button>
                </div>
                <OrderCard order={fakeOrders[0]} />
              </div>
              <div className="card-soft p-6 bg-gradient-to-br from-accent/5 to-tech/5 border-accent/30">
                <div className="flex items-start gap-4">
                  <Bell className="h-6 w-6 text-accent shrink-0" />
                  <div>
                    <h3 className="font-display font-bold mb-1">Le Fosa vous chuchoteâ€¦</h3>
                    <p className="text-sm text-muted-foreground">Une nouvelle config <strong className="text-foreground">Atelier Creator</strong> est arrivÃ©e. Elle correspond Ã  vos derniers favoris.</p>
                    <Button variant="hero" size="sm" className="mt-3" asChild>
                      <Link to="/produit/atelier-creator">La dÃ©couvrir</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "orders" && (
            <div className="card-soft p-6">
              <h2 className="font-display font-bold text-xl mb-4">Historique des commandes</h2>
              <div className="space-y-3">
                {fakeOrders.map((o) => <OrderCard key={o.id} order={o} />)}
              </div>
            </div>
          )}

          {tab === "favorites" && (
            <div className="card-soft p-6">
              <h2 className="font-display font-bold text-xl mb-4">Mes favoris ({favorites.length})</h2>
              {favProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun favori pour l'instant. Le cÃ¢lin vous attend dans le catalogue ðŸ¾</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {favProducts.map((p) => (
                    <div 
                      key={p.id} 
                      className="card-soft p-4 flex gap-3 hover-lift cursor-pointer"
                      onMouseEnter={() => speakAboutProduct(p.name, formatAr(p.price))}
                    >
                      <img src={p.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <Link to={`/produit/${p.id}`} className="font-display font-bold text-sm hover:text-accent">{p.name}</Link>
                        <div className="font-display font-bold text-sm mt-1">{formatAr(p.price)}</div>
                        <button onClick={() => toggleFavorite(p.id)} className="text-xs text-muted-foreground hover:text-destructive mt-1">Retirer</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "address" && (
            <div className="card-soft p-6">
              <h2 className="font-display font-bold text-xl mb-4">Adresses de livraison</h2>
              <div className="card-soft p-5 mb-3 border-accent/40">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-accent font-semibold mb-1">Adresse principale</div>
                    <div className="font-semibold">Hery Rakoto</div>
                    <p className="text-sm text-muted-foreground">Lot II M 23, Antanimena<br />101 Antananarivo, Madagascar<br />+261 34 12 345 67</p>
                  </div>
                  <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                </div>
              </div>
              <Button variant="soft">+ Ajouter une adresse</Button>
            </div>
          )}

          {tab === "settings" && (
            <div className="card-soft p-6 space-y-4">
              <h2 className="font-display font-bold text-xl">ParamÃ¨tres du compte</h2>
              {[
                { label: "E-mail", value: "hery@example.mg" },
                { label: "TÃ©lÃ©phone", value: "+261 34 12 345 67" },
                { label: "Mot de passe", value: "â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between p-4 bg-secondary/40 rounded-xl">
                  <div>
                    <div className="text-xs text-muted-foreground">{f.label}</div>
                    <div className="font-semibold">{f.value}</div>
                  </div>
                  <Button variant="ghost" size="sm">Modifier</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CHATBOT POPUP */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-background rounded-2xl shadow-2xl border-2 border-border overflow-hidden animate-slide-up theme-transition">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={fosa} alt="Casio" className="h-10 w-10 rounded-full object-contain bg-white/10 p-1" />
              <div>
                <div className="font-bold text-sm flex items-center gap-2">
                  Casio ðŸ§
                  <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">VOIX D'HOMME</span>
                </div>
                <div className="text-[9px] opacity-80">
                  {isSpeaking ? "ðŸŽ™ï¸ Parle en ce moment..." : "ðŸŽ§ PrÃªt Ã  t'aider"}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {isSpeaking && (
                <button onClick={stopSpeaking} className="p-1 rounded-lg hover:bg-white/10 transition">
                  <VolumeX className="h-3 w-3" />
                </button>
              )}
              <button onClick={() => setIsChatOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="p-4 bg-secondary/30">
            <div className="bg-white dark:bg-card rounded-2xl p-3 shadow-sm border border-border">
              <div className="text-xs leading-relaxed whitespace-pre-wrap">
                {currentMessage || "ðŸ§ Salut Hery ! Je suis Casio, ta mascotte. Clique sur les onglets pour naviguer, je t'explique tout !"}
              </div>
              {currentMessage && (
                <button onClick={() => speakText(currentMessage)} className="mt-2 text-[9px] opacity-60 hover:opacity-100 flex items-center gap-1 transition">
                  <Volume2 className="h-2.5 w-2.5" /> RÃ©Ã©couter
                </button>
              )}
            </div>
          </div>
          <div className="p-3 border-t border-border text-center">
            <p className="text-[9px] text-muted-foreground">
              ðŸ’¡ Passe ta souris sur les favoris, Casio te les prÃ©sente !
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
        .theme-transition { transition: all 0.3s ease; }
      `}</style>
    </SiteLayout>
  );
};

const Stat = ({ icon: Icon, label, value, tag }: { icon: typeof User; label: string; value: string; tag?: string }) => (
  <div className="card-soft p-5 hover-lift">
    <div className="flex items-center justify-between mb-2">
      <div className="h-10 w-10 rounded-xl bg-gradient-accent flex items-center justify-center">
        <Icon className="h-5 w-5 text-accent-foreground" />
      </div>
      {tag && <span className="pill !text-[10px] bg-accent/10 text-accent border-accent/20">{tag}</span>}
    </div>
    <div className="font-display font-bold text-2xl">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

const OrderCard = ({ order }: { order: { id: string; date: string; status: string; total: number; item: string } }) => (
  <div className="card-soft p-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <div className="font-semibold text-sm">{order.item}</div>
      <div className="text-xs text-muted-foreground">{order.id} Â· {order.date}</div>
    </div>
    <div className="flex items-center gap-4">
      <span className={`pill !text-[11px] ${order.status === "LivrÃ©" ? "bg-tech/10 text-tech border-tech/20" : "bg-accent/10 text-accent border-accent/20"}`}>
        {order.status}
      </span>
      <span className="font-display font-bold tabular-nums">{formatAr(order.total)}</span>
    </div>
  </div>
);

export default Account;
