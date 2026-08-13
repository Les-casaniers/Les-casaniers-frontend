import { useEffect, useState } from "react";
import { Check, LockKeyhole, Loader2 } from "lucide-react";
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

type Historique = {
  stats: { total: number; en_cours: number; livrees: number; annulees: number };
  commandes: Commande[];
};

const steps = ["Commande", "Paiement", "Expédition", "Préparation", "Livraison"];
const statusStep: Record<string, number> = { en_attente: 0, payee: 1, expediee: 2, en_traitement: 3, terminee: 4 };

const DashboardCommandes = () => {
  const [historique, setHistorique] = useState<Historique | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/commandes")
      .then(({ data }) => setHistorique(data.data))
      .catch((error) => console.error("Erreur chargement commandes :", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex min-h-[420px] flex-col items-center justify-center bg-black text-white"><Loader2 className="mb-4 h-9 w-9 animate-spin" /><p className="text-sm text-white/70">Chargement des commandes...</p></div>;

  const stats = [
    { label: "Total commandes", value: historique?.stats.total ?? 0 },
    { label: "Commandes en cours", value: historique?.stats.en_cours ?? 0 },
    { label: "Commandes livrées", value: historique?.stats.livrees ?? 0 },
    { label: "Commandes annulées", value: historique?.stats.annulees ?? 0 },
  ];

  return (
    <section className="min-h-[calc(100vh-12rem)] bg-black px-5 py-6 text-white sm:px-7 md:px-9 md:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Salut,</h1><p className="mt-1 inline-block border-b border-white/60 pb-1 text-sm font-medium italic text-white/75 sm:text-base">Consulte l&apos;historique de tes commandes</p></header>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {stats.map((stat) => <div key={stat.label} className="rounded-xl bg-white px-4 py-5 text-center text-black shadow-sm sm:py-6"><p className="text-xl font-bold leading-none sm:text-2xl">{stat.value}</p><p className="mt-2 text-sm font-medium">{stat.label}</p></div>)}
        </div>
        <div className="mt-9"><h2 className="mb-3 inline-block border-b border-white/60 pb-1 text-sm font-medium italic text-white/75 sm:text-base">Mes commandes</h2>
          <div className="space-y-4">
            {(historique?.commandes ?? []).map((commande) => {
              const currentStep = statusStep[commande.statut] ?? -1;
              const isCancelled = ["annulee", "remboursee"].includes(commande.statut);
              return <article key={commande.id} className="rounded-xl border border-white/45 px-3 py-3 sm:px-4 sm:py-4"><p className="text-xs font-bold sm:text-sm">{commande.commande_uuid} <span className="font-normal text-white/65">· {commande.quantite} article{commande.quantite > 1 ? "s" : ""}</span></p><div className="mt-5 grid grid-cols-5 gap-1 sm:gap-3">{steps.map((step, index) => <div key={step} className="relative flex flex-col items-center text-center">{index < steps.length - 1 && <span className={`absolute left-1/2 top-3 h-0.5 w-full ${!isCancelled && index < currentStep ? "bg-white" : "bg-white/35"}`} />}<span className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border ${!isCancelled && index <= currentStep ? "border-white bg-white text-black" : "border-white/60 bg-black text-white"}`}>{!isCancelled && index < currentStep ? <Check className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3 w-3" />}</span><span className="mt-2 text-[9px] text-white/75 sm:text-xs">{step}</span></div>)}</div></article>;
            })}
            {(historique?.commandes.length ?? 0) === 0 && <p className="py-8 text-center text-sm italic text-white/65">Tu n&apos;as aucune commande pour l&apos;instant.</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardCommandes;
