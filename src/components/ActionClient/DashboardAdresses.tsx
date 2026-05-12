import { MapPin } from "lucide-react";

const DashboardAdresses = () => {
  return (
    <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-black dark:text-white mb-2">Mes adresses</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Gérez vos adresses de livraison</p>
    </div>
  );
};

export default DashboardAdresses;