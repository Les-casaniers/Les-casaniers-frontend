import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import api from "@/service/api";

type Facture = { id: number; facture_ref: string; statut: string; montant_total: number | string; devise: string; date_emission: string; commande?: { commande_uuid: string } };
type FacturesData = { stats: { total: number; payees: number; en_cours: number }; factures: Facture[] };

const DashboardPaiement = () => {
  const [data, setData] = useState<FacturesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/dashboard/factures").then((response) => setData(response.data.data)).catch((error) => console.error("Erreur chargement factures :", error)).finally(() => setLoading(false)); }, []);

  const download = async (facture: Facture) => {
    try {
      const response = await api.get(`/factures/${facture.id}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a"); link.href = url; link.download = `${facture.facture_ref}.pdf`; link.click(); URL.revokeObjectURL(url);
    } catch { window.alert("Le PDF de cette facture n'est pas encore disponible."); }
  };

  if (loading) return <div className="flex min-h-[420px] flex-col items-center justify-center bg-black text-white"><Loader2 className="mb-4 h-9 w-9 animate-spin" /><p className="text-sm text-white/70">Chargement de tes factures...</p></div>;
  const stats = [{ label: "Total", value: data?.stats.total ?? 0 }, { label: "Payées", value: data?.stats.payees ?? 0 }, { label: "En cours", value: data?.stats.en_cours ?? 0 }];

  return <section className="min-h-[calc(100vh-12rem)] bg-black px-5 py-6 text-white sm:px-7 md:px-9 md:py-8"><div className="mx-auto max-w-7xl"><header className="mb-8"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Salut,</h1><p className="mt-1 inline-block border-b border-white/60 pb-1 text-sm font-medium italic text-white/75 sm:text-base">Voici la liste de tes factures</p></header><div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-8">{stats.map((stat) => <div key={stat.label} className="rounded-xl bg-white px-4 py-6 text-center text-black shadow-sm"><p className="text-xl font-bold">{stat.value}</p><p className="mt-2 text-sm font-medium">{stat.label}</p></div>)}</div><div className="mt-6 space-y-7">{(data?.factures ?? []).map((facture) => <article key={facture.id} className="min-h-24 rounded-xl border border-white/45 p-3 sm:p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold">{facture.facture_ref}</p><p className="mt-1 text-xs text-white/65">{facture.commande?.commande_uuid ?? "Commande"} · {facture.statut}</p></div><button onClick={() => download(facture)} className="inline-flex items-center gap-2 rounded border border-white/45 px-3 py-1.5 text-xs transition hover:bg-white hover:text-black"><Download className="h-3.5 w-3.5" /> PDF</button></div></article>)}{(data?.factures.length ?? 0) === 0 && <div className="min-h-24 rounded-xl border border-white/45 p-4 text-sm italic text-white/65">Aucune facture disponible pour l&apos;instant.</div>}</div></div></section>;
};

export default DashboardPaiement;
