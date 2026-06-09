import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Calendar, CheckCircle, Clock, Eye, ExternalLink,
  MessageCircle, Play, Share2, UserRound, Wrench, Heart, BookmarkPlus,
  ChevronRight, AlertCircle, Shield, Truck, CreditCard, Headphones,
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

// Composant Table des matières
const TableOfContents = ({ content }: { content: string }) => {
  const [headings, setHeadings] = useState<{ text: string; level: number; id: string }[]>([]);

  useEffect(() => {
    const matches = content.match(/^## (.+)$|^### (.+)$/gm) || [];
    const extracted = matches.map((match, idx) => {
      const isH2 = match.startsWith("## ");
      const text = match.replace(/^##+ /, "");
      return {
        text,
        level: isH2 ? 2 : 3,
        id: `section-${idx}`,
      };
    });
    setHeadings(extracted);
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <div className="mb-8 rounded-xl border border-border bg-secondary/20 p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Sommaire</h2>
      <ul className="space-y-2">
        {headings.map((heading, idx) => (
          <li key={idx}>
            <a
              href={`#section-${idx}`}
              className={`text-sm transition-colors hover:text-primary ${
                heading.level === 2 ? "font-medium" : "ml-4 text-muted-foreground"
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
  const { data: popularGuides = [] } = usePopularGuides(5);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!guide) return;
    document.title = `${guide.titre} - Les Casaniers Madagascar`;
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    meta.setAttribute("content", guide.resume);
  }, [guide]);

  const youtubeId = extractYoutubeId(guide?.video_url);

  return (
    <SiteLayout>
      <main className="container-x py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/guides" className="hover:text-primary transition-colors">Guides</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{guide?.titre?.slice(0, 50) || "Guide"}</span>
        </nav>

        {isLoading && (
          <div className="flex flex-col items-center justify-center border border-border p-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-muted-foreground">Chargement du guide...</p>
          </div>
        )}
        
        {isError && (
          <div className="flex flex-col items-center justify-center border border-destructive/30 bg-destructive/10 p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Guide introuvable</h2>
            <p className="text-muted-foreground mb-4">Le guide que vous recherchez n'existe pas ou a été supprimé.</p>
            <Link to="/guides" className="inline-flex items-center gap-2 bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
              <ArrowLeft className="h-4 w-4" /> Retour aux guides
            </Link>
          </div>
        )}

        {guide && (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            {/* ───── Main Article ───── */}
            <article>
              {/* Meta badges - version améliorée */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {guideCategoryLabels[guide.categorie]}
                </span>
                {guide.badge && (
                  <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    ⭐ {guide.badge}
                  </span>
                )}
                {guide.difficulte && (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${guideDifficultyColors[guide.difficulte]}`}>
                    {guideDifficultyLabels[guide.difficulte]}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {guide.titre}
              </h1>
              
              {/* Info bar */}
              <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-border pb-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {formatDate(guide.publie_le)}
                </span>
                {guide.temps_lecture && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {guide.temps_lecture}
                  </span>
                )}
                {guide.auteur && (
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="h-4 w-4" /> {guide.auteur}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> {guide.vues?.toLocaleString()} vues
                </span>
              </div>

              {/* Resume */}
              <div className="mt-6 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-transparent border-l-4 border-primary p-5">
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  {guide.resume}
                </p>
              </div>

              {/* Tags */}
              {guide.tags && guide.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {guide.tags.map((tag, idx) => (
                    <span key={idx} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                    isLiked ? "border-red-500 bg-red-500/10 text-red-500" : "border-border hover:bg-secondary"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500" : ""}`} />
                  {isLiked ? "Aimé" : "J'aime"}
                </button>
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                    isBookmarked ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary"
                  }`}
                >
                  <BookmarkPlus className="h-4 w-4" />
                  {isBookmarked ? "Enregistré" : "Enregistrer"}
                </button>
                <button
                  onClick={() => navigator.share?.({ title: guide.titre, url: window.location.href }).catch(() => {})}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary transition-all"
                >
                  <Share2 className="h-4 w-4" /> Partager
                </button>
              </div>

              {/* Cover image with overlay gradient */}
              <div className="group relative mt-8 overflow-hidden rounded-xl">
                <img
                  src={guide.image_url || fallbackImage}
                  alt={guide.image_alt || guide.titre}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ maxHeight: "500px" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Budget range - card stylisée */}
              {guide.budget_range && (
                <div className="mt-8 overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border border-primary/30 p-6">
                  <p className="text-sm font-medium text-muted-foreground">Budget recommandé</p>
                  <p className="text-2xl font-bold text-primary">{guide.budget_range}</p>
                  <p className="mt-2 text-xs text-muted-foreground">*Prix indicatifs pouvant varier selon les disponibilités</p>
                </div>
              )}

              {/* Table des matières */}
              <TableOfContents content={guide.contenu || ""} />

              {/* Components list - amélioré */}
              {guide.composants_recommandes && guide.composants_recommandes.length > 0 && (
                <div className="mt-8 rounded-xl border border-border bg-gradient-to-br from-secondary/30 to-transparent p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    Composants recommandés
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {guide.composants_recommandes.map((comp, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/50 p-3 transition-all hover:border-primary/30 hover:shadow-sm">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                        <span className="text-sm">{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube video - amélioré */}
              {youtubeId && (
                <div className="mt-8">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                    <div className="rounded-lg bg-red-500/10 p-2">
                      <Play className="h-5 w-5 text-red-500" />
                    </div>
                    Vidéo tutoriel
                  </h2>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg">
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

              {/* Steps - amélioré */}
              {guide.etapes && guide.etapes.length > 0 && (
                <div className="mt-8">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <span className="text-lg">📋</span>
                    </div>
                    Étapes du tutoriel
                  </h2>
                  <div className="relative space-y-4 before:absolute before:left-4 before:top-4 before:h-[calc(100%-2rem)] before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-primary/20 md:before:left-6">
                    {guide.etapes.map((step, idx) => (
                      <div key={idx} className="relative flex gap-5 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg md:h-12 md:w-12 md:text-base">
                          {idx + 1}
                        </div>
                        <p className="flex-1 text-sm leading-relaxed md:text-base">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Article content - amélioré */}
              <div className="prose prose-neutral prose-headings:scroll-mt-20 prose-headings:font-bold prose-h2:mt-8 prose-h2:text-xl prose-h3:mt-6 prose-h3:text-lg prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground mt-8 max-w-none dark:prose-invert">
                {guide.contenu.split(/\n{2,}/).map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2 key={index} id={`section-${index}`} className="scroll-mt-20">
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h3 key={index} id={`section-${index}`} className="scroll-mt-20">
                        {paragraph.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith("- ") || paragraph.match(/^\d+\. /)) {
                    return (
                      <ul key={index} className="space-y-2">
                        {paragraph.split("\n").map((item, i) => (
                          <li key={i}>{item.replace(/^[-•]\s*|^\d+\.\s*/, "")}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={index}>{paragraph}</p>;
                })}
              </div>

              {/* Share / CTA buttons - amélioré */}
              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(guide.titre + " - " + window.location.href)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <MessageCircle className="h-4 w-4" /> Partager sur WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#1877f2] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Share2 className="h-4 w-4" /> Facebook
                  </a>
                </div>
                <Link
                  to="/devis-express"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Demander un devis <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            {/* ───── Sidebar améliorée ───── */}
            <aside className="space-y-6">
              {/* Info card */}
              {(guide.duree || guide.difficulte || guide.niveau) && (
                <div className="sticky top-24 rounded-xl border border-border bg-gradient-to-br from-secondary/50 to-transparent p-5">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-4 w-4" /> Informations
                  </h2>
                  <dl className="space-y-3 text-sm">
                    {guide.duree && (
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <dt className="text-muted-foreground">Durée estimée</dt>
                        <dd className="flex items-center gap-1 font-medium">
                          <Clock className="h-3.5 w-3.5 text-primary" /> {guide.duree}
                        </dd>
                      </div>
                    )}
                    {guide.difficulte && (
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <dt className="text-muted-foreground">Difficulté</dt>
                        <dd>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${guideDifficultyColors[guide.difficulte]}`}>
                            {guideDifficultyLabels[guide.difficulte]}
                          </span>
                        </dd>
                      </div>
                    )}
                    {guide.niveau && (
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <dt className="text-muted-foreground">Niveau requis</dt>
                        <dd className="font-medium">{guide.niveau}</dd>
                      </div>
                    )}
                    {guide.etapes && (
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Nombre d'étapes</dt>
                        <dd className="flex items-center gap-1 font-medium">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" /> {guide.etapes.length}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Popular guides - amélioré */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  <Eye className="h-4 w-4" /> Populaires
                </h2>
                <div className="space-y-3">
                  {popularGuides.filter(g => g.id !== guide.id).slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      to={guidePath(item)}
                      className="group block border-b border-border/50 pb-3 last:border-0 transition-all hover:pl-2"
                    >
                      <p className="text-sm font-medium leading-tight text-foreground transition-colors group-hover:text-primary">
                        {item.titre}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {item.vues?.toLocaleString()}
                        </span>
                        <span>{formatDate(item.publie_le)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA Card - améliorée */}
              <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 text-center">
                <div className="inline-flex rounded-full bg-primary/20 p-3 mb-4">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-lg font-bold">Besoin d'un conseil personnalisé ?</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Notre équipe d'experts est là pour vous guider dans le choix des composants adaptés à votre budget et vos besoins.
                </p>
                <Link
                  to="/devis-express"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Demander un devis gratuit <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="mt-4 pt-4 border-t border-primary/20">
                  <p className="text-xs text-muted-foreground">Ou contactez-nous directement</p>
                  <a
                    href="https://wa.me/261341234567"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-green-600 bg-transparent px-4 py-2.5 text-sm font-medium text-green-600 transition-all hover:bg-green-600 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
              </div>

              {/* Avantages Casaniers */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  <Shield className="h-4 w-4" /> Pourquoi Les Casaniers ?
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Livraison rapide</p>
                      <p className="text-xs text-muted-foreground">À Madagascar sous 48-72h</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Paiement sécurisé</p>
                      <p className="text-xs text-muted-foreground">À la livraison ou en ligne</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Headphones className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Support expert</p>
                      <p className="text-xs text-muted-foreground">Conseils avant et après vente</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video link if not embedded */}
              {guide.video_url && !youtubeId && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <Play className="h-4 w-4" /> Ressource vidéo
                  </h2>
                  <a
                    href={guide.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" /> Voir la vidéo
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