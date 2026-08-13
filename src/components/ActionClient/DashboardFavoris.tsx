import { useEffect, useState } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/service/api";
import ProductImage from "@/components/ProductImage";

type Produit = { id: number; nom: string; prix: number; devise: string; quantite_stock: number; type_produit?: string; actif?: boolean; images?: unknown[]; image?: string | null; image_url?: string; photo?: string };
type Favori = { id: number; produit_id: number; produit?: Produit | null };

const DashboardFavoris = () => {
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/favoris");
        const liste: Favori[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setFavoris(liste);
        // Le backend fournit le produit lié. On ne demande le détail que si une
        // ancienne réponse ne contient pas encore la relation.
        const details = await Promise.all(liste.map(async (favori) => {
          if (favori.produit) return favori.produit;
          try {
            const response = await api.get(`/produits/${favori.produit_id}`);
            return response.data?.data ?? response.data;
          } catch { return null; }
        }));
        // Un favori doit rester visible même si son produit est momentanément
        // désactivé : le client peut alors le retirer de sa liste.
        setProduits(details.filter((produit): produit is Produit => Boolean(produit)));
      } catch {
        toast.error("Impossible de charger vos favoris");
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const remove = async (produit: Produit) => {
    try {
      await api.delete(`/favoris/${produit.id}`);
      setFavoris((current) => current.filter((favori) => favori.produit_id !== produit.id));
      setProduits((current) => current.filter(({ id }) => id !== produit.id));
      toast.success(`${produit.nom} retiré des favoris`);
    } catch { toast.error("Erreur lors de la suppression"); }
  };

  const formatPrice = (prix: number, devise: string) => `${new Intl.NumberFormat("fr-FR").format(prix)} ${devise || "Ar"}`;

  if (loading) return <div className="flex min-h-[420px] items-center justify-center bg-black text-sm text-white/70">Chargement de vos favoris...</div>;

  return (
    <section className="min-h-[calc(100vh-12rem)] bg-black px-5 py-6 text-white sm:px-7 md:px-9 md:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Salut,</h1><p className="mt-1 inline-block border-b border-white/60 pb-1 text-sm font-medium italic text-white/75 sm:text-base">Consulte tes produits favoris</p></header>
        {produits.length > 0 && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {produits.map((produit) => <article key={produit.id} className="group relative overflow-hidden rounded-xl bg-white p-3 text-black shadow-sm"><div className="flex items-center justify-between text-[10px] italic text-black/70"><span>{produit.type_produit || "Produit"}</span><button aria-label="Retirer des favoris" onClick={() => remove(produit)} className="rounded p-1 transition hover:bg-black hover:text-white"><Trash2 className="h-3.5 w-3.5" /></button></div><Link to={`/produit/${produit.id}`} className="mt-2 block h-36 sm:h-40"><ProductImage produit={produit} className="h-full w-full object-contain" /></Link><Link to={`/produit/${produit.id}`} className="mt-3 block text-xs font-bold leading-snug transition hover:underline">{produit.nom}</Link><p className="mt-4 text-center text-lg font-bold">{formatPrice(produit.prix, produit.devise)}</p></article>)}
        </div>}
        <div className="mt-8 rounded-xl bg-white px-6 py-9 text-center text-black shadow-sm sm:py-10"><p className="text-sm italic text-black/65 sm:text-base">Besoin d&apos;ajouter des produits au favoris ?</p><div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-semibold sm:text-base"><Link to="/catalogue" className="transition hover:text-primary hover:underline">Ajoute-les ici</Link><span className="font-normal text-black/65">ou</span><Link to="/configurateur" className="transition hover:text-primary hover:underline">Configure ton propre setup</Link></div></div>
        {produits.length === 0 && <div className="mt-6 flex justify-center"><Link to="/catalogue" className="inline-flex items-center gap-2 rounded-md border border-white/45 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"><ShoppingBag className="h-4 w-4" /> Découvrir le catalogue</Link></div>}
      </div>
    </section>
  );
};

export default DashboardFavoris;
