import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShopProvider } from "@/store/shop";
import Index from "./pages/Index.tsx";
import Catalog from "./pages/Catalog.tsx";
import Product from "./pages/Product.tsx";
import Config from "@/pages/Config";
import Configurateur from "./pages/Configurateur.tsx";
import Cart from "./pages/Cart.tsx";
import Account from "./pages/Account.tsx";
import NotFound from "./pages/NotFound.tsx";
import NousTrouver from "@/pages/NousTrouver";
import CGV from "@/pages/CGV";
import ProAndFreel from "@/pages/ProAndFreel";
import Gaming from "@/pages/Gaming";
import Composants from "@/pages/Composants";
import Pro from "@/pages/Pro";
import { FosaBot } from "./components/layout/FosaBot.tsx";
import Peripheriques from "@/pages/Peripheriques";
import Guides from "@/pages/Guides";
import Importation from "@/pages/Import";
import DevisExpress from "@/pages/DevisExpress";

//Importations utiles pour la connexion
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Compte from "@/pages/Compte";
import MotDePasseOublie from "@/pages/MotDePasseOublie";


//Import Routes pour Admin
import DashboardAdmin from "@/pages/DashboardAdmin"; // votre layout
import AdminDashboard from "@/components/ActionAdmin/AdminDashboard";
import AdminProduits from "@/components/ActionAdmin/AdminProduits";
import ConfigPc from "@/components/ActionAdmin/ConfigPc";
import AdminCommandes from "@/components/ActionAdmin/AdminCommandes";
import AdminClients from "@/components/ActionAdmin/AdminClients";
import AdminFactures from "@/components/ActionAdmin/AdminFactures";
import AdminDevis from "@/components/ActionAdmin/AdminDevis";
import AdminNotifications from "@/components/ActionAdmin/AdminNotifications";
import AdminParametres from "@/components/ActionAdmin/AdminParametres";

//Import Routes pour Client
import DashboardClient from "@/pages/DashboardClient";
import DashboardApercu from "@/components/ActionClient/DashboardApercu";
import DashboardCommandes from "@/components/ActionClient/DashboardCommandes";
import DashboardAdresses from "@/components/ActionClient/DashboardAdresses";
import DashboardFavoris from "@/components/ActionClient/DashboardFavoris";
import DashboardPaiement from "@/components/ActionClient/DashboardPaiement";
import DashboardParametres from "@/components/ActionClient/DashboardParametres";
import Favorites from "./pages/Favorites.tsx";

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
            <Route path="/" element={<Index />} />
            <Route path="/catalogue" element={<Catalog />} />
            <Route path="/produit/:id" element={<Product />} />
            <Route path="/config" element={<Config />} />
            <Route path="/configurateur" element={<Configurateur />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/compte" element={<Account />} />
            <Route path="/nous-trouver" element={<NousTrouver />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/pro-freelance" element={<ProAndFreel />} />
            <Route path="/composants" element={<Composants />} />
            <Route path="/gaming" element={<Gaming />} />
            <Route path="/pro" element={<Pro />} />
            <Route path="/peripheriques" element={<Peripheriques />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/importation" element={<Importation />} />
            <Route path="/favoris" element={<Favorites />} />
            <Route path="/devis-express" element={<DevisExpress />} />
            {/* Route connexion */}
            <Route path="/login" element={<Login />} /> 
            <Route path="/inscription" element={<Register />} />
            <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
            <Route path="/compte" element={<Compte />} />
            <Route path="/DashboardClient" element={<DashboardClient />} />
            
            {/* âœ… Routes admin imbriquÃ©es sous le layout DashboardAdmin */}
            <Route path="/DashboardAdmin" element={<DashboardAdmin />}>
              <Route index element={<AdminDashboard />} />
              <Route path="produits" element={<AdminProduits />} />
              <Route path="produits/:id" element={<ConfigPc />} />
              <Route path="commandes" element={<AdminCommandes />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="devis" element={<AdminDevis />} />
              <Route path="factures" element={<AdminFactures />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="parametres" element={<AdminParametres />} />
             
            </Route>

            {/* âœ… Routes Client imbriquÃ©es sous le layout DashboardClient */}
            <Route path="/DashboardClient" element={<DashboardClient />}>
              <Route index element={<DashboardApercu />} />
              <Route path="commandes" element={<DashboardCommandes />} />
              <Route path="adresses" element={<DashboardAdresses />} />
              <Route path="favoris" element={<DashboardFavoris />} />
              <Route path="paiement" element={<DashboardPaiement />} />
              <Route path="parametres" element={<DashboardParametres />} />
            </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Casio flotte sur toutes les pages */}
            <FosaBot />
          </BrowserRouter>
        </ShopProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;

