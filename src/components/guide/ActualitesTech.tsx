import { Calendar, ExternalLink, Newspaper, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Guide, useGuidesByCategory } from "@/hooks/useGuides";

const guidePath = (guide: Guide) => `/guides/${guide.slug || guide.id}`;
const fallbackImage = "/image/7.png";

const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value)) : "Non publie";

export const ActualitesTech = () => {
  const { data: actualites = [], isLoading } = useGuidesByCategory("actualites-tech", 6);

  return (
    <section id="actualites-tech" className="bg-secondary/30 py-12 scroll-mt-20">
      <div className="container-x">
        <div className="mb-8 flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-green-500" />
          <div>
            <h2 className="text-3xl font-bold">Actualites Tech</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sorties, tests et tendances publies depuis l'administration.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="border border-border bg-background p-8 text-center text-muted-foreground">Chargement des actualites...</div>
        ) : actualites.length === 0 ? (
          <div className="border border-border bg-background p-8 text-center text-muted-foreground">Aucune actualite publiee pour le moment.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {actualites.map((actu) => (
              <article key={actu.id} className="overflow-hidden border border-border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <Link to={guidePath(actu)} className="block bg-secondary">
                  <img src={actu.image_url || fallbackImage} alt={actu.image_alt || actu.titre} className="h-40 w-full object-cover" />
                </Link>
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {formatDate(actu.publie_le)}
                    </span>
                    {actu.badge && <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-600">{actu.badge}</span>}
                  </div>
                  <Link to={guidePath(actu)} className="line-clamp-2 text-lg font-bold hover:text-primary">{actu.titre}</Link>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{actu.resume}</p>
                  <Link to={guidePath(actu)} className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:underline">
                    Lire plus <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/5 p-5 text-center">
          <Sparkles className="mx-auto mb-2 h-5 w-5 text-blue-500" />
          <p className="text-sm">
            <strong>Bon a savoir :</strong> les nouveautes peuvent etre importees depuis l'Europe vers Madagascar.
            <Link to="/importation" className="mt-2 block text-blue-500 hover:underline">Decouvrir nos services d'importation</Link>
          </p>
        </div>
      </div>
    </section>
  );
};
