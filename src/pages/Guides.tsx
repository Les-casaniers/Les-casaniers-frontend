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

const categoryColors: Record<GuideCategory, { border: string; bg: string; text: string }> = {
  "guides-achat": { border: "border-l-purple-500", bg: "bg-purple-500/10", text: "text-purple-500" },
  "actualites-tech": { border: "border-l-blue-500", bg: "bg-blue-500/10", text: "text-blue-500" },
  "tutos-maintenance": { border: "border-l-green-500", bg: "bg-green-500/10", text: "text-green-500" },
};

const formatDate = (date?: string | null) => {
  if (!date) return "Non publié";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
};

const guidePath = (guide: Guide) => `/guides/${guide.slug || guide.id}`;

/* ───────────── Guide Card (used in listing) ───────────── */

const GuideCard = ({ guide, featured = false }: { guide: Guide; featured?: boolean }) => (
  <article
    className={`group overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
      featured ? "md:grid md:grid-cols-[1.05fr_0.95fr]" : ""
    }`}
  >
    <Link to={guidePath(guide)} className="relative block overflow-hidden bg-muted">
      <img
        src={guide.image_url || fallbackImages[guide.categorie]}
        alt={guide.image_alt || guide.titre}
        className={`w-full object-cover transition duration-500 group-hover:scale-105 ${featured ? "h-full min-h-72" : "h-52"}`}
      />
      {guide.badge && (
        <span className="absolute left-3 top-3 bg-foreground px-3 py-1 text-xs font-bold text-background">
          {guide.badge}
        </span>
      )}
      {guide.mis_en_avant && !guide.badge && (
        <span className="absolute left-3 top-3 bg-amber-500 px-3 py-1 text-xs font-bold text-white">
          ⭐ En vedette
        </span>
      )}
    </Link>
    <div className="flex min-h-full flex-col p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className={`border px-2 py-1 ${categoryColors[guide.categorie].bg} ${categoryColors[guide.categorie].text} border-transparent font-medium`}>
          {guideCategoryLabels[guide.categorie]}
        </span>
        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(guide.publie_le)}</span>
        {guide.temps_lecture && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{guide.temps_lecture}</span>}
        {guide.difficulte && (
          <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase ${guideDifficultyColors[guide.difficulte]}`}>
            {guideDifficultyLabels[guide.difficulte]}
          </span>
        )}
      </div>
      <Link to={guidePath(guide)} className="text-xl font-bold leading-tight hover:text-primary md:text-2xl">
        {guide.titre}
      </Link>
      {guide.budget_range && (
        <p className="mt-2 text-sm font-semibold text-primary">{guide.budget_range}</p>
      )}
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{guide.resume}</p>
      {guide.composants_recommandes && guide.composants_recommandes.length > 0 && (
        <div className="mt-3 space-y-1">
          {guide.composants_recommandes.slice(0, 3).map((comp, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
              <span className="truncate">{comp}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between pt-5 text-sm">
        <span className="inline-flex items-center gap-1 text-muted-foreground"><Eye className="h-4 w-4" />{guide.vues ?? 0}</span>
        <Link to={guidePath(guide)} className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
          {guide.categorie === "tutos-maintenance" ? "Voir le tuto" : "Lire"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </article>
);

const CompactGuide = ({ guide }: { guide: Guide }) => (
  <Link to={guidePath(guide)} className="grid grid-cols-[76px_1fr] gap-3 border-b border-border py-3 last:border-0 group">
    <img src={guide.image_url || fallbackImages[guide.categorie]} alt={guide.image_alt || guide.titre} className="h-16 w-full rounded object-cover" />
    <span className="min-w-0">
      <span className="block text-xs text-muted-foreground">{guideCategoryLabels[guide.categorie]}</span>
      <span className="line-clamp-2 text-sm font-medium leading-5 group-hover:text-primary transition-colors">{guide.titre}</span>
    </span>
  </Link>
);

/* ───────────── Category Section (Guides d'achat view) ───────────── */

const GuidesAchatSection = () => {
  const { data: guides = [] } = useGuidesByCategory("guides-achat", 6);

  const fallbackGuides = [
    { id: "gaming", title: "PC Gaming", icon: Gamepad, color: "text-purple-500", bgColor: "bg-purple-500/10", borderColor: "border-l-purple-500", description: "Pour les passionnés de jeux vidéo", price: "2 490 000 Ar - 8 990 000 Ar", features: ["Carte graphique RTX 4060 → RTX 4090", "Processeur Intel i5/i7/i9 ou AMD Ryzen", "RAM 16GB à 32GB DDR5", "SSD NVMe 512GB à 2TB"] },
    { id: "bureautique", title: "PC Bureautique", icon: Briefcase, color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-l-blue-500", description: "Pour le travail et le multitâche", price: "1 200 000 Ar - 2 500 000 Ar", features: ["Processeur Intel i3/i5 ou AMD Ryzen 3/5", "RAM 8GB à 16GB", "SSD 256GB à 512GB", "Connectique USB, HDMI, Ethernet"] },
    { id: "workstation", title: "Station de travail", icon: Cpu, color: "text-green-500", bgColor: "bg-green-500/10", borderColor: "border-l-green-500", description: "Pour les pros (montage, 3D, data)", price: "5 000 000 Ar - 15 000 000 Ar", features: ["Intel i9 / AMD Threadripper", "RAM 32GB à 128GB ECC", "SSD NVMe + HDD", "Carte pro RTX / Quadro"] },
  ];

  return (
    <section id="guides-achat" className="py-12 scroll-mt-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Gamepad className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Guides d'achat</h2>
          <p className="text-sm text-muted-foreground">Choisissez la configuration idéale selon votre budget</p>
        </div>
      </div>

      {guides.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {guides.map((g) => <GuideCard key={g.id} guide={g} />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {fallbackGuides.map((guide) => (
            <div key={guide.id} className={`border-l-4 ${guide.borderColor} bg-card border border-border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
              <div className={`inline-flex p-2.5 rounded-lg ${guide.bgColor} ${guide.color} mb-4`}>
                <guide.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{guide.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{guide.description}</p>
              <p className="text-lg font-bold text-primary mb-4">{guide.price}</p>
              <div className="space-y-2 mb-5">
                {guide.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link to="/configurateur" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Configurer mon PC <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 p-4 rounded-lg">
        <p className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500 shrink-0" />
          <span><strong>Conseil Casanier :</strong> Privilégiez les composants avec garantie internationale et un bon SAV local à Madagascar !</span>
        </p>
      </div>
    </section>
  );
};

/* ───────────── Actualités Tech Section ───────────── */

const ActualitesTechSection = () => {
  const { data: articles = [] } = useGuidesByCategory("actualites-tech", 4);

  if (articles.length === 0) return null;

  return (
    <section id="actualites-tech" className="py-12 scroll-mt-20 border-t border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Newspaper className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Actualités Tech</h2>
          <p className="text-sm text-muted-foreground">Les dernières nouvelles du monde informatique</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {articles.map((article, idx) => (
          <GuideCard key={article.id} guide={article} featured={idx === 0} />
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link to="/guides?categorie=actualites-tech" className="btn-secondary px-6 py-2.5 text-sm">
          Voir toutes les actualités <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </section>
  );
};

/* ───────────── Tutos Maintenance Section ───────────── */

const TutosMaintenanceSection = () => {
  const { data: tutos = [] } = useGuidesByCategory("tutos-maintenance", 4);

  if (tutos.length === 0) return null;

  return (
    <section id="tutos-maintenance" className="py-12 scroll-mt-20 border-t border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <Wrench className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Tutos Maintenance</h2>
          <p className="text-sm text-muted-foreground">Apprenez à entretenir et optimiser votre matériel</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tutos.map((tuto) => (
          <article key={tuto.id} className="group border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <Link to={guidePath(tuto)} className="relative block overflow-hidden">
              <img
                src={tuto.image_url || fallbackImages["tutos-maintenance"]}
                alt={tuto.image_alt || tuto.titre}
                className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
              />
              {tuto.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                    <Play className="h-5 w-5 text-foreground ml-0.5" />
                  </div>
                </div>
              )}
              {tuto.difficulte && (
                <span className={`absolute right-3 top-3 px-2 py-0.5 text-[10px] font-bold uppercase ${guideDifficultyColors[tuto.difficulte]}`}>
                  {guideDifficultyLabels[tuto.difficulte]}
                </span>
              )}
            </Link>
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                {tuto.duree && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{tuto.duree}</span>}
                {tuto.etapes && <span>{tuto.etapes.length} étapes</span>}
              </div>
              <Link to={guidePath(tuto)} className="block text-sm font-bold leading-tight group-hover:text-primary transition-colors">
                {tuto.titre}
              </Link>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{tuto.resume}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link to="/guides?categorie=tutos-maintenance" className="btn-secondary px-6 py-2.5 text-sm">
          Voir tous les tutos <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </section>
  );
};

/* ───────────── Newsletter Section ───────────── */

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeNewsletter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate(email.trim(), {
      onSuccess: () => { setEmail(""); },
    });
  };

  return (
    <section className="py-12 border-t border-border">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex p-3 bg-primary/5 rounded-full mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Restez informé</h2>
        <p className="text-muted-foreground mb-6">
          Recevez nos derniers guides, bons plans et actualités tech directement dans votre boîte mail.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className="flex-1 h-11 border border-border bg-background px-4 text-sm outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="h-11 inline-flex items-center gap-2 bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60 transition-all hover:-translate-y-0.5"
          >
            <Send className="h-4 w-4" />
            {subscribe.isPending ? "..." : "S'inscrire"}
          </button>
        </form>
        {subscribe.isSuccess && (
          <p className="mt-3 text-sm text-green-600 dark:text-green-400 animate-fade-up">
            ✓ Inscription réussie ! Merci de votre confiance.
          </p>
        )}
        {subscribe.isError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400 animate-fade-up">
            {(subscribe.error as any)?.response?.data?.message || "Une erreur est survenue. Veuillez réessayer."}
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Pas de spam, désabonnement en un clic.</p>
      </div>
    </section>
  );
};

/* ───────────── Main Guides Page ───────────── */

const Guides = () => {
  const [params, setParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(params.get("search") ?? "");

  const page = Number(params.get("page") ?? 1);
  const category = (params.get("categorie") ?? "") as GuideCategory | "";
  const sort = (params.get("sort") as "recent" | "popular" | null) ?? "recent";
  const search = params.get("search") ?? "";

  // Show sectioned view when there are no filters
  const isSectionedView = !category && !search && page === 1;

  const filters = useMemo(
    () => ({ page, per_page: 9, categorie: category, search, sort }),
    [page, category, search, sort],
  );

  const { data, isLoading, isError } = useGuides(filters);
  const { data: recentGuides = [] } = useRecentGuides(4);
  const { data: popularGuides = [] } = usePopularGuides(4);

  useEffect(() => {
    document.title = "Guides - Les Casaniers Madagascar";
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    meta.setAttribute("content", "Guides d'achat, actualités tech et tutoriels maintenance pour bien choisir et entretenir votre PC à Madagascar.");
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

  const guides = data?.data ?? [];
  const featured = guides[0];
  const remaining = featured ? guides.slice(1) : guides;

  return (
    <SiteLayout>
      <MiniHero
        title="Guides, Actualités & Tutos."
        description="Des conseils concrets pour choisir, importer, monter et entretenir votre matériel à Madagascar."
        bg="6.png"
      />

      <main className="container-x py-10">
        {/* ───── Search + Filters Bar ───── */}
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          <form onSubmit={submitSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Rechercher un guide, une actualité, un tuto..."
              className="h-11 w-full border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary transition-colors"
            />
          </form>
          <select value={category} onChange={(event) => updateParam("categorie", event.target.value)} className="h-11 border border-border bg-background px-3 text-sm">
            <option value="">Toutes les catégories</option>
            {GUIDE_CATEGORIES.map((item) => (
              <option key={item} value={item}>{guideCategoryLabels[item]}</option>
            ))}
          </select>
          <select value={sort} onChange={(event) => updateParam("sort", event.target.value)} className="h-11 border border-border bg-background px-3 text-sm">
            <option value="recent">Plus récents</option>
            <option value="popular">Populaires</option>
          </select>
        </div>

        {/* ───── Sectioned View (home-style) ───── */}
        {isSectionedView ? (
          <div className="space-y-0">
            <GuidesAchatSection />
            <ActualitesTechSection />
            <TutosMaintenanceSection />
            <NewsletterSection />
          </div>
        ) : (
          /* ───── Filtered / Search Results View ───── */
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <section>
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-2xl font-bold"><BookOpen className="h-6 w-6" /> Guides</h2>
                <span className="text-sm text-muted-foreground">{data?.total ?? 0} résultat(s)</span>
              </div>

              {isLoading && <div className="border border-border p-8 text-center text-muted-foreground animate-pulse">Chargement des guides...</div>}
              {isError && <div className="border border-destructive p-8 text-center text-destructive">Impossible de charger les guides.</div>}
              {!isLoading && !isError && guides.length === 0 && (
                <div className="border border-border p-8 text-center text-muted-foreground">Aucun guide ne correspond à votre recherche.</div>
              )}

              {featured && <GuideCard guide={featured} featured />}
              {remaining.length > 0 && (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {remaining.map((guide) => <GuideCard key={guide.id} guide={guide} />)}
                </div>
              )}

              {data && data.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={data.current_page <= 1}
                    onClick={() => updateParam("page", String(data.current_page - 1))}
                    className="border border-border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-secondary transition-colors"
                  >
                    Précédent
                  </button>
                  <span className="px-3 text-sm text-muted-foreground">Page {data.current_page} / {data.last_page}</span>
                  <button
                    disabled={data.current_page >= data.last_page}
                    onClick={() => updateParam("page", String(data.current_page + 1))}
                    className="border border-border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-secondary transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <div className="border border-border p-5">
                <h3 className="mb-2 flex items-center gap-2 font-bold"><Filter className="h-4 w-4" /> Catégories</h3>
                <div className="grid gap-2">
                  <button onClick={() => updateParam("categorie", "")} className={`border border-border px-3 py-2 text-left text-sm transition-colors ${!category ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                    Toutes les catégories
                  </button>
                  {GUIDE_CATEGORIES.map((item) => {
                    const Icon = categoryIcons[item];
                    return (
                      <button key={item} onClick={() => updateParam("categorie", item)} className={`flex items-center gap-2 border border-border px-3 py-2 text-left text-sm transition-colors ${category === item ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                        <Icon className="h-4 w-4" /> {guideCategoryLabels[item]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="border border-border p-5">
                <h3 className="mb-1 flex items-center gap-2 font-bold"><Star className="h-4 w-4" /> Populaires</h3>
                {popularGuides.map((guide) => <CompactGuide key={guide.id} guide={guide} />)}
              </div>
              <div className="border border-border p-5">
                <h3 className="mb-1 font-bold">Récents</h3>
                {recentGuides.map((guide) => <CompactGuide key={guide.id} guide={guide} />)}
              </div>
            </aside>
          </div>
        )}
      </main>
    </SiteLayout>
  );
};

export default Guides;
