import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Calendar, Shield, LogOut, Settings, Heart, ShoppingBag } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/contexts/AuthContext";

const Compte = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Mon compte — Les Casaniers Madagascar";
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex items-center justify-center py-16">
          <div className="text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Non connecté</h2>
            <p className="text-muted-foreground mb-4">Veuillez vous connecter pour accéder à votre compte</p>
            <div className="flex gap-3 justify-center">
              <Link to="/login" className="px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition">
                Se connecter
              </Link>
              <Link to="/inscription" className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const fullName = user ? `${user.prenom || ""} ${user.nom || ""}`.trim() : "Utilisateur";

  return (
    <SiteLayout>
      <section className="py-16">
        <div className="container-x">
          <div className="max-w-4xl mx-auto">
            {/* En-tête */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-foreground/10 rounded-full mb-4">
                <User className="h-6 w-6 text-foreground" />
              </div>
              <h1 className="text-3xl font-bold">Mon compte</h1>
              <p className="text-muted-foreground">Gérez vos informations personnelles</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-secondary/30 border border-border rounded-xl p-5 text-center">
                  <div className="h-16 w-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">
                      {(user.prenom || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-bold">{fullName || "Utilisateur"}</h3>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="mt-2">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full">
                        <Shield className="h-3 w-3" />
                        Administrateur
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">
                        Client
                      </span>
                    )}
                  </div>
                </div>

                <div className="border border-border rounded-xl overflow-hidden">
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition text-left">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Mes informations</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition text-left border-t border-border">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">Mes favoris</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition text-left border-t border-border">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="text-sm">Mes commandes</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition text-left border-t border-border">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Paramètres</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition text-left border-t border-border text-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Déconnexion</span>
                  </button>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="md:col-span-2 space-y-6">
                {/* Informations personnelles */}
                <div className="border border-border rounded-xl p-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informations personnelles
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Nom complet</span>
                      <span className="text-sm font-medium">{fullName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Rôle</span>
                      <span className="text-sm font-medium">{isAdmin ? "Administrateur" : "Client"}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-muted-foreground">Membre depuis</span>
                      <span className="text-sm font-medium">
                        {user.date_creation 
                          ? new Date(user.date_creation).toLocaleDateString("fr-FR") 
                          : "Inconnu"}
                      </span>
                    </div>
                  </div>
                </div>


                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-border rounded-xl p-4 text-center">
                    <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Favoris</p>
                  </div>
                  <div className="border border-border rounded-xl p-4 text-center">
                    <ShoppingBag className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Commandes</p>
                  </div>
                </div>

                {/* Bandeau admin */}
                {isAdmin && (
                  <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-500/30 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <Shield className="h-8 w-8 text-purple-500" />
                      <div>
                        <h3 className="font-bold">Accès Administrateur</h3>
                        <p className="text-xs text-muted-foreground">Vous avez accès à toutes les fonctionnalités du site</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Compte;