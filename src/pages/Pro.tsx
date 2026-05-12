import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FacturationSection } from "@/components/pro/FacturationSection";
import { SavSection } from "@/components/pro/SavSection";
import { AuditSection } from "@/components/pro/AuditSection";
import { ImportationSection } from "@/components/pro/ImportationSection";

const ANCHORS = [

];

const Pro = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Espace Pro B2B — Les Casaniers Madagascar";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    meta.setAttribute("content", "Facturation normée, SAV prioritaire, audit de parc et importation directe. Solutions B2B pour entreprises à Madagascar.");
  }, []);

  useEffect(() => {
    console.log("Page Pro chargée :", location.pathname);
  }, [location.pathname]);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-blue-600/10 to-blue-400/5 border-b border-border text-center">
        <div className="container-x flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-500">
              Espace Pro B2B
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold max-w-2xl leading-tight">
            Des solutions pensées pour les professionnels.
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Facturation conforme, SAV réactif, audit de parc et importation
            directe — tout ce dont votre entreprise a besoin, au même endroit.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {ANCHORS.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border rounded-full transition-colors ${a.color}`}
              >
                {a.label}
              </a>
            ))}
          </div>

          <Link
            to="/configurateur"
            className="mt-4 px-8 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Demander un devis Pro
          </Link>
        </div>
      </section>

      {/* Les 4 sections */}
      <FacturationSection />
      <SavSection />
      <AuditSection />
      <ImportationSection />
    </SiteLayout>
  );
};

export default Pro;