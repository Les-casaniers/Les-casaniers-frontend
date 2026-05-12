import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Shield, FileText, Clock, Truck, RefreshCw, CreditCard, AlertCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

const CGV = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "CGV — Les Casaniers Madagascar";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(
      Object.assign(document.createElement("meta"), { name: "description" })
    );
    meta.setAttribute(
      "content",
      "Conditions Générales de Vente - Garantie 24 mois, livraison, paiement et conditions."
    );
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-slate-500/10 to-slate-400/5 border-b border-border">
        <div className="container-x text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-6 w-6 text-slate-600" />
            <h1 className="text-4xl md:text-5xl font-bold">Conditions Générales de Vente</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dernière mise à jour : 1er Janvier 2026
          </p>
        </div>
      </section>

      {/* Contenu CGV */}
      <section className="py-16">
        <div className="container-x max-w-4xl mx-auto">
          <div className="space-y-8">
            
            {/* Garantie */}
            <div className="bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold">Garantie 24 mois</h2>
              </div>
              <p className="text-muted-foreground">
                Tous nos produits bénéficient d'une garantie légale de conformité de 24 mois 
                (pièces et main-d'œuvre). Cette garantie couvre les défauts de fabrication 
                et les vices cachés. Le SAV est assuré localement à Tananarive.
              </p>
            </div>

            {/* Prix */}
            <div className="border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-bold">1. Prix</h2>
              </div>
              <p className="text-muted-foreground">
                Les prix sont indiqués en Ariary (Ar), toutes taxes comprises (TVA incluse). 
                Les prix de nos produits sont susceptibles d'être modifiés à tout moment, 
                mais les produits seront facturés sur la base du tarif en vigueur au moment 
                de la validation de la commande.
              </p>
            </div>

            {/* Commande */}
            <div className="border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl font-bold">2. Passation de commande</h2>
              </div>
              <p className="text-muted-foreground">
                La validation de la commande vaut acceptation des présentes conditions générales de vente. 
                Une confirmation vous sera envoyée par email avec le détail de votre commande.
              </p>
            </div>

            {/* Paiement */}
            <div className="border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-5 w-5 text-green-500" />
                <h2 className="text-xl font-bold">3. Modalités de paiement</h2>
              </div>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Paiement en espèces à la livraison</li>
                <li>Virement bancaire</li>
                <li>Mobile Money (MVola, Airtel Money)</li>
                <li>Carte bancaire (via notre plateforme sécurisée)</li>
              </ul>
            </div>

            {/* Livraison */}
            <div className="border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-bold">4. Livraison</h2>
              </div>
              <p className="text-muted-foreground">
                La livraison est gratuite sur Tananarive (délai 48h). Pour le reste de Madagascar, 
                comptez 3 à 5 jours ouvrés. Les produits sont soigneusement emballés dans un double 
                carton avec mousse anti-choc.
              </p>
            </div>

            {/* Rétractation */}
            <div className="border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-3">
                <RefreshCw className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-bold">5. Droit de rétractation</h2>
              </div>
              <p className="text-muted-foreground">
                Conformément à la loi, vous disposez d'un délai de 14 jours à compter de la réception 
                de votre commande pour exercer votre droit de rétractation sans avoir à justifier de 
                motifs ni à payer de pénalités.
              </p>
            </div>

            {/* SAV */}
            <div className="border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-indigo-500" />
                <h2 className="text-xl font-bold">6. Service Après-Vente (SAV)</h2>
              </div>
              <p className="text-muted-foreground">
                Notre SAV est situé à Tananarive. Pour toute demande, contactez-nous par email ou 
                téléphone. Nous nous engageons à traiter votre demande sous 48h ouvrées.
              </p>
            </div>

            {/* Données personnelles */}
            <div className="border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-bold">7. Données personnelles</h2>
              </div>
              <p className="text-muted-foreground">
                Vos données personnelles sont collectées uniquement pour le traitement de votre commande. 
                Conformément à la loi, vous disposez d'un droit d'accès, de rectification et d'opposition 
                aux données vous concernant.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-secondary/30 p-6 rounded-lg mt-8">
              <h2 className="text-xl font-bold mb-3">📞 Nous contacter</h2>
              <p className="text-muted-foreground">
                Pour toute question relative à nos CGV, vous pouvez nous contacter :<br />
                ✉️ <a href="mailto:contact@lescasaniers.mg" className="text-blue-500 hover:underline">contact@lescasaniers.mg</a><br />
                📞 <a href="tel:+261341234567" className="text-blue-500 hover:underline">+261 34 12 345 67</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default CGV;