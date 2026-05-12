import { useState } from "react";
import { Users, Trash2, AlertTriangle, X } from "lucide-react";

type Client = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  dateInscription: string;
  commandes: number;
  totalDepense: string;
  statut: "Actif" | "Inactif";
};

// Données par défaut
const clientsParDefaut: Client[] = [
  { id: "CLT-001", nom: "Jean Dupont", email: "jean.dupont@email.com", telephone: "034 12 345 67", dateInscription: "2025-01-15", commandes: 5, totalDepense: "1 250 000 Ar", statut: "Actif" },
  { id: "CLT-002", nom: "Marie Claire", email: "marie.claire@email.com", telephone: "033 98 765 43", dateInscription: "2025-02-20", commandes: 3, totalDepense: "450 000 Ar", statut: "Actif" },
  { id: "CLT-003", nom: "Pierre Andrian", email: "pierre.andrian@email.com", telephone: "038 55 22 11", dateInscription: "2025-03-10", commandes: 8, totalDepense: "2 890 000 Ar", statut: "Actif" },
  { id: "CLT-004", nom: "Lala Rasoa", email: "lala.rasoa@email.com", telephone: "034 77 88 99", dateInscription: "2025-01-05", commandes: 2, totalDepense: "89 900 Ar", statut: "Inactif" },
  { id: "CLT-005", nom: "Toky Randria", email: "toky.randria@email.com", telephone: "032 11 22 33", dateInscription: "2025-04-01", commandes: 12, totalDepense: "3 450 000 Ar", statut: "Actif" },
  { id: "CLT-006", nom: "Miora Rabe", email: "miora.rabe@email.com", telephone: "034 99 88 77", dateInscription: "2025-03-25", commandes: 1, totalDepense: "25 000 Ar", statut: "Actif" },
];

const AdminClients = () => {
  const [clients, setClients] = useState<Client[]>(clientsParDefaut);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleOpenDelete = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedClient) return;
    setClients(clients.filter(c => c.id !== selectedClient.id));
    setShowDeleteAlert(false);
    setSelectedClient(null);
  };

  const getStatutStyle = (statut: string) => {
    return statut === "Actif"
      ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/50"
      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/50";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Clients</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/10 rounded-lg">
          <Users className="h-4 w-4 text-black/50 dark:text-white/50" />
          <span className="text-sm text-black/60 dark:text-white/60">{clients.length} clients</span>
        </div>
      </div>

      {/* Tableau des clients */}
      <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Client</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Contact</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Inscription</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Commandes</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Total dépensé</th>
                <th className="text-left py-3 px-4 text-black/50 dark:text-white/50 font-medium">Statut</th>
                <th className="text-right py-3 px-4 text-black/50 dark:text-white/50 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-black/5 dark:border-white/5 last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-mono text-xs text-black/60 dark:text-white/60">{client.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-black dark:text-white">{client.nom}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <p className="text-xs text-black/60 dark:text-white/60">{client.email}</p>
                      <p className="text-xs text-black/40 dark:text-white/40 font-mono">{client.telephone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-black/60 dark:text-white/60">
                    {new Date(client.dateInscription).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 text-sm font-semibold">
                      {client.commandes}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-black dark:text-white">{client.totalDepense}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatutStyle(client.statut)}`}>
                      {client.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenDelete(client)}
                        className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Message si aucun client */}
        {clients.length === 0 && (
          <div className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-black/20 dark:text-white/20 mb-3" />
            <p className="text-black/40 dark:text-white/40">Aucun client inscrit</p>
          </div>
        )}
      </div>

      {/* ALERTE SUPPRESSION */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4">
            <div className="px-6 py-6 flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-black dark:text-white">Confirmer la suppression</h3>
                <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                  Voulez-vous vraiment supprimer le client <span className="font-medium text-black dark:text-white">"{selectedClient?.nom}"</span> ?<br />
                  <span className="text-xs">Cette action est irréversible.</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowDeleteAlert(false)}
                className="flex-1 py-2 text-sm font-medium text-black/70 dark:text-white/70 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
                Annuler
              </button>
              <button onClick={handleConfirmDelete}
                className="flex-1 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;