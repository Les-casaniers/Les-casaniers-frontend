import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Trash2, 
  Eye, 
  Loader2,
  Calendar,
  Mail,
  Phone,
  UserPlus,
  RefreshCcw,
  AlertCircle,
  Filter,
  Shield,
  XCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import api from "@/service/api";

type Admin = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  poste: string | null;
  statut: "actif" | "inactif";
  date_creation: string;
  date_modification: string;
};

const AdminUtilisateurs = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("tous");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Form pour ajouter un admin
  const [newAdmin, setNewAdmin] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    poste: "",
    mot_de_passe: "",
    mot_de_passe_confirmation: ""
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      // Utiliser la bonne route pour les administrateurs
      const response = await api.get('/admin/list');
      console.log("Admins récupérés:", response.data);
      
      let adminsData: Admin[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        adminsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        adminsData = response.data;
      } else if (response.data.admins && Array.isArray(response.data.admins)) {
        adminsData = response.data.admins;
      } else {
        adminsData = [];
      }
      
      setAdmins(adminsData);
    } catch (error: any) {
      console.error("Erreur chargement admins:", error);
      toast.error(error.response?.data?.message || "Impossible de charger les administrateurs");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatut = async (adminId: number, currentStatut: string) => {
    try {
      setActionLoading(adminId);
      const nouveauStatut = currentStatut === "actif" ? "inactif" : "actif";
      const response = await api.put(`/admin/${adminId}/statut`, { statut: nouveauStatut });
      
      if (response.data.success) {
        toast.success(`Administrateur ${nouveauStatut === "actif" ? "activé" : "désactivé"}`);
        await fetchAdmins();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteAdmin = async (adminId: number) => {
    try {
      setActionLoading(adminId);
      const response = await api.delete(`/admin/${adminId}`);
      
      if (response.data.success) {
        toast.success("Administrateur supprimé avec succès");
        await fetchAdmins();
        setShowDetails(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.prenom || !newAdmin.nom || !newAdmin.email || !newAdmin.mot_de_passe) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    if (newAdmin.mot_de_passe !== newAdmin.mot_de_passe_confirmation) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    try {
      const response = await api.post('/admin/register', {
        prenom: newAdmin.prenom,
        nom: newAdmin.nom,
        email: newAdmin.email,
        telephone: newAdmin.telephone || null,
        poste: newAdmin.poste || null,
        mot_de_passe: newAdmin.mot_de_passe,
        mot_de_passe_confirmation: newAdmin.mot_de_passe_confirmation
      });
      
      if (response.data.success) {
        toast.success("Administrateur ajouté avec succès");
        setShowAddModal(false);
        setNewAdmin({
          prenom: "",
          nom: "",
          email: "",
          telephone: "",
          poste: "",
          mot_de_passe: "",
          mot_de_passe_confirmation: ""
        });
        await fetchAdmins();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const adminsFiltres = admins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    const bySearch = searchTerm === "" || 
      admin.prenom.toLowerCase().includes(searchLower) ||
      admin.nom.toLowerCase().includes(searchLower) ||
      admin.email.toLowerCase().includes(searchLower) ||
      (admin.telephone?.includes(searchLower) || false);
    
    const byStatut = filterStatut === "tous" || admin.statut === filterStatut;
    
    return bySearch && byStatut;
  });

  const stats = {
    total: admins.length,
    actifs: admins.filter(a => a.statut === "actif").length,
    inactifs: admins.filter(a => a.statut === "inactif").length,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des administrateurs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administrateurs</h1>
          <p className="text-muted-foreground">Gérez les comptes administrateurs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un admin
          </button>
          <button
            onClick={fetchAdmins}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition"
          >
            <RefreshCcw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.actifs}</p>
          <p className="text-xs text-muted-foreground">Actifs</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.inactifs}</p>
          <p className="text-xs text-muted-foreground">Inactifs</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-border bg-background appearance-none"
          >
            <option value="tous">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Liste des admins */}
      {adminsFiltres.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun administrateur trouvé</h3>
          <p className="text-muted-foreground">Aucun administrateur ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="space-y-4">
          {adminsFiltres.map((admin) => (
            <div
              key={admin.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold text-foreground">{admin.prenom} {admin.nom}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      admin.statut === "actif"
                        ? "bg-green-500/10 text-green-600 border-green-500/30"
                        : "bg-red-500/10 text-red-600 border-red-500/30"
                    }`}>
                      {admin.statut === "actif" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {admin.statut === "actif" ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {admin.email}
                    </span>
                    {admin.telephone && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {admin.telephone}
                      </span>
                    )}
                    {admin.poste && (
                      <span className="text-muted-foreground">
                        {admin.poste}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(admin.date_creation)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setShowDetails(true);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                    title="Voir détails"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleStatut(admin.id, admin.statut)}
                    disabled={actionLoading === admin.id}
                    className={`p-1.5 rounded-lg transition ${
                      admin.statut === "actif"
                        ? "text-red-500 hover:bg-red-500/10"
                        : "text-green-500 hover:bg-green-500/10"
                    }`}
                    title={admin.statut === "actif" ? "Désactiver" : "Activer"}
                  >
                    {actionLoading === admin.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      admin.statut === "actif" ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteAdmin(admin.id)}
                    disabled={actionLoading === admin.id}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL AJOUT ADMIN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-bold text-lg text-foreground">Ajouter un administrateur</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prénom *</label>
                    <input
                      value={newAdmin.prenom}
                      onChange={(e) => setNewAdmin({ ...newAdmin, prenom: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom *</label>
                    <input
                      value={newAdmin.nom}
                      onChange={(e) => setNewAdmin({ ...newAdmin, nom: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    value={newAdmin.telephone}
                    onChange={(e) => setNewAdmin({ ...newAdmin, telephone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Poste</label>
                  <input
                    value={newAdmin.poste}
                    onChange={(e) => setNewAdmin({ ...newAdmin, poste: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                  <input
                    type="password"
                    value={newAdmin.mot_de_passe}
                    onChange={(e) => setNewAdmin({ ...newAdmin, mot_de_passe: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirmer mot de passe *</label>
                  <input
                    type="password"
                    value={newAdmin.mot_de_passe_confirmation}
                    onChange={(e) => setNewAdmin({ ...newAdmin, mot_de_passe_confirmation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition">
                Annuler
              </button>
              <button onClick={handleAddAdmin} className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DÉTAILS ADMIN */}
      {showDetails && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">{selectedAdmin.prenom} {selectedAdmin.nom}</h2>
                    <p className="text-xs text-muted-foreground">Administrateur</p>
                  </div>
                </div>
                <button onClick={() => setShowDetails(false)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{selectedAdmin.email}</span>
                </div>
                {selectedAdmin.telephone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Téléphone</span>
                    <span>{selectedAdmin.telephone}</span>
                  </div>
                )}
                {selectedAdmin.poste && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Poste</span>
                    <span>{selectedAdmin.poste}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span className={selectedAdmin.statut === "actif" ? "text-green-600" : "text-red-600"}>
                    {selectedAdmin.statut === "actif" ? "Actif" : "Inactif"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date création</span>
                  <span>{formatDate(selectedAdmin.date_creation)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => toggleStatut(selectedAdmin.id, selectedAdmin.statut)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  selectedAdmin.statut === "actif"
                    ? "text-red-500 border border-red-500 hover:bg-red-500 hover:text-white"
                    : "text-green-500 border border-green-500 hover:bg-green-500 hover:text-white"
                }`}
              >
                {selectedAdmin.statut === "actif" ? "Désactiver" : "Activer"}
              </button>
              <button
                onClick={() => deleteAdmin(selectedAdmin.id)}
                className="flex-1 py-2 text-sm font-medium text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUtilisateurs;