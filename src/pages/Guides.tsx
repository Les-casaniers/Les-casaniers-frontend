import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight, BookOpen, Calendar, CheckCircle, Clock, Cpu, Eye, Filter, Gamepad,
  Briefcase, Newspaper, Search, Star, Wrench, Zap, Play, Send, Mail,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MiniHero } from "@/components/layout/MiniHero";
import {
  GUIDE_CATEGORIES, Guide, GuideCategory,
  guideCategoryLabels, guideDifficultyColors, guideDifficultyLabels,
  useGuides, useGuidesByCategory, usePopularGuides, useRecentGuides,
  useSubscribeNewsletter, GuideDifficulty,
} from "@/hooks/useGuides";
import { InfoBar } from "@/components/site/InfoBar";
import ServicesSection from "@/components/guide/ServicesSection";
import mascote from "@/assets/3.png";
type TabId = "guides-achat" | "actualites-tech" | "tutos-maintenance" | "services";

// Configuration des onglets
const TABS: { id: TabId; label: string; color: string; activeColor: string }[] = [
  {
    id: "guides-achat",
    label: "Guides d'achat",
    color: "text-purple-500 border-purple-500/30 hover:bg-purple-500/10",
    activeColor: "bg-purple-500/10 border-purple-500/60",
  },
  {
    id: "actualites-tech",
    label: "Actualités Tech",
    color: "text-blue-500 border-blue-500/30 hover:bg-blue-500/10",
    activeColor: "bg-blue-500/10 border-blue-500/60",
  },
  {
    id: "tutos-maintenance",
    label: "Tutos Maintenance",
    color: "text-green-500 border-green-500/30 hover:bg-green-500/10",
    activeColor: "bg-green-500/10 border-green-500/60",
  },
  {
    id: "services",
    label: "Services",
    color: "text-amber-500 border-amber-500/30 hover:bg-amber-500/10",
    activeColor: "bg-amber-500/10 border-amber-500/60",
  },
];

// Couleurs des catégories pour les cartes
const CARD_COLORS: Record<GuideCategory, { gradient: string; badge: string }> = {
  "guides-achat": { gradient: "from-purple-500/10 to-transparent", badge: "bg-purple-500/10 text-purple-500" },
  "actualites-tech": { gradient: "from-blue-500/10 to-transparent", badge: "bg-blue-500/10 text-blue-500" },
  "tutos-maintenance": { gradient: "from-green-500/10 to-transparent", badge: "bg-green-500/10 text-green-500" },
};

/* ───────────── Helpers ───────────── */

const fallbackImages: Record<GuideCategory, string> = {
  "guides-achat": "/image/6.png",
  "actualites-tech": "/image/7.png",
  "tutos-maintenance": "/image/8.png",
};

const categoryIcons: Record<GuideCategory, typeof Gamepad> = {
  "guides-achat": Gamepad,
  "actualites-tech": Newspaper,
  "tutos-maintenance": Wrench,
};

const formatDate = (date?: string | null) => {
  if (!date) return "Non publié";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
};

const guidePath = (guide: Guide) => `/guides/${guide.slug || guide.id}`;

/* ───────────── Guide Card Compact ───────────── */

const GuideCardCompact = ({ guide }: { guide: Guide }) => (
  <article className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
    <Link to={guidePath(guide)} className="relative block overflow-hidden aspect-[16/9]">
      <img
        src={guide.image_url || fallbackImages[guide.categorie]}
        alt={guide.image_alt || guide.titre}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {guide.badge && (
        <span className="absolute top-2 left-2 bg-foreground px-2 py-0.5 text-[9px] font-bold text-background rounded-full">
          {guide.badge}
        </span>
      )}
      <span className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-medium rounded-full ${CARD_COLORS[guide.categorie]?.badge || "bg-secondary/80 text-foreground"}`}>
        {guideCategoryLabels[guide.categorie]}
      </span>
    </Link>
    <div className="p-3 space-y-1.5">
      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
        <span className="inline-flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{formatDate(guide.publie_le)}</span>
        {guide.temps_lecture && <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{guide.temps_lecture}</span>}
        <span className="inline-flex items-center gap-0.5 ml-auto"><Eye className="h-2.5 w-2.5" />{guide.vues ?? 0}</span>
      </div>
      <Link to={guidePath(guide)} className="block text-sm font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
        {guide.titre}
      </Link>
      <p className="text-[10px] text-muted-foreground line-clamp-2">{guide.resume}</p>
      <Link to={guidePath(guide)} className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline">
        Lire <ArrowRight className="h-2.5 w-2.5" />
      </Link>
    </div>
  </article>
);

// Guide Card pour featured (plus grand)
const GuideCardFeatured = ({ guide }: { guide: Guide }) => (
  <article className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 md:grid md:grid-cols-[1fr_1.2fr]">
    <Link to={guidePath(guide)} className="relative block overflow-hidden aspect-video md:aspect-auto">
      <img
        src={guide.image_url || fallbackImages[guide.categorie]}
        alt={guide.image_alt || guide.titre}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {guide.badge && (
        <span className="absolute top-3 left-3 bg-foreground px-2.5 py-1 text-[10px] font-bold text-background rounded-full">
          {guide.badge}
        </span>
      )}
    </Link>
    <div className="p-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
        <span className={`px-2 py-0.5 rounded-full ${CARD_COLORS[guide.categorie]?.badge || "bg-secondary/80"}`}>
          {guideCategoryLabels[guide.categorie]}
        </span>
        <span className="inline-flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{formatDate(guide.publie_le)}</span>
        {guide.temps_lecture && <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{guide.temps_lecture}</span>}
      </div>
      <Link to={guidePath(guide)} className="block text-xl font-bold leading-tight group-hover:text-primary transition-colors">
        {guide.titre}
      </Link>
      <p className="text-xs text-muted-foreground line-clamp-3">{guide.resume}</p>
      <Link to={guidePath(guide)} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
        Lire l'article <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  </article>
);

const CompactGuide = ({ guide }: { guide: Guide }) => (
  <Link to={guidePath(guide)} className="flex gap-3 border-b border-border/50 py-2.5 last:border-0 group">
    <img src={guide.image_url || fallbackImages[guide.categorie]} alt={guide.image_alt || guide.titre} className="h-12 w-12 rounded-lg object-cover shrink-0" />
    <div className="min-w-0 flex-1">
      <span className="block text-[9px] text-muted-foreground">{guideCategoryLabels[guide.categorie]}</span>
      <span className="line-clamp-2 text-xs font-medium leading-tight group-hover:text-primary transition-colors">{guide.titre}</span>
    </div>
  </Link>
);

/* ───────────── Category Sections (avec clé pour forcer le re-render) ───────────── */

const GuidesAchatSection = ({ key }: { key: string }) => {
  const { data: guides = [], refetch } = useGuidesByCategory("guides-achat", 6);

  // Recharger les données quand la clé change (quand l'onglet devient actif)
  useEffect(() => {
    refetch();
  }, [key, refetch]);

  const fallbackGuides = [
    { id: "gaming", title: "PC Gaming", icon: Gamepad, color: "purple", description: "Pour les passionnés de jeux vidéo", price: "2 490 000 Ar - 8 990 000 Ar", features: ["RTX 4060 → 4090", "Intel i5/i7/i9 ou Ryzen", "16-32GB DDR5", "SSD NVMe 512GB-2TB"] },
    { id: "bureautique", title: "PC Bureautique", icon: Briefcase, color: "blue", description: "Pour le travail et le multitâche", price: "1 200 000 Ar - 2 500 000 Ar", features: ["Intel i3/i5 ou Ryzen 3/5", "8-16GB RAM", "SSD 256-512GB"] },
    { id: "workstation", title: "Station de travail", icon: Cpu, color: "green", description: "Pour les pros (montage, 3D)", price: "5 000 000 Ar - 15 000 000 Ar", features: ["Intel i9 / Threadripper", "32-128GB ECC RAM", "SSD NVMe + HDD"] },
  ];

  const colorMap: Record<string, string> = { purple: "from-purple-500 to-indigo-500", blue: "from-blue-500 to-cyan-500", green: "from-green-500 to-emerald-500" };

  return (
  <section id="guides-achat" className="relative left-1/2 w-screen -translate-x-1/2 py-6 scroll-mt-10">
  <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center gap-2 mb-5">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
        <Gamepad className="h-4 w-4 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-bold">Guides d'acha</h2>
        <p className="text-[10px] text-muted-foreground">Choisissez la configuration idéale</p>
      </div>
    </div>

    {guides.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((g) => <GuideCardCompact key={g.id} guide={g} />)}
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fallbackGuides.map((guide) => (
          <div key={guide.id} className="bg-card border border-border/50 rounded-xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className={`inline-flex h-8 w-8 rounded-lg bg-gradient-to-br ${colorMap[guide.color]} items-center justify-center mb-3`}>
              <guide.icon className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-sm mb-1">{guide.title}</h3>
            <p className="text-[10px] text-muted-foreground mb-2">{guide.description}</p>
            <p className="text-xs font-bold text-primary mb-3">{guide.price}</p>
            <div className="space-y-1 mb-3">
              {guide.features.slice(0, 2).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[9px]">
                  <CheckCircle className="h-2.5 w-2.5 text-green-500 shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
            <Link to="/configurateur" className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline">
              Configurer <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
        ))}
      </div>
    )}

    <div className="mt-5 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
      <p className="text-[10px] flex items-center gap-1.5">
        <Zap className="h-3 w-3 text-amber-500 shrink-0" />
        <span><strong>Conseil Casanier :</strong> Privilégiez les composants avec garantie internationale !</span>
      </p>
    </div>
  </div>
</section>
  );
};

const ActualitesTechSection = ({ key }: { key: string }) => {
  const { data: articles = [], refetch } = useGuidesByCategory("actualites-tech", 6);
  
  useEffect(() => {
    refetch();
  }, [key, refetch]);

  const fallbackArticles = [
    { id: "1", title: "Nouveautés NVIDIA RTX 5000", icon: Newspaper, color: "blue", description: "Les prochaines cartes graphiques arrivent", date: "15 Mai 2024", views: 1250 },
    { id: "2", title: "AMD Ryzen 9000 series", icon: Newspaper, color: "blue", description: "Performance record annoncée", date: "10 Mai 2024", views: 980 },
    { id: "3", title: "Windows 12 : premières infos", icon: Newspaper, color: "blue", description: "Ce qui change dans le nouvel OS", date: "5 Mai 2024", views: 2100 },
  ];

  const colorMap: Record<string, string> = { 
    purple: "from-purple-500 to-indigo-500", 
    blue: "from-blue-500 to-cyan-500", 
    green: "from-green-500 to-emerald-500" 
  };

  return (
    <section id="actualites-tech" className="py-8 scroll-mt-20 border-t border-border">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Newspaper className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Actualités Tech</h2>
          <p className="text-[10px] text-muted-foreground">Les dernières nouvelles</p>
        </div>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => <GuideCardCompact key={article.id} guide={article} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fallbackArticles.map((article) => (
            <div key={article.id} className="bg-card border border-border/50 rounded-xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className={`inline-flex h-8 w-8 rounded-lg bg-gradient-to-br ${colorMap[article.color]} items-center justify-center mb-3`}>
                <article.icon className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-sm mb-1 line-clamp-1">{article.title}</h3>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground mb-2">
                <span className="inline-flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{article.date}</span>
                <span className="inline-flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{article.views}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3 line-clamp-2">{article.description}</p>
              <Link to="/guides" className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline">
                Lire l'article <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-[10px] flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-blue-500 shrink-0" />
          <span><strong>À la une :</strong> Restez informés des dernières innovations technologiques !</span>
        </p>
      </div>
    </section>
  );
};

const TutosMaintenanceSection = ({ key }: { key: string }) => {
  const { data: tutos = [], refetch } = useGuidesByCategory("tutos-maintenance", 6);
  
  useEffect(() => {
    refetch();
  }, [key, refetch]);

  const fallbackTutos = [
    { id: "1", title: "Nettoyer son PC", icon: Wrench, color: "green", description: "Guide complet pour dépoussiérer", duration: "15 min", difficulty: "Facile" },
    { id: "2", title: "Changer la pâte thermique", icon: Wrench, color: "green", description: "Améliorez les performances", duration: "30 min", difficulty: "Moyen" },
    { id: "3", title: "Optimiser Windows", icon: Wrench, color: "green", description: "Boostez les performances", duration: "20 min", difficulty: "Facile" },
  ];

  const colorMap: Record<string, string> = { 
    purple: "from-purple-500 to-indigo-500", 
    blue: "from-blue-500 to-cyan-500", 
    green: "from-green-500 to-emerald-500" 
  };

  return (
    <section id="tutos-maintenance" className="py-8 scroll-mt-20 border-t border-border">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Wrench className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Tutos Maintenance</h2>
          <p className="text-[10px] text-muted-foreground">Entretenez votre matériel</p>
        </div>
      </div>

      {tutos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tutos.map((tuto) => <GuideCardCompact key={tuto.id} guide={tuto} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fallbackTutos.map((tuto) => (
            <div key={tuto.id} className="bg-card border border-border/50 rounded-xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className={`inline-flex h-8 w-8 rounded-lg bg-gradient-to-br ${colorMap[tuto.color]} items-center justify-center mb-3`}>
                <tuto.icon className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-sm mb-1 line-clamp-1">{tuto.title}</h3>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground mb-2">
                <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{tuto.duration}</span>
                <span className="inline-flex items-center gap-0.5"><CheckCircle className="h-2.5 w-2.5 text-green-500" />{tuto.difficulty}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3 line-clamp-2">{tuto.description}</p>
              <Link to="/guides" className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline">
                Voir le tuto <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
        <p className="text-[10px] flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-green-500 shrink-0" />
          <span><strong>Astuce :</strong> Un entretien régulier prolonge la durée de vie de votre PC !</span>
        </p>
      </div>
    </section>
  );
};

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeNewsletter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate(email.trim(), { onSuccess: () => setEmail("") });
  };

  return (
    <section className="py-8 border-t border-border">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex p-2 bg-primary/10 rounded-full mb-3">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-lg font-bold mb-1">Restez informé</h2>
        <p className="text-[10px] text-muted-foreground mb-4">Recevez nos derniers guides et bons plans</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required className="flex-1 h-9 border border-border bg-background px-3 text-xs rounded-lg focus:border-primary outline-none" />
          <button type="submit" disabled={subscribe.isPending} className="h-9 px-4 bg-primary text-xs font-medium text-primary-foreground rounded-lg disabled:opacity-60 transition-all hover:-translate-y-0.5">
            {subscribe.isPending ? "..." : "S'inscrire"}
          </button>
        </form>
        {subscribe.isSuccess && <p className="mt-2 text-[10px] text-green-600">✓ Inscription réussie !</p>}
        {subscribe.isError && <p className="mt-2 text-[10px] text-red-600">Une erreur est survenue</p>}
      </div>
    </section>
  );
};

/* ───────────── Main Guides Page ───────────── */

const Guides = () => {
  const [params, setParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(params.get("search") ?? "");
  const [activeTab, setActiveTab] = useState<TabId>("guides-achat");
  const [visible, setVisible] = useState(true);
  const [tabKey, setTabKey] = useState(0); // Clé pour forcer le rechargement des sections

  const page = Number(params.get("page") ?? 1);
  const category = (params.get("categorie") ?? "") as GuideCategory | "";
  const sort = (params.get("sort") as "recent" | "popular" | null) ?? "recent";
  const search = params.get("search") ?? "";

  const isSectionedView = !category && !search && page === 1;

  const filters = useMemo(() => ({ page, per_page: 9, categorie: category, search, sort }), [page, category, search, sort]);
  const { data, isLoading, isError } = useGuides(filters);
  const { data: recentGuides = [] } = useRecentGuides(4);
  const { data: popularGuides = [] } = usePopularGuides(4);

  useEffect(() => {
    document.title = "Guides & Services - Les Casaniers Madagascar";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    meta.setAttribute("content", "Guides d'achat, actualités tech, tutoriels maintenance et services professionnels pour bien choisir et entretenir votre PC à Madagascar.");
  }, []);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setParams(next);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateParam("search", searchDraft.trim());
  };

  const switchTab = (id: TabId) => {
    if (id === activeTab) return;
    setVisible(false);
    setTimeout(() => {
      setActiveTab(id);
      setTabKey(prev => prev + 1); // Incrémenter la clé pour forcer le rechargement
      setVisible(true);
    }, 200);
  };

  const guides = data?.data ?? [];
  const featured = guides[0];
  const remaining = featured ? guides.slice(1) : guides;

  // Fonction pour afficher la section active avec une clé unique
  const renderActiveSection = () => {
    const key = `${activeTab}-${tabKey}`;
    switch (activeTab) {
      case "guides-achat": return <GuidesAchatSection key={key} />;
      case "actualites-tech": return <ActualitesTechSection key={key} />;
      case "tutos-maintenance": return <TutosMaintenanceSection key={key} />;
      case "services": return <ServicesSection />;
      default: return <GuidesAchatSection key={key} />;
    }
  };

  return (
    <SiteLayout>
<div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-6">
      {/* 1. Composant MiniHero */}
      <MiniHero
        title="Guides, Services & Actualités."
        description={
          <div className="flex flex-col">
            <p>Des conseils concrets pour choisir, importer, monter</p>
            <p className="pl-[2.5rem] sm:pl-[4.5rem] md:pl-[6rem]">
              et entretenir votre matériel à Madagascar, avec un accompagnement sur mesure.
            </p>
          </div>
        }
        bg="/6.png" // Image provenant du dossier public/
        mascot={mascote}
        pill={{ 
          icon: <BookOpen className="h-3.5 w-3.5" />, 
          label: "Guides & Services" 
        }}
      />

      {/* 2. InfoBar positionnée juste en dessous */}
      <InfoBar />
    </div>
      {isSectionedView && (
        <nav className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="container-x py-3">
            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id)}
                    className={`text-xs font-semibold px-2 py-2 rounded-full border transition-all text-center ${
                      isActive ? `${tab.color} ${tab.activeColor}` : `${tab.color} opacity-60 hover:opacity-100`
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      <main className="container-x py-6">
        {/* Search + Filters Bar compact (masqué dans la vue services car non pertinent) */}
        {activeTab !== "services" && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <form onSubmit={submitSearch} className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={searchDraft} onChange={(e) => setSearchDraft(e.target.value)} placeholder="Rechercher..." className="h-8 w-full border border-border bg-background pl-8 pr-3 text-xs rounded-lg focus:border-primary outline-none" />
            </form>
            <select value={category} onChange={(e) => updateParam("categorie", e.target.value)} className="h-8 border border-border bg-background px-2 text-xs rounded-lg">
              <option value="">Toutes</option>
              {GUIDE_CATEGORIES.map((item) => (<option key={item} value={item}>{guideCategoryLabels[item]}</option>))}
            </select>
            <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className="h-8 border border-border bg-background px-2 text-xs rounded-lg">
              <option value="recent">Plus récents</option>
              <option value="popular">Populaires</option>
            </select>
          </div>
        )}

        {isSectionedView ? (
          <div style={{ transition: "opacity 200ms ease, transform 200ms ease", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}>
            {renderActiveSection()}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-base font-bold"><BookOpen className="h-4 w-4" /> Guides</h2>
                <span className="text-[10px] text-muted-foreground">{data?.total ?? 0} résultat(s)</span>
              </div>

              {isLoading && <div className="border border-border p-6 text-center text-muted-foreground">Chargement...</div>}
              {isError && <div className="border border-destructive p-6 text-center text-destructive">Erreur de chargement</div>}
              {!isLoading && !isError && guides.length === 0 && <div className="border border-border p-6 text-center text-muted-foreground">Aucun guide trouvé</div>}

              {featured && <GuideCardFeatured guide={featured} />}
              {remaining.length > 0 && (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {remaining.map((guide) => <GuideCardCompact key={guide.id} guide={guide} />)}
                </div>
              )}

              {data && data.last_page > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button disabled={data.current_page <= 1} onClick={() => updateParam("page", String(data.current_page - 1))} className="border border-border px-3 py-1 text-xs rounded-lg disabled:opacity-50 hover:bg-secondary">Précédent</button>
                  <span className="text-xs text-muted-foreground">{data.current_page} / {data.last_page}</span>
                  <button disabled={data.current_page >= data.last_page} onClick={() => updateParam("page", String(data.current_page + 1))} className="border border-border px-3 py-1 text-xs rounded-lg disabled:opacity-50 hover:bg-secondary">Suivant</button>
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <div className="border border-border rounded-lg p-3">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold"><Filter className="h-3 w-3" /> Catégories</h3>
                <div className="space-y-1">
                  <button onClick={() => updateParam("categorie", "")} className={`w-full px-2 py-1 text-left text-[10px] rounded ${!category ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>Toutes</button>
                  {GUIDE_CATEGORIES.map((item) => {
                    const Icon = categoryIcons[item];
                    return (<button key={item} onClick={() => updateParam("categorie", item)} className={`flex items-center gap-1.5 w-full px-2 py-1 text-left text-[10px] rounded ${category === item ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}><Icon className="h-3 w-3" /> {guideCategoryLabels[item]}</button>);
                  })}
                </div>
              </div>
              <div className="border border-border rounded-lg p-3">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold"><Star className="h-3 w-3" /> Populaires</h3>
                {popularGuides.map((guide) => <CompactGuide key={guide.id} guide={guide} />)}
              </div>
              <div className="border border-border rounded-lg p-3">
                <h3 className="mb-2 text-xs font-bold">Récents</h3>
                {recentGuides.map((guide) => <CompactGuide key={guide.id} guide={guide} />)}
              </div>
            </aside>
          </div>
        )}
        
        {isSectionedView && (activeTab === "guides-achat" || activeTab === "services") && <NewsletterSection />}
      </main>
    </SiteLayout>
  );
};

export default Guides;