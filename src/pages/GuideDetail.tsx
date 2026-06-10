import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Calendar, CheckCircle, Clock, Eye, ExternalLink,
  MessageCircle, Play, Share2, UserRound, Wrench, Heart, BookmarkPlus,
  ChevronRight, AlertCircle, Shield, Truck, CreditCard, Headphones, X,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  guideCategoryLabels, guideDifficultyColors, guideDifficultyLabels,
  useGuide, usePopularGuides,
} from "@/hooks/useGuides";

const fallbackImage = "/image/6.png";

const formatDate = (date?: string | null) => {
  if (!date) return "Non publié";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
};

const extractYoutubeId = (url?: string | null): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match ? match[1] : null;
};

const guidePath = (guide: { id: number; slug?: string | null }) => `/guides/${guide.slug || guide.id}`;

// Composant Table des matières compact
const TableOfContents = ({ content }: { content: string }) => {
  const [headings, setHeadings] = useState<{ text: string; level: number; id: string }[]>([]);

  useEffect(() => {
    const matches = content.match(/^## (.+)$|^### (.+)$/gm) || [];
    const extracted = matches.map((match, idx) => {
      const isH2 = match.startsWith("## ");
      const text = match.replace(/^##+ /, "");
      return { text, level: isH2 ? 2 : 3, id: `section-${idx}` };
    });
    setHeadings(extracted);
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-border/50 bg-secondary/20 p-4">
      <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sommaire</h2>
      <ul className="space-y-1">
        {headings.map((heading, idx) => (
          <li key={idx}>
            <a
              href={`#section-${idx}`}
              className={`text-[11px] transition-colors hover:text-primary ${
                heading.level === 2 ? "font-medium" : "ml-3 text-muted-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(`section-${idx}`);
                if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const GuideDetail = () => {
  const { id } = useParams();
  const { data: guide, isLoading, isError } = useGuide(id);
  const { data: popularGuides = [] } = usePopularGuides(4);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!guide) return;
    document.title = `${guide.titre} - Les Casaniers Madagascar`;
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(
      Object.assign(document.createElement("meta"), { name: "description" })
    );
    meta.setAttribute("content", guide.resume);
  }, [guide]);

  const youtubeId = extractYoutubeId(guide?.video_url);

  return (
    <SiteLayout>
      <main className="container-x py-6">
        {/* Breadcrumb compact */}
        <nav className="mb-5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <Link to="/guides" className="hover:text-primary transition-colors">Guides</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <span className="text-foreground truncate max-w-[200px]">{guide?.titre?.slice(0, 40) || "Guide"}</span>
        </nav>

        {isLoading && (
          <div className="flex flex-col items-center justify-center border border-border/50 rounded-lg p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="mt-3 text-xs text-muted-foreground">Chargement du guide...</p>
          </div>
        )}
        
        {isError && (
          <div className="flex flex-col items-center justify-center border border-destructive/30 bg-destructive/5 rounded-lg p-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <h2 className="text-lg font-bold mb-1">Guide introuvable</h2>
            <p className="text-xs text-muted-foreground mb-4">Le guide que vous recherchez n'existe pas ou a été supprimé.</p>
            <Link to="/guides" className="inline-flex items-center gap-1.5 bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground rounded-lg hover:opacity-90 transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Retour aux guides
            </Link>
          </div>
        )}

        {guide && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* ───── Main Article ───── */}
            <article>
              {/* Meta badges compacts */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                  {guideCategoryLabels[guide.categorie]}
                </span>
                {guide.badge && (
                  <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    ⭐ {guide.badge}
                  </span>
                )}
                {guide.difficulte && (
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${guideDifficultyColors[guide.difficulte]}`}>
                    {guideDifficultyLabels[guide.difficulte]}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
                {guide.titre}
              </h1>
              
              {/* Info bar compacte */}
              <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-border/50 pb-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(guide.publie_le)}</span>
                {guide.temps_lecture && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {guide.temps_lecture}</span>}
                {guide.auteur && <span className="inline-flex items-center gap-1"><UserRound className="h-3 w-3" /> {guide.auteur}</span>}
                <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {guide.vues?.toLocaleString()} vues</span>
              </div>

              {/* Resume */}
              <div className="mt-4 rounded-lg bg-primary/5 border-l-3 border-primary p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{guide.resume}</p>
              </div>

              {/* Tags */}
              {guide.tags && guide.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {guide.tags.map((tag, idx) => (
                    <span key={idx} className="rounded-full bg-secondary/50 px-2 py-0.5 text-[9px] font-medium text-secondary-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons compacts */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition-all ${
                    isLiked ? "border-red-500 bg-red-500/10 text-red-500" : "border-border/70 hover:bg-secondary"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-red-500" : ""}`} />
                  {isLiked ? "Aimé" : "J'aime"}
                </button>
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition-all ${
                    isBookmarked ? "border-primary bg-primary/10 text-primary" : "border-border/70 hover:bg-secondary"
                  }`}
                >
                  <BookmarkPlus className="h-3.5 w-3.5" />
                  {isBookmarked ? "Enregistré" : "Enregistrer"}
                </button>
                <button
                  onClick={() => navigator.share?.({ title: guide.titre, url: window.location.href }).catch(() => {})}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-[11px] hover:bg-secondary transition-all"
                >
                  <Share2 className="h-3.5 w-3.5" /> Partager
                </button>
              </div>

              {/* Cover image */}
              <div className="group relative mt-5 overflow-hidden rounded-lg">
                <img
                  src={guide.image_url || fallbackImage}
                  alt={guide.image_alt || guide.titre}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ maxHeight: "400px" }}
                />
              </div>

              {/* Budget range */}
              {guide.budget_range && (
                <div className="mt-5 rounded-lg bg-gradient-to-r from-primary/15 to-transparent border-l-3 border-primary p-4">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Budget recommandé</p>
                  <p className="text-xl font-bold text-primary">{guide.budget_range}</p>
                </div>
              )}

              {/* Table des matières */}
              <TableOfContents content={guide.contenu || ""} />

              {/* Components list */}
              {guide.composants_recommandes && guide.composants_recommandes.length > 0 && (
                <div className="mt-5 rounded-lg border border-border/50 bg-secondary/20 p-4">
                  <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
                    <Wrench className="h-4 w-4 text-primary" />
                    Composants recommandés
                  </h2>
                  <div className="grid gap-2 md:grid-cols-2">
                    {guide.composants_recommandes.map((comp, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                        <span className="text-[11px]">{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube video */}
              {youtubeId && (
                <div className="mt-5">
                  <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
                    <Play className="h-4 w-4 text-red-500" />
                    Vidéo tutoriel
                  </h2>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={guide.titre}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                </div>
              )}

              {/* Steps */}
              {guide.etapes && guide.etapes.length > 0 && (
                <div className="mt-5">
                  <h2 className="mb-4 flex items-center gap-1.5 text-sm font-bold">
                    <span className="text-base">📋</span>
                    Étapes du tutoriel
                  </h2>
                  <div className="space-y-3">
                    {guide.etapes.map((step, idx) => (
                      <div key={idx} className="flex gap-3 rounded-lg border border-border/50 p-3 transition-all hover:border-primary/30 hover:shadow-sm">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {idx + 1}
                        </div>
                        <p className="flex-1 text-[11px] leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Article content */}
              <div className="prose prose-sm prose-headings:scroll-mt-16 prose-headings:font-bold prose-h2:text-base prose-h3:text-sm prose-p:text-xs prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground mt-5 max-w-none dark:prose-invert">
                {guide.contenu.split(/\n{2,}/).map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return <h2 key={index} id={`section-${index}`} className="scroll-mt-16">{paragraph.replace("## ", "")}</h2>;
                  }
                  if (paragraph.startsWith("### ")) {
                    return <h3 key={index} id={`section-${index}`} className="scroll-mt-16">{paragraph.replace("### ", "")}</h3>;
                  }
                  if (paragraph.startsWith("- ") || paragraph.match(/^\d+\. /)) {
                    return (
                      <ul key={index} className="space-y-1">
                        {paragraph.split("\n").map((item, i) => (
                          <li key={i} className="text-xs">{item.replace(/^[-•]\s*|^\d+\.\s*/, "")}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={index} className="text-xs leading-relaxed">{paragraph}</p>;
                })}
              </div>

              {/* Share buttons footer */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-5">
                <div className="flex flex-wrap gap-2">
                  <a href={`https://wa.me/?text=${encodeURIComponent(guide.titre + " - " + window.location.href)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-[10px] font-medium text-white transition-all hover:-translate-y-0.5">
                    <MessageCircle className="h-3 w-3" /> WhatsApp
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#1877f2] px-3 py-1.5 text-[10px] font-medium text-white transition-all hover:-translate-y-0.5">
                    <Share2 className="h-3 w-3" /> Facebook
                  </a>
                </div>
                <Link to="/devis-express" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[10px] font-medium text-primary-foreground transition-all hover:-translate-y-0.5">
                  Demander un devis <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>

            {/* ───── Sidebar compacte ───── */}
            <aside className="space-y-4">
              {/* Info card */}
              {(guide.duree || guide.difficulte || guide.niveau) && (
                <div className="rounded-lg border border-border/50 bg-secondary/20 p-4">
                  <h2 className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Informations
                  </h2>
                  <dl className="space-y-2 text-[11px]">
                    {guide.duree && (
                      <div className="flex items-center justify-between border-b border-border/30 pb-2">
                        <dt className="text-muted-foreground">Durée estimée</dt>
                        <dd className="flex items-center gap-1 font-medium">{guide.duree}</dd>
                      </div>
                    )}
                    {guide.difficulte && (
                      <div className="flex items-center justify-between border-b border-border/30 pb-2">
                        <dt className="text-muted-foreground">Difficulté</dt>
                        <dd><span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${guideDifficultyColors[guide.difficulte]}`}>{guideDifficultyLabels[guide.difficulte]}</span></dd>
                      </div>
                    )}
                    {guide.niveau && (
                      <div className="flex items-center justify-between border-b border-border/30 pb-2">
                        <dt className="text-muted-foreground">Niveau requis</dt>
                        <dd className="font-medium">{guide.niveau}</dd>
                      </div>
                    )}
                    {guide.etapes && (
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Nombre d'étapes</dt>
                        <dd className="flex items-center gap-1 font-medium">{guide.etapes.length}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Popular guides */}
              <div className="rounded-lg border border-border/50 bg-card p-4">
                <h2 className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" /> Populaires
                </h2>
                <div className="space-y-2">
                  {popularGuides.filter(g => g.id !== guide.id).slice(0, 4).map((item) => (
                    <Link key={item.id} to={guidePath(item)} className="group block border-b border-border/30 pb-2 last:border-0">
                      <p className="text-[11px] font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {item.titre}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[9px] text-muted-foreground">
                        <span className="inline-flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {item.vues?.toLocaleString()}</span>
                        <span>{formatDate(item.publie_le)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA Card */}
              <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 text-center">
                <div className="inline-flex rounded-full bg-primary/20 p-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-sm font-bold">Besoin d'aide ?</h2>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  Notre équipe d'experts vous guide dans vos choix.
                </p>
                <Link to="/devis-express" className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-medium text-primary-foreground transition-all hover:-translate-y-0.5">
                  Demander un devis <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Avantages Casaniers */}
              <div className="rounded-lg border border-border/50 bg-card p-4">
                <h2 className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" /> Pourquoi Les Casaniers ?
                </h2>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-3.5 w-3.5 text-primary" />
                    <div><p className="text-[11px] font-medium">Livraison rapide</p><p className="text-[9px] text-muted-foreground">À Madagascar sous 48-72h</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CreditCard className="mt-0.5 h-3.5 w-3.5 text-primary" />
                    <div><p className="text-[11px] font-medium">Paiement sécurisé</p><p className="text-[9px] text-muted-foreground">À la livraison ou en ligne</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Headphones className="mt-0.5 h-3.5 w-3.5 text-primary" />
                    <div><p className="text-[11px] font-medium">Support expert</p><p className="text-[9px] text-muted-foreground">Conseils avant et après vente</p></div>
                  </div>
                </div>
              </div>

              {/* Video link if not embedded */}
              {guide.video_url && !youtubeId && (
                <div className="rounded-lg border border-border/50 bg-card p-4">
                  <a href={guide.video_url} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-[11px] font-medium text-red-500 transition-all hover:bg-red-500 hover:text-white">
                    <ExternalLink className="h-3.5 w-3.5" /> Voir la vidéo
                  </a>
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </SiteLayout>
  );
};

export default GuideDetail;