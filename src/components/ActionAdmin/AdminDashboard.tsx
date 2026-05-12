import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Activity, Headphones } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const stats = [
    { icon: DollarSign, label: "Revenus du mois", value: "45 600 000 Ar", change: "+12%", color: "text-black dark:text-white", bg: "bg-gray-200 dark:bg-gray-800" },
    { icon: ShoppingCart, label: "Commandes", value: "156", change: "+8%", color: "text-black dark:text-white", bg: "bg-gray-200 dark:bg-gray-800" },
    { icon: Users, label: "Nouveaux clients", value: "28", change: "+23%", color: "text-black dark:text-white", bg: "bg-gray-200 dark:bg-gray-800" },
    { icon: Package, label: "Produits en stock", value: "1 245", change: "-3", color: "text-black dark:text-white", bg: "bg-gray-200 dark:bg-gray-800" },
  ];

  const recentOrders = [
    { id: "CMD-2024-015", client: "Rakoto Jean", status: "En cours", total: "1 250 000 Ar" },
    { id: "CMD-2024-014", client: "Rabe Sarah", status: "Livrée", total: "890 000 Ar" },
    { id: "CMD-2024-013", client: "Randria Mike", status: "En attente", total: "2 450 000 Ar" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black dark:text-white">Tableau de bord</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`h-10 w-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-700' : 'text-red-700'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Dernières commandes */}
      <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400">Dernières commandes</h3>
          <Link to="/DashboardAdmin/commandes" className="text-xs text-black dark:text-white hover:underline font-medium">Voir tout</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700">
                <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Commande</th>
                <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Client</th>
                <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Statut</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, idx) => (
                <tr key={idx} className="border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-900 transition">
                  <td className="py-3 font-bold text-black dark:text-white">{order.id}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{order.client}</td>
                  <td className="py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      order.status === "Livrée" ? "bg-gray-300 text-black dark:bg-gray-700 dark:text-white" :
                      order.status === "En cours" ? "bg-gray-400 text-white dark:bg-gray-600 dark:text-white" :
                      "bg-gray-200 text-black dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-black dark:text-white">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertes et Top ventes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-5">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-black dark:text-white" />
            Alertes stock
          </h3>
          <div className="space-y-2">
            {[
              { product: "RTX 4060", stock: 2, seuil: 5 },
              { product: "SSD 1To", stock: 3, seuil: 10 },
            ].map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <span className="text-sm font-medium text-black dark:text-white">{alert.product}</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{alert.stock} / {alert.seuil}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-5">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-black dark:text-white" />
            Top ventes
          </h3>
          <div className="space-y-2">
            {[
              { product: "PC Gaming RTX 4060", sales: 45 },
              { product: "Clavier Mécanique", sales: 32 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <span className="text-sm font-medium text-black dark:text-white">{item.product}</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.sales} vendus</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;