import { CheckCircle, Clock, MessageCircle, Play, Wrench, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { Guide, guideDifficultyLabels, useGuidesByCategory } from "@/hooks/useGuides";

const guidePath = (guide: Guide) => `/guides/${guide.slug || guide.id}`;
const fallbackImage = "/image/8.png";

export const TutosMaintenance = () => {
  const { data: tutos = [], isLoading } = useGuidesByCategory("tutos-maintenance", 6);

  return (
    <section id="tutos-maintenance" className="py-12 scroll-mt-20">
      <div className="container-x">
        <div className="mb-8 flex items-center gap-3">
          <Youtube className="h-8 w-8 text-red-500" />
          <div>
            <h2 className="text-3xl font-bold">Tutos Maintenance</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tutoriels dynamiques avec duree, niveau, etapes et video.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="border border-border p-8 text-center text-muted-foreground">Chargement des tutos...</div>
        ) : tutos.length === 0 ? (
          <div className="border border-border p-8 text-center text-muted-foreground">Aucun tutoriel publie pour le moment.</div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {tutos.map((tuto) => (
              <article key={tuto.id} className="overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-xl">
                <Link to={guidePath(tuto)} className="relative block aspect-video bg-secondary">
                  <img src={tuto.image_url || fallbackImage} alt={tuto.image_alt || tuto.titre} className="h-full w-full object-cover" />
                  {tuto.video_url && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg">
                        <Play className="ml-0.5 h-6 w-6" />
                      </span>
                    </span>
                  )}
                  {tuto.duree && (
                    <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/75 px-2 py-1 text-[11px] text-white">
                      <Clock className="h-3 w-3" /> {tuto.duree}
                    </span>
                  )}
                </Link>
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {tuto.difficulte && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">{guideDifficultyLabels[tuto.difficulte]}</span>}
                    {tuto.tags?.slice(0, 3).map((tag) => <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>)}
                  </div>
                  <Link to={guidePath(tuto)} className="text-lg font-bold hover:text-primary">{tuto.titre}</Link>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{tuto.resume}</p>

                  {tuto.etapes && tuto.etapes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Etapes :</p>
                      {tuto.etapes.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{step}</span>
                        </div>
                      ))}
                      {tuto.etapes.length > 3 && <p className="text-xs text-muted-foreground">+ {tuto.etapes.length - 3} autres etapes...</p>}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to={guidePath(tuto)} className="flex items-center gap-1 rounded bg-red-500 px-3 py-1.5 text-xs text-white transition hover:bg-red-600">
                      <Play className="h-3 w-3" /> Voir le tutoriel
                    </Link>
                    <Link to="/catalogue?type=composant" className="flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs transition hover:bg-secondary">
                      <Wrench className="h-3 w-3" /> Composants associes
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-lg border border-blue-500/30 bg-blue-50 p-5 dark:bg-blue-950/20 md:flex-row">
          <div className="flex items-center gap-3">
            <Wrench className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-bold">Besoin d'aide pour la maintenance ?</p>
              <p className="text-sm text-muted-foreground">Nos techniciens peuvent vous aider a diagnostiquer et entretenir votre PC.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/devis-express" className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white transition hover:bg-blue-600">Demander un devis</Link>
            <a href="https://wa.me/261341234567" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm text-white transition hover:bg-green-600">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
