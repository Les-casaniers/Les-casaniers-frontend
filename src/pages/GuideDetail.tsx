import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Calendar, CheckCircle, Clock, Eye, ExternalLink,
  MessageCircle, Play, Share2, UserRound, Wrench,
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

const GuideDetail = () => {
  const { id } = useParams();
  const { data: guide, isLoading, isError } = useGuide(id);
  const { data: popularGuides = [] } = usePopularGuides(4);

  useEffect(() => {
    if (!guide) return;
    document.title = `${guide.titre} - Les Casaniers`;
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    meta.setAttribute("content", guide.resume);
  }, [guide]);

  const youtubeId = extractYoutubeId(guide?.video_url);

  return (
    <SiteLayout>
      <main className="container-x py-8">
        <Link to="/guides" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour aux guides
        </Link>

        {isLoading && (
          <div className="border border-border p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            <p className="mt-4 text-muted-foreground">Chargement du guide...</p>
          </div>
        )}
        {isError && <div className="border border-destructive p-8 text-center text-destructive">Guide introuvable ou indisponible.</div>}

        {guide && (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* ───── Main Article ───── */}
            <article>
              {/* Meta badges */}
              <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="border border-border px-2.5 py-1 text-xs font-medium">{guideCategoryLabels[guide.categorie]}</span>
                {guide.badge && (
                  <span className="bg-foreground px-2.5 py-1 text-xs font-bold text-background">{guide.badge}</span>
                )}
                {guide.difficulte && (
                  <span className={`px-2.5 py-1 text-xs font-semibold ${guideDifficultyColors[guide.difficulte]}`}>
                    {guideDifficultyLabels[guide.difficulte]}
                  </span>
                )}
                <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(guide.publie_le)}</span>
                {guide.temps_lecture && <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{guide.temps_lecture}</span>}
                {guide.auteur && <span className="inline-flex items-center gap-1"><UserRound className="h-4 w-4" />{guide.auteur}</span>}
                <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" />{guide.vues}</span>
              </div>

              {/* Title */}
              <h1 className="max-w-4xl text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">{guide.titre}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{guide.resume}</p>

              {/* Tags */}
              {guide.tags && guide.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {guide.tags.map((tag, idx) => (
                    <span key={idx} className="bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Cover image */}
              <img
                src={guide.image_url || fallbackImage}
                alt={guide.image_alt || guide.titre}
                className="mt-8 aspect-[16/8] w-full border border-border object-cover"
              />

              {/* Budget range */}
              {guide.budget_range && (
                <div className="mt-6 border-l-4 border-primary bg-secondary/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Budget recommandé</p>
                  <p className="text-xl font-bold text-primary">{guide.budget_range}</p>
                </div>
              )}

              {/* Components list */}
              {guide.composants_recommandes && guide.composants_recommandes.length > 0 && (
                <div className="mt-6 border border-border p-5">
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                    <Wrench className="h-5 w-5" /> Composants recommandés
                  </h2>
                  <div className="grid gap-2 md:grid-cols-2">
                    {guide.composants_recommandes.map((comp, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube video */}
              {youtubeId && (
                <div className="mt-8">
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                    <Play className="h-5 w-5" /> Vidéo tutoriel
                  </h2>
                  <div className="relative aspect-video w-full overflow-hidden border border-border">
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
                <div className="mt-8">
                  <h2 className="mb-4 text-lg font-bold">Étapes du tutoriel</h2>
                  <div className="space-y-4">
                    {guide.etapes.map((step, idx) => (
                      <div key={idx} className="flex gap-4 border border-border p-4 transition-colors hover:bg-secondary/30">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                          {idx + 1}
                        </div>
                        <p className="text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Article content */}
              <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
                {guide.contenu.split(/\n{2,}/).map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return <h2 key={index}>{paragraph.replace("## ", "")}</h2>;
                  }
                  if (paragraph.startsWith("### ")) {
                    return <h3 key={index}>{paragraph.replace("### ", "")}</h3>;
                  }
                  return <p key={index}>{paragraph}</p>;
                })}
              </div>

              {/* Share / CTA buttons */}
              <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
                <button
                  onClick={() => navigator.share?.({ title: guide.titre, url: window.location.href }).catch(() => {})}
                  className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors"
                >
                  <Share2 className="h-4 w-4" /> Partager
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(guide.titre + " - " + window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <Link to="/devis-express" className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:-translate-y-0.5 transition-all">
                  Demander un devis <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            {/* ───── Sidebar ───── */}
            <aside className="space-y-5">
              {/* Duration & Difficulty card (for tutos) */}
              {(guide.duree || guide.difficulte || guide.niveau) && (
                <div className="border border-border p-5">
                  <h2 className="mb-3 font-bold">Informations</h2>
                  <dl className="space-y-2 text-sm">
                    {guide.duree && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Durée</dt>
                        <dd className="font-medium">{guide.duree}</dd>
                      </div>
                    )}
                    {guide.difficulte && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Difficulté</dt>
                        <dd><span className={`px-2 py-0.5 text-xs font-semibold ${guideDifficultyColors[guide.difficulte]}`}>{guideDifficultyLabels[guide.difficulte]}</span></dd>
                      </div>
                    )}
                    {guide.niveau && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Niveau</dt>
                        <dd className="font-medium">{guide.niveau}</dd>
                      </div>
                    )}
                    {guide.etapes && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Étapes</dt>
                        <dd className="font-medium">{guide.etapes.length}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Popular guides */}
              <div className="border border-border p-5">
                <h2 className="mb-3 font-bold">Guides populaires</h2>
                {popularGuides.map((item) => (
                  <Link key={item.id} to={guidePath(item)} className="block border-b border-border py-3 text-sm font-medium last:border-0 hover:text-primary transition-colors">
                    {item.titre}
                  </Link>
                ))}
              </div>

              {/* CTA */}
              <div className="border border-border p-5 bg-secondary/30">
                <h2 className="font-bold">Besoin d'un conseil ?</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">L'équipe Les Casaniers peut vous aider à choisir les composants adaptés à votre budget.</p>
                <Link to="/devis-express" className="mt-4 inline-flex w-full justify-center bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:-translate-y-0.5 transition-all">
                  Demander un devis
                </Link>
                <a
                  href="https://wa.me/261341234567"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex w-full justify-center items-center gap-2 border border-green-600 px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Contactez-nous sur WhatsApp
                </a>
              </div>

              {/* Video link if not embedded */}
              {guide.video_url && !youtubeId && (
                <div className="border border-border p-5">
                  <h2 className="mb-2 font-bold">Vidéo</h2>
                  <a
                    href={guide.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
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
