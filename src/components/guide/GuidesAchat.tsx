import { ArrowRight, CheckCircle, Cpu, Gamepad, ShoppingBag, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Guide, useGuidesByCategory } from "@/hooks/useGuides";

const guidePath = (guide: Guide) => `/guides/${guide.slug || guide.id}`;

const fallbackImage = "/image/6.png";

export const GuidesAchat = () => {
  const { data: guides = [], isLoading } = useGuidesByCategory("guides-achat", 6);

  return (
    <section id="guides-achat" className="py-12 scroll-mt-20">
      <div className="container-x">
        <div className="mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-3xl font-bold">Guides d'achat</h2>
            <p className="mt-1 text-sm text-muted-foreground">Configurations PC dynamiques selon vos usages et budgets.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="border border-border p-8 text-center text-muted-foreground">Chargement des guides...</div>
        ) : guides.length === 0 ? (
          <div className="border border-border p-8 text-center text-muted-foreground">Aucun guide d'achat publie pour le moment.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <article key={guide.id} className="overflow-hidden border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
                <Link to={guidePath(guide)} className="block bg-secondary">
                  <img src={guide.image_url || fallbackImage} alt={guide.image_alt || guide.titre} className="h-44 w-full object-cover" />
                </Link>
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-500">
                      <Gamepad className="h-3.5 w-3.5" /> {guide.niveau || "Configuration PC"}
                    </span>
                    {guide.mis_en_avant && <span className="text-xs font-semibold text-amber-500">Vedette</span>}
                  </div>
                  <Link to={guidePath(guide)} className="text-xl font-bold hover:text-primary">{guide.titre}</Link>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{guide.resume}</p>
                  {guide.budget_range && <p className="mt-3 text-lg font-bold text-primary">{guide.budget_range}</p>}
                  {guide.composants_recommandes && guide.composants_recommandes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {guide.composants_recommandes.slice(0, 4).map((component, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-500" />
                          <span className="truncate">{component}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex items-center justify-between">
                    <Link to="/configurateur" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                      Configurer mon PC <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Cpu className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-lg border border-amber-500/30 bg-amber-50 p-4 dark:bg-amber-950/20">
          <p className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 shrink-0 text-amber-500" />
            <span><strong>Conseil Casanier :</strong> verifiez toujours compatibilite, garantie et disponibilite locale avant de valider une configuration.</span>
          </p>
        </div>
      </div>
    </section>
  );
};
