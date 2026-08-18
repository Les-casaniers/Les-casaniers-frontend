// App.tsx - Version complète avec les routes livreur
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShopProvider } from "@/store/shop";
import Index from "./pages/Index.tsx";
import Catalog from "./pages/Catalog.tsx";
import BoutiqueDeMisa from "./pages/BoutiqueDeMisa.tsx";
import Product from "./pages/Product.tsx";
import Config from "@/pages/Config";
import Configurateur from "./pages/Configurateur.tsx";
import Cart from "./pages/Cart.tsx";
import Account from "./pages/Account.tsx";
import NotFound from "./pages/NotFound.tsx";
import NousTrouver from "@/pages/NousTrouver";
import CGV from "@/pages/CGV";
import Confidentialite from "@/pages/Confidentialite";
import ProAndFreel from "@/pages/ProAndFreel";
import Gaming from "@/pages/Gaming";
import Composants from "@/pages/Composants";
import Pro from "@/pages/Pro";
import { FosaBot } from "./components/layout/FosaBot.tsx";
import Peripheriques from "@/pages/Peripheriques";
import Guides from "@/pages/Guides";
import GuideDetail from "@/pages/GuideDetail";
import Importation from "@/pages/Import";
import DevisExpress from "@/pages/DevisExpress";

// Importations utiles pour la connexion
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Compte from "@/pages/Compte";
import MotDePasseOublie from "@/pages/MotDePasseOublie";

// Import Routes pour Admin
import DashboardAdmin from "@/pages/DashboardAdmin";
import AdminDashboard from "@/components/ActionAdmin/AdminDashboard";
import AdminProduits from "@/components/ActionAdmin/AdminProduits";
import ConfigPc from "@/components/ActionAdmin/ConfigPc";
import AdminCommandes from "@/components/ActionAdmin/AdminCommandes";
import AdminClients from "@/components/ActionAdmin/AdminClients";
import AdminFavoris from "@/components/ActionAdmin/AdminFavoris";
import AdminPaniers from "@/components/ActionAdmin/AdminPaniers";
import AdminBoutiqueMisa from "@/components/ActionAdmin/AdminBoutiqueMisa";//nouveau
import AdminFactures from "@/components/ActionAdmin/AdminFactures";
import AdminDevis from "@/components/ActionAdmin/AdminDevis";
import AdminNotifications from "@/components/ActionAdmin/AdminNotifications";
import AdminParametres from "@/components/ActionAdmin/AdminParametres";
import AdminGuides from "@/components/ActionAdmin/AdminGuides";

// Import Routes pour Client
import DashboardClient from "@/pages/DashboardClient";
import DashboardApercu from "@/components/ActionClient/DashboardApercu";
import DashboardCommandes from "@/components/ActionClient/DashboardCommandes";
import DashboardAdresses from "@/components/ActionClient/DashboardAdresses";
import DashboardFavoris from "@/components/ActionClient/DashboardFavoris";
import DashboardPaiement from "@/components/ActionClient/DashboardPaiement";
import DashboardParametres from "@/components/ActionClient/DashboardParametres";
import Favorites from "./pages/Favorites.tsx";

import AdminAvis from "@/components/ActionAdmin/AdminAvis";
import AdminDevisExpress from "@/components/ActionAdmin/AdminDevisExpress";
import AdminUtilisateurs from "@/components/ActionAdmin/AdminUtilisateurs";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import QuiSommesNous from "./components/site/QuiSommesNous.tsx";
import LivreurLayout from "./components/LayoutLivreur/LivreurLayout.tsx";
import DashboardLivreur from "./pages/DashboardLivreur.tsx";
import LivreurLivraisons from "./components/ActionLivreur/LivreurLivraisons.tsx";
import LivreurPlanning from "./components/ActionLivreur/LivreurPlanning.tsx";
import LivreurStats from "./components/ActionLivreur/LivreurStats.tsx";
import LivreurNotifications from "./components/ActionLivreur/LivreurNotifications.tsx";
import LivreurParametres from "./components/ActionLivreur/LivreurParametres.tsx";
import DashboardProfile from "@/components/ActionClient/DashboardProfile.tsx";
import Profreelance from "@/pages/Pro";


// ============ IMPORTS LIVREUR ============


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ShopProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Index />} />
              <Route path="/qui-sommes-nous" element={<QuiSommesNous />} />
              <Route path="/catalogue" element={<Catalog />} />
              <Route path="/boutique-de-misa" element={<BoutiqueDeMisa />} />
              <Route path="/produit/:id" element={<Product />} />
              <Route path="/config" element={<Config />} />
              <Route path="/configurateur" element={<Configurateur />} />
              <Route path="/panier" element={<Cart />} />
              <Route path="/compte" element={<Account />} />
              <Route path="/nous-trouver" element={<NousTrouver />} />
              <Route path="/cgv" element={<CGV />} />
              <Route path="/confidentialite" element={<Confidentialite />} />
              <Route path="/pro-freelance" element={<ProAndFreel />} />
              <Route path="/composants" element={<Composants />} />
              <Route path="/gaming" element={<Gaming />} />
              <Route path="/pro" element={<Pro />} />
              <Route path="/peripheriques" element={<Peripheriques />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/guides/:id" element={<GuideDetail />} />
              <Route path="/importation" element={<Importation />} />
              <Route path="/favoris" element={<Favorites />} />
              <Route path="/devis-express" element={<DevisExpress />} />
              <Route path="/pro" element={<Profreelance />} />

              {/* Routes d'authentification */}
              <Route path="/login" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />

              {/* Routes utilisateur */}
              <Route path="/compte" element={<Compte />} />

              {/* Routes Admin imbriquées sous le layout DashboardAdmin */}
              <Route path="/DashboardAdmin" element={<DashboardAdmin />}>
                <Route index element={<AdminDashboard />} />
                <Route path="produits" element={<AdminProduits />} />
                <Route path="guides" element={<AdminGuides />} />
                <Route path="produits/:id" element={<ConfigPc />} />
                <Route path="commandes" element={<AdminCommandes />} />
                <Route path="clients" element={<AdminClients />} />
                <Route path="favoris" element={<AdminFavoris />} />
                <Route path="paniers" element={<AdminPaniers />} />
                <Route path="boutique-misa" element={<AdminBoutiqueMisa />} />
                <Route path="devis" element={<AdminDevis />} />
                <Route path="factures" element={<AdminFactures />} />
                <Route path="avis" element={<AdminAvis />} />
                <Route path="devis-express" element={<AdminDevisExpress />} />
                <Route path="admins" element={<AdminUtilisateurs />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="parametres" element={<AdminParametres />} />
              </Route>

              {/* Routes Client imbriquées sous le layout DashboardClient */}
              <Route path="/DashboardClient" element={<DashboardClient />}>
                <Route index element={<DashboardApercu />} />
                <Route path="commandes" element={<DashboardCommandes />} />
                <Route path="adresses" element={<DashboardAdresses />} />
                <Route path="favoris" element={<DashboardFavoris />} />
                <Route path="paiement" element={<DashboardPaiement />} />
                <Route path="parametres" element={<DashboardParametres />} />
                <Route path="details-client" element={<DashboardProfile />} />
              </Route>

              {/* ============ ROUTES LIVREUR ============ */}
              <Route path="/DashboardLivreur" element={<LivreurLayout />}>
                <Route index element={<DashboardLivreur />} />
                <Route path="livraisons" element={<LivreurLivraisons />} />
                <Route path="planning" element={<LivreurPlanning />} />
                <Route path="statistiques" element={<LivreurStats />} />
                <Route path="notifications" element={<LivreurNotifications />} />
                <Route path="parametres" element={<LivreurParametres />} />
              </Route>

              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Composants flottants sur toutes les pages */}
            {/* <FosaBot /> */}
            <CookieConsentBanner />
          </BrowserRouter>
        </ShopProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;