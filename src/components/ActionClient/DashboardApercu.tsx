import { useState, useEffect } from "react";
import { Package, Clock, Heart, Star, ShoppingBag, Settings, ChevronRight, MessageSquare, HelpCircle, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/service/api";
import { toast } from "@/hooks/use-toast";

type Commande = {
  id: number;
  commande_uuid: string;
  statut: string;
  total: number;
  devise: string;
  date_creation: string;
  quantite: number;
};

type Favori = {
  id: number;
  produit_id: number;
};

type Avis = {
  id: number;
  note: number;
};

const DashboardApercu = () => {
  const [user, setUser] = useState({ name: "", prenom: "", nom: "" });
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [avis, setAvis] = useState<Avis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchCommandes();
    fetchFavoris();
    fetchAvis();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/utilisateurs/profile');
      const userData = response.data.data || response.data;
      setUser({
        name: `${userData.prenom || ''} ${userData.nom || ''}`.trim() || "Client",
        prenom: userData.prenom || "",
        nom: userData.nom || ""
      });
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  };

  const fetchCommandes = async () => {
    try {
      const response = await api.get('/commandes');
      let commandesData: Commande[] = [];
      
      if (response.data.data && Array.isArray(response.data.data)) {
        commandesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        commandesData = response.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        commandesData = response.data.items;
      } else {
        commandesData = [];
      }
      
      // Grouper par commande_uuid pour éviter les doublons
      const commandesMap = new Map<string, Commande>();
      commandesData.forEach(cmd => {
        if (!commandesMap.has(cmd.commande_uuid)) {
          commandesMap.set(cmd.commande_uuid, cmd);
        }
      });
      
      setCommandes(Array.from(commandesMap.values()));
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
    }
  };

  const fetchFavoris = async () => {
    try {
      const response = await api.get('/favoris');
      let favorisData: Favori[] = [];
      
      if (response.data.data && Array.isArray(response.data.data)) {
        favorisData = response.data.data;
      } else if (Array.isArray(response.data)) {
        favorisData = response.data;
      } else {
        favorisData = [];
      }
      
      setFavoris(favorisData);
    } catch (error) {
      console.error("Erreur chargement favoris:", error);
    }
  };

  const fetchAvis = async () => {
    try {
      const response = await api.get('/avis');
      let avisData: Avis[] = [];
      
      if (response.data.data && Array.isArray(response.data.data)) {
        avisData = response.data.data;
      } else if (Array.isArray(response.data)) {
        avisData = response.data;
      } else {
        avisData = [];
      }
      
      setAvis(avisData);
    } catch (error) {
      console.error("Erreur chargement avis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatutLabel = (statut: string): string => {
    const map: Record<string, string> = {
      "en_attente": "En attente",
      "en_preparation": "En préparation",
      "expediee": "Expédiée",
      "livree": "Livrée",
      "annulee": "Annulée",
      "payee": "Payée"
    };
    return map[statut] || statut;
  };

  const formatPrice = (prix: number, devise: string = 'MGA') => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ` ${devise}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const stats = [
    { label: "Commandes", value: commandes.length, icon: Package, color: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "En cours", value: commandes.filter(c => ["en_attente", "en_preparation", "payee"].includes(c.statut)).length, icon: Clock, color: "bg-yellow-100 dark:bg-yellow-900/30" },
    { label: "Favoris", value: favoris.length, icon: Heart, color: "bg-red-100 dark:bg-red-900/30" },
    { label: "Avis", value: avis.length, icon: Star, color: "bg-green-100 dark:bg-green-900/30" }
  ];

  // Dernières commandes (3 plus récentes)
  const recentOrders = [...commandes]
    .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bonjour, {user.name} 👋</h1>
        <p className="text-muted-foreground">Voici un aperçu de votre activité</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5 text-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/catalogue"
          className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-secondary/50 transition"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-foreground" />
            <div>
              <p className="font-medium text-foreground">Explorer le catalogue</p>
              <p className="text-sm text-muted-foreground">Découvrez nos produits</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link
          to="/configurateur"
          className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-secondary/50 transition"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-foreground" />
            <div>
              <p className="font-medium text-foreground">Configurateur PC</p>
              <p className="text-sm text-muted-foreground">Créez votre configuration</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>

      {/* Dernières commandes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Dernières commandes</h2>
          {commandes.length > 0 && (
            <Link to="/dashboard/commandes" className="text-sm text-muted-foreground hover:text-primary transition">
              Voir tout
            </Link>
          )}
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucune commande pour le moment</p>
            <Link to="/catalogue" className="text-sm text-primary hover:underline mt-2 inline-block">
              Commencer vos achats
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:shadow-md transition">
                <div>
                  <p className="font-medium text-foreground">{order.commande_uuid}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.date_creation)} · {order.quantite} article{order.quantite > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{formatPrice(order.total, order.devise)}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    order.statut === "livree" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
                    order.statut === "annulee" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                  }`}>
                    {getStatutLabel(order.statut)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <MessageSquare className="h-6 w-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Besoin d'aide ?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Notre équipe est disponible pour répondre à toutes vos questions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition"
              >
                <HelpCircle className="h-4 w-4" />
                Nous contacter
              </Link>
              <Link
                to="/guides"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition"
              >
                <FileText className="h-4 w-4" />
                Guides
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardApercu;