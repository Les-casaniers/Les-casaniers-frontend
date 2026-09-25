import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/service/api";

type Commande = {
  id: number;
  commande_uuid: string;
  statut: string;
  total: number;
  devise: string;
  date_creation: string;
  quantite: number;
};

type DashboardData = {
  stats: { commandes: number; en_cours: number; favoris: number; avis: number };
  recent_orders: Commande[];
};

const DashboardApercu = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/dashboard/apercu");
        setDashboard(response.data.data);
      } catch (error) {
        console.error("Erreur chargement du tableau de bord :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { label: "Commandes", value: dashboard?.stats.commandes ?? 0 },
    { label: "En cours", value: dashboard?.stats.en_cours ?? 0 },
    { label: "Favoris", value: dashboard?.stats.favoris ?? 0 },
    { label: "Avis", value: dashboard?.stats.avis ?? 0 },
  ];

  const recentOrders = dashboard?.recent_orders ?? [];

  const formatPrice = (prix: number, devise = "MGA") => `${new Intl.NumberFormat("fr-FR").format(prix)} ${devise}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  const statutLabel = (statut: string) => ({ en_attente: "En attente", en_preparation: "En préparation", en_traitement: "En traitement", expediee: "Expédiée", terminee: "Terminée", livree: "Livrée", annulee: "Annulée", remboursee: "Remboursée", payee: "Payée" }[statut] ?? statut);

  if (isLoading) {
    return <div className="flex min-h-[420px] flex-col items-center justify-center bg-black py-20 text-white"><Loader2 className="mb-4 h-9 w-9 animate-spin" /><p className="text-sm text-white/70">Chargement de votre tableau de bord...</p></div>;
  }

  /*
  ANCIENNES CLASSES (avant alignement sur la maquette), gardées pour pouvoir revenir en arrière :
  - section       : "min-h-[calc(100vh-12rem)] bg-black px-5 py-6 text-white sm:px-7 md:px-9 md:py-8"
  - h1            : "text-2xl font-bold tracking-tight sm:text-3xl"
  - sous-titre p  : "mt-1 text-sm font-medium text-white/65 sm:text-base"
  - carte stat    : "rounded-xl bg-white px-4 py-5 text-center text-black shadow-sm sm:py-6"
  - valeur stat   : "text-xl font-bold leading-none text-black sm:text-2xl"
  - libellé stat  : "mt-2 text-sm font-medium text-black"
  - h2 commandes  : "text-sm font-medium italic text-white/75 sm:text-base"
  - état vide     : "rounded-xl bg-white px-6 py-9 text-center text-black shadow-sm sm:py-10"
  - texte vide    : "text-sm italic text-black sm:text-base"
  - liens vides   : "mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-semibold text-black sm:text-base"
  - "ou"          : "font-normal text-black"
  */

  return (
    <section className="apercu-page min-h-[calc(100vh-12rem)] bg-black px-5 py-6 text-white sm:px-7 md:px-9 md:py-8">
      {/* Police de la maquette (Poppins), limitée à cette page */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&display=swap');
        .apercu-page { font-family: 'Poppins', sans-serif; }
      `}</style>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-xl font-bold">Salut,</h1>
          <div className="mt-1 inline-block border-b border-white/60 pb-0.5"><p className="text-[13px] font-normal italic text-white/85">Voici un aperçu de tes activités</p></div>
        </header>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {stats.map((stat) => <div key={stat.label} className="rounded-xl bg-white px-4 py-5 text-center text-black shadow-sm"><p className="text-lg font-bold leading-none text-black">{stat.value}</p><p className="mt-2 text-sm font-normal text-black">{stat.label}</p></div>)}
        </div>

        <div className="mt-9">
          <div className="mb-3 inline-block border-b border-white/60 pb-1"><h2 className="text-[13px] font-normal italic text-white/75">Tes dernières commandes</h2></div>
          {recentOrders.length === 0 ? (
            <div className="rounded-xl bg-white px-6 py-[34px] text-center text-black shadow-sm">
              <p className="text-[13px] italic text-black">Tu n&apos;as aucune commande pour l&apos;instant !</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-semibold text-black"><Link to="/catalogue" className="transition hover:text-primary hover:underline">Commence tes achats</Link><span className="text-[13px] font-normal italic text-black">ou</span><Link to="/configurateur" className="transition hover:text-primary hover:underline">Configure ton propre setup</Link></div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => <Link key={order.id} to="/DashboardClient/commandes" className="flex flex-col gap-3 rounded-xl bg-white p-5 text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-black">{order.commande_uuid}</p><p className="mt-1 text-sm text-black">{formatDate(order.date_creation)} · {order.quantite} article{order.quantite > 1 ? "s" : ""}</p></div><div className="sm:text-right"><p className="font-bold text-black">{formatPrice(order.total, order.devise)}</p><p className="mt-1 text-sm text-black">{statutLabel(order.statut)}</p></div></Link>)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardApercu;