import { Package, Clock, Heart, Star, ShoppingBag, Settings, ChevronRight, MessageSquare, HelpCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardApercu = () => {
  const user = { name: "Jean Dupont" };

  const stats = [
    { label: "Commandes", value: 10, icon: Package, color: "bg-gray-200" },
    { label: "En cours", value: 2, icon: Clock, color: "bg-gray-300" },
    { label: "Favoris", value: 8, icon: Heart, color: "bg-gray-400" },
    { label: "Avis", value: 5, icon: Star, color: "bg-gray-500" }
  ];

  const recentOrders = [
    { id: "CMD-2024-001", date: "12/03/2024", status: "Livrée", total: "1 249,00 €", items: 3 },
    { id: "CMD-2024-002", date: "28/02/2024", status: "En préparation", total: "89,90 €", items: 1 },
    { id: "CMD-2024-003", date: "15/02/2024", status: "Livrée", total: "459,00 €", items: 2 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">Bonjour, {user.name} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400">Voici un aperçu de votre activité</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-4">
            <div className={`w-10 h-10 ${stat.color} dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5 text-black dark:text-white" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/catalogue"
          className="flex items-center justify-between p-4 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-black dark:text-white" />
            <div>
              <p className="font-medium text-black dark:text-white">Explorer le catalogue</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Découvrez nos produits</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>

        <Link
          to="/configurateur"
          className="flex items-center justify-between p-4 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-black dark:text-white" />
            <div>
              <p className="font-medium text-black dark:text-white">Configurateur PC</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Créez votre configuration</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>
      </div>

      {/* Dernières commandes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black dark:text-white">Dernières commandes</h2>
          <Link to="/DashboardClient/commandes" className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition">
            Voir tout
          </Link>
        </div>
        <div className="space-y-3">
          {recentOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl">
              <div>
                <p className="font-medium text-black dark:text-white">{order.id}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{order.date} · {order.items} article{order.items > 1 ? "s" : ""}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-black dark:text-white">{order.total}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.status === "Livrée" ? "bg-gray-200 text-black dark:bg-gray-700 dark:text-white" :
                  "bg-gray-300 text-black dark:bg-gray-600 dark:text-white"
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support */}
      <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <MessageSquare className="h-6 w-6 text-black dark:text-white mt-1" />
          <div>
            <h3 className="font-semibold text-black dark:text-white mb-1">Besoin d'aide ?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Notre équipe est disponible pour répondre à toutes vos questions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition"
              >
                <HelpCircle className="h-4 w-4" />
                Nous contacter
              </Link>
              <Link
                to="/guides"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition"
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