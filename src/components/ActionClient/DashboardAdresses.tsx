import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MapPin, Plus, Edit2, Trash2, Check, X, Home, Building, Package,
  Star, AlertCircle, Loader2, Upload, Image as ImageIcon, Map, Eye,
  ChevronDown, Phone, User, Navigation,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/service/api";
import MapPicker from "@/components/MapPicker";

// ─── Types ───────────────────────────────────────────────────────────────────
type Adresse = {
  id: number;
  utilisateur_id: number;
  etiquette: string;
  nom_complet: string;
  telephone: string | null;
  adresse_ligne1: string;
  adresse_ligne2: string | null;
  ville: string;
  region: string | null;
  code_postal: string | null;
  pays: string;
  par_defaut_expedition: boolean;
  par_defaut_facturation: boolean;
  date_creation: string;
  date_modification: string;
  image_adress: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
};

type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCoordinate = (value: any): string => {
  if (value === null || value === undefined || value === "") return "0.0000";
  const num = Number(value);
  return isNaN(num) ? "0.0000" : num.toFixed(4);
};

const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return "/placeholder-image.jpg";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
  if (imagePath.startsWith("/storage/") || imagePath.startsWith("/image-lieu/")) return `${baseUrl}${imagePath}`;
  return `${baseUrl}/storage/image-lieu/${imagePath}`;
};

const getTypeIcon = (etiquette: string) => {
  const t = etiquette?.toLowerCase() ?? "";
  if (t.includes("maison") || t.includes("home")) return <Home className="h-4 w-4" />;
  if (t.includes("appartement") || t.includes("apartment")) return <Building className="h-4 w-4" />;
  if (t.includes("bureau") || t.includes("office")) return <Package className="h-4 w-4" />;
  return <MapPin className="h-4 w-4" />;
};

// ─── Styles partagés ────────────────────────────────────────────────────────
const INPUT =
  "w-full px-4 py-2.5 text-sm border border-border/60 rounded-xl bg-background/60 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed";

const LABEL = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";

const MODAL_PANEL =
  "bg-card border border-border/60 rounded-2xl w-full shadow-2xl shadow-black/30 flex flex-col";

// ─── ModalPortal ─────────────────────────────────────────────────────────────
const ModalPortal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ margin: 0 }}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>,
    document.body,
  );
};

// ─── ModalHeader ─────────────────────────────────────────────────────────────
const ModalHeader = ({ icon: Icon, title, subtitle, onClose, disabled = false }: {
  icon: any; title: string; subtitle?: string; onClose: () => void; disabled?: boolean;
}) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 rounded-t-2xl bg-gradient-to-r from-primary/5 to-transparent shrink-0">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-base font-bold text-black">{title}</h2>
        {subtitle && <p className="text-xs text-black/70">{subtitle}</p>}
      </div>
    </div>
    <button
      onClick={onClose}
      disabled={disabled}
      className="p-1.5 rounded-lg text-black/70 hover:text-black hover:bg-black/10 transition-all disabled:opacity-40"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

// ─── FormSection ─────────────────────────────────────────────────────────────
const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
      <span className="h-px flex-1 bg-border/50" />
      {title}
      <span className="h-px flex-1 bg-border/50" />
    </h3>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
const DashboardAdresses = () => {
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedAdresse, setSelectedAdresse] = useState<Adresse | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Adresse>>({
    etiquette: "",
    nom_complet: "",
    telephone: "",
    adresse_ligne1: "",
    adresse_ligne2: "",
    code_postal: "",
    ville: "",
    region: "",
    pays: "Madagascar",
    par_defaut_expedition: false,
    par_defaut_facturation: false,
    image_adress: null,
    latitude: null,
    longitude: null,
  });

  useEffect(() => { fetchUserAndAdresses(); }, []);

  const fetchUserAndAdresses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userRes = await api.get("/utilisateurs/profile");
      const currentUser = userRes.data?.data ?? userRes.data;
      setUser(currentUser);

      const adressesRes = await api.get("/adresses");
      const d = adressesRes.data;
      const list: Adresse[] =
        Array.isArray(d?.data) ? d.data :
        Array.isArray(d) ? d :
        Array.isArray(d?.adresses) ? d.adresses : [];
      setAdresses(list);
    } catch {
      setError("Impossible de charger vos adresses. Veuillez réessayer.");
      toast.error("Erreur de chargement des adresses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    toast.success(`Position sélectionnée : ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Veuillez sélectionner une image valide"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("L'image ne doit pas dépasser 2MB"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setForm({
      etiquette: "",
      nom_complet: user ? `${user.prenom} ${user.nom}` : "",
      telephone: user?.telephone || "",
      adresse_ligne1: "",
      adresse_ligne2: "",
      code_postal: "",
      ville: "",
      region: "",
      pays: "Madagascar",
      par_defaut_expedition: adresses.length === 0,
      par_defaut_facturation: adresses.length === 0,
      image_adress: null,
      latitude: null,
      longitude: null,
    });
    setSelectedAdresse(null);
    setImagePreview(null);
    setImageFile(null);
    setErrorDetails(null);
    setShowModal(true);
  };

  const handleOpenEdit = (adresse: Adresse) => {
    setSelectedAdresse(adresse);
    setForm({ ...adresse, telephone: adresse.telephone || "", region: adresse.region || "", code_postal: adresse.code_postal || "" });
    setImagePreview(adresse.image_adress);
    setImageFile(null);
    setErrorDetails(null);
    setShowModal(true);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await api.post("/adresses/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
    if (res.data.success && res.data.image_url) return res.data.image_url;
    throw new Error(res.data.message || "Erreur lors de l'upload de l'image");
  };

  const handleSave = async () => {
    if (!form.nom_complet?.trim()) { toast.error("Le nom complet est obligatoire"); return; }
    if (!form.adresse_ligne1?.trim()) { toast.error("L'adresse ligne 1 est obligatoire"); return; }
    if (!form.ville?.trim()) { toast.error("La ville est obligatoire"); return; }
    if (!form.telephone?.trim()) { toast.error("Le téléphone est obligatoire"); return; }
    if (!form.code_postal?.trim()) { toast.error("Le code postal est obligatoire"); return; }
    if (!form.pays?.trim()) { toast.error("Le pays est obligatoire"); return; }

    setIsSaving(true);
    setErrorDetails(null);

    try {
      let imageFilename = form.image_adress || null;
      if (imageFile) imageFilename = await uploadImage(imageFile);

      const payload = {
        etiquette: form.etiquette?.trim() || "Livraison",
        nom_complet: form.nom_complet!.trim(),
        telephone: form.telephone?.trim() || null,
        adresse_ligne1: form.adresse_ligne1!.trim(),
        adresse_ligne2: form.adresse_ligne2?.trim() || null,
        ville: form.ville!.trim(),
        region: form.region?.trim() || null,
        code_postal: form.code_postal?.trim() || null,
        pays: form.pays!.trim(),
        par_defaut_expedition: form.par_defaut_expedition ? 1 : 0,
        par_defaut_facturation: form.par_defaut_facturation ? 1 : 0,
        image_adress: imageFilename,
        latitude: form.latitude ? parseFloat(String(form.latitude)) : null,
        longitude: form.longitude ? parseFloat(String(form.longitude)) : null,
      };

      if (selectedAdresse) await api.put(`/adresses/${selectedAdresse.id}`, payload);
      else await api.post("/adresses", payload);

      toast.success(selectedAdresse ? "Adresse modifiée avec succès" : "Adresse ajoutée avec succès");
      await fetchUserAndAdresses();
      setShowModal(false);
    } catch (error: any) {
      if (error.response) {
        setErrorDetails(JSON.stringify(error.response.data, null, 2));
        const errors = error.response.data?.errors;
        if (errors) {
          const first = Object.values(errors)[0];
          toast.error(Array.isArray(first) ? first[0] : "Erreur de validation");
        } else {
          toast.error(error.response.data?.message || `Erreur ${error.response.status}`);
        }
      } else {
        toast.error(error.message || "Erreur inconnue");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdresse) return;
    try {
      await api.delete(`/adresses/${selectedAdresse.id}`);
      await fetchUserAndAdresses();
      setShowDeleteAlert(false);
      setSelectedAdresse(null);
      toast.success("Adresse supprimée avec succès");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.put(`/adresses/${id}/defaut-expedition`);
      await fetchUserAndAdresses();
      toast.success("Adresse par défaut mise à jour");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Chargement de vos adresses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-10 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <p className="font-medium text-destructive mb-4">{error}</p>
        <button onClick={fetchUserAndAdresses} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition">
          Réessayer
        </button>
      </div>
    );
  }

  // ─── Rendu principal ───────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-12rem)] max-w-none bg-black px-5 py-6 text-white sm:px-7 md:px-9 md:py-8">
      <div className="max-w-5xl">

      {/* En-tête */}
      <div className="mb-8">
        <div>
          <div className="hidden">
            <MapPin className="h-3.5 w-3.5" />
            <span>Mon compte</span>
            <ChevronDown className="h-3 w-3 -rotate-90" />
            <span className="text-foreground font-medium">Adresses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Salut,</h1>
          <p className="mt-1 inline-block border-b border-white/60 pb-1 text-sm font-medium italic text-white/75">Voici tes adresses enregistrées</p>
          <p className="hidden">
            {adresses.length > 0
              ? `${adresses.length} adresse${adresses.length > 1 ? "s" : ""} enregistrée${adresses.length > 1 ? "s" : ""}`
              : "Gérez vos adresses de livraison"}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="hidden"
        >
          <Plus className="h-4 w-4" />
          Ajouter une adresse
        </button>
      </div>

      {/* Debug error */}
      {errorDetails && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-destructive mb-1.5">Détails de l'erreur :</p>
          <pre className="text-[10px] text-destructive/80 whitespace-pre-wrap overflow-auto max-h-32">{errorDetails}</pre>
        </div>
      )}

      {/* Vide */}
      {adresses.length === 0 && (
        <>
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold italic text-white/75">Adresse de livraison :</h2>
            <p className="mt-2 text-xs italic text-white/60">Par défaut</p>
            <button onClick={handleOpenAdd} className="mt-1 inline-flex items-center gap-2 rounded-md border border-white/45 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"><Plus className="h-4 w-4" /> Ajouter une adresse</button>
          </div>
          <div>
            <p className="text-xs italic text-white/60">Optionnelle</p>
            <button onClick={handleOpenAdd} className="mt-1 inline-flex items-center gap-2 rounded-md border border-white/45 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"><Plus className="h-4 w-4" /> Ajouter une nouvelle adresse</button>
          </div>
        </div>
        <div className="hidden">
          <div className="w-20 h-20 mx-auto mb-4 bg-secondary/40 rounded-2xl flex items-center justify-center">
            <MapPin className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">Aucune adresse enregistrée</h3>
          <p className="text-sm text-muted-foreground mb-6">Ajoutez une adresse de livraison pour passer commande</p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
          >
            <Plus className="h-4 w-4" /> Ajouter une adresse
          </button>
        </div>
        </>
      )}

      {/* Grille adresses */}
      {adresses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {adresses.map((adresse) => (
            <div
              key={adresse.id}
              className={`relative bg-card border rounded-2xl p-5 transition-all duration-200 hover:shadow-md ${
                adresse.par_defaut_expedition
                  ? "border-primary/40 ring-1 ring-primary/15 hover:border-primary/60"
                  : "border-border/50 hover:border-primary/20"
              }`}
            >
              {/* Badge par défaut */}
              {adresse.par_defaut_expedition && (
                <div className="absolute -top-2.5 left-4">
                  <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md shadow-primary/20">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    PAR DÉFAUT
                  </span>
                </div>
              )}

              <div className="flex gap-4">
                {/* Infos */}
                <div className="flex-1 min-w-0">
                  {/* Type + coordonnées */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/40 text-xs font-medium text-muted-foreground">
                      <span className="text-primary">{getTypeIcon(adresse.etiquette)}</span>
                      {adresse.etiquette || "Adresse"}
                    </div>
                    {adresse.latitude && adresse.longitude && (
                      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 font-mono">
                        <Navigation className="h-3 w-3" />
                        {formatCoordinate(adresse.latitude)}, {formatCoordinate(adresse.longitude)}
                      </span>
                    )}
                  </div>

                  {/* Nom + téléphone */}
                  <div className="space-y-1 mb-3">
                    <p className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      {adresse.nom_complet}
                    </p>
                    {adresse.telephone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {adresse.telephone}
                      </p>
                    )}
                  </div>

                  {/* Adresse */}
                  <div className="text-xs text-muted-foreground leading-relaxed space-y-0.5">
                    <p className="text-foreground/80">{adresse.adresse_ligne1}</p>
                    {adresse.adresse_ligne2 && <p>{adresse.adresse_ligne2}</p>}
                    <p>
                      {adresse.code_postal && `${adresse.code_postal} `}{adresse.ville}
                    </p>
                    <p>
                      {adresse.region && `${adresse.region}, `}{adresse.pays}
                    </p>
                  </div>
                </div>

                {/* Image */}
                <div className="shrink-0">
                  {adresse.image_adress ? (
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-border/40 group">
                      <img
                        src={getImageUrl(adresse.image_adress)}
                        alt="Photo du lieu"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.jpg"; }}
                      />
                      <button
                        onClick={() => window.open(getImageUrl(adresse.image_adress), "_blank")}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Eye className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-xl border border-dashed border-border/40 bg-secondary/10 flex flex-col items-center justify-center gap-1.5">
                      <ImageIcon className="h-7 w-7 text-muted-foreground/25" />
                      <span className="text-[10px] text-muted-foreground/40">Aucune photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                <div>
                  {adresse.latitude && adresse.longitude && (
                    <button
                      onClick={() => window.open(`https://www.google.com/maps?q=${adresse.latitude},${adresse.longitude}`, "_blank")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-all duration-200"
                    >
                      <Map className="h-3.5 w-3.5" />
                      Google Maps
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {!adresse.par_defaut_expedition && (
                    <button
                      onClick={() => handleSetDefault(adresse.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 rounded-lg transition-all duration-200"
                    >
                      <Star className="h-3.5 w-3.5" />
                      Par défaut
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(adresse)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                    title="Modifier"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { setSelectedAdresse(adresse); setShowDeleteAlert(true); }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS — via createPortal
      ══════════════════════════════════════════════════════════════════════════ */}

      {/* Modal: Ajouter / Modifier */}
      {showModal && (
        <ModalPortal onClose={() => !isSaving && setShowModal(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white text-black shadow-2xl">
            <ModalHeader
              icon={MapPin}
              title={selectedAdresse ? "Modifie ton adresse" : "Ajoute ton adresse"}
              subtitle={selectedAdresse ? "Modifiez les informations ci-dessous" : "Remplissez les informations de livraison"}
              onClose={() => setShowModal(false)}
              disabled={isSaving}
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-6 hidden">

              {/* Identité */}
              <FormSection title="Identité">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={LABEL}>Nom complet <span className="text-destructive normal-case">*</span></label>
                    <input name="nom_complet" value={form.nom_complet || ""} onChange={handleInputChange}
                      placeholder="Prénom Nom" className={INPUT} required disabled={isSaving} />
                  </div>
                  <div>
                    <label className={LABEL}>Téléphone</label>
                    <input name="telephone" value={form.telephone || ""} onChange={handleInputChange}
                      placeholder="034 12 345 67" className={INPUT} disabled={isSaving} />
                  </div>
                  <div>
                    <label className={LABEL}>Étiquette</label>
                    <div className="flex gap-2">
                      {[
                        { value: "Maison",      label: "🏠 Maison" },
                        { value: "Appartement", label: "🏢 Appart" },
                        { value: "Bureau",      label: "💼 Bureau" },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, etiquette: type.value }))}
                          disabled={isSaving}
                          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all border ${
                            form.etiquette === type.value
                              ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                              : "bg-background/60 text-foreground border-border/60 hover:bg-secondary/50"
                          } disabled:opacity-50`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </FormSection>

              {/* Adresse */}
              <FormSection title="Adresse">
                <div className="space-y-3">
                  <div>
                    <label className={LABEL}>Adresse ligne 1 <span className="text-destructive normal-case">*</span></label>
                    <input name="adresse_ligne1" value={form.adresse_ligne1 || ""} onChange={handleInputChange}
                      placeholder="Numéro et nom de rue" className={INPUT} required disabled={isSaving} />
                  </div>
                  <div>
                    <label className={LABEL}>Adresse ligne 2 <span className="text-muted-foreground/60 normal-case font-normal">(optionnel)</span></label>
                    <input name="adresse_ligne2" value={form.adresse_ligne2 || ""} onChange={handleInputChange}
                      placeholder="Appartement, étage, bâtiment..." className={INPUT} disabled={isSaving} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={LABEL}>Code postal</label>
                      <input name="code_postal" value={form.code_postal || ""} onChange={handleInputChange}
                        className={INPUT} disabled={isSaving} />
                    </div>
                    <div>
                      <label className={LABEL}>Ville <span className="text-destructive normal-case">*</span></label>
                      <input name="ville" value={form.ville || ""} onChange={handleInputChange}
                        className={INPUT} required disabled={isSaving} />
                    </div>
                    <div>
                      <label className={LABEL}>Région</label>
                      <input name="region" value={form.region || ""} onChange={handleInputChange}
                        placeholder="Analamanga..." className={INPUT} disabled={isSaving} />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Pays <span className="text-destructive normal-case">*</span></label>
                    <select name="pays" value={form.pays || "Madagascar"} onChange={handleInputChange}
                      className={INPUT} required disabled={isSaving}>
                      <option value="Madagascar">Madagascar</option>
                      <option value="France">France</option>
                      <option value="Canada">Canada</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
              </FormSection>

              {/* Photo */}
              <FormSection title="Photo du lieu">
                <div className="flex items-center gap-4">
                  <label className={`flex-1 flex items-center gap-3 px-4 py-3 border border-dashed border-border/60 rounded-xl cursor-pointer bg-secondary/10 hover:bg-secondary/20 hover:border-primary/40 transition-all group ${isSaving ? "opacity-50 pointer-events-none" : ""}`}>
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                      <Upload className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                        {imageFile ? imageFile.name : "Choisir une image"}
                      </p>
                      <p className="text-xs text-muted-foreground/60">JPG, PNG, WEBP · max 2MB</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isSaving} />
                  </label>
                  {imagePreview && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/40 shrink-0">
                      <img src={imagePreview} alt="Prévisualisation" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setImagePreview(null); setImageFile(null); setForm((p) => ({ ...p, image_adress: null })); }}
                        disabled={isSaving}
                        className="absolute -top-1 -right-1 p-0.5 bg-destructive text-white rounded-full hover:bg-destructive/80 disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </FormSection>

              {/* Localisation */}
              <FormSection title="Localisation GPS">
                <MapPicker
                  latitude={typeof form.latitude === "string" ? parseFloat(form.latitude) : form.latitude || null}
                  longitude={typeof form.longitude === "string" ? parseFloat(form.longitude) : form.longitude || null}
                  onLocationSelect={handleLocationSelect}
                  address={`${form.adresse_ligne1 || ""} ${form.ville || ""}`}
                  disabled={isSaving}
                />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className={LABEL}>Latitude</label>
                    <input value={form.latitude || ""} readOnly
                      className={`${INPUT} bg-secondary/20 cursor-not-allowed`}
                      placeholder="Sélectionnez sur la carte" />
                  </div>
                  <div>
                    <label className={LABEL}>Longitude</label>
                    <input value={form.longitude || ""} readOnly
                      className={`${INPUT} bg-secondary/20 cursor-not-allowed`}
                      placeholder="Sélectionnez sur la carte" />
                  </div>
                </div>
              </FormSection>

              {/* Préférences */}
              <FormSection title="Préférences">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center px-1 shrink-0 ${form.par_defaut_expedition ? "bg-primary" : "bg-border"}`}
                    onClick={() => setForm((p) => ({ ...p, par_defaut_expedition: !p.par_defaut_expedition }))}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.par_defaut_expedition ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Adresse par défaut</div>
                    <div className="text-xs text-muted-foreground">Utilisée automatiquement pour l'expédition</div>
                  </div>
                </label>
              </FormSection>
            </div>

            <div className="space-y-6 px-5 py-8 sm:px-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div><label className="mb-2 block text-lg font-medium">Nom</label><input name="nom_complet" value={(form.nom_complet || "").split(" ").slice(-1).join(" ")} onChange={(e) => setForm((p) => ({ ...p, nom_complet: `${(p.nom_complet || "").split(" ").slice(0, -1).join(" ")} ${e.target.value}`.trim() }))} placeholder="Obligatoire" className="w-full rounded-xl border border-black/40 px-3 py-2.5 text-lg italic outline-none focus:border-black" disabled={isSaving} /></div>
                <div><label className="mb-2 block text-lg font-medium">Prénom</label><input value={(form.nom_complet || "").split(" ").slice(0, -1).join(" ")} onChange={(e) => setForm((p) => ({ ...p, nom_complet: `${e.target.value} ${(p.nom_complet || "").split(" ").slice(-1).join(" ")}`.trim() }))} placeholder="Obligatoire" className="w-full rounded-xl border border-black/40 px-3 py-2.5 text-lg italic outline-none focus:border-black" disabled={isSaving} /></div>
              </div>
              <div><label className="mb-2 block text-lg font-medium">Téléphone</label><input name="telephone" value={form.telephone || ""} onChange={handleInputChange} placeholder="Obligatoire" className="w-full rounded-xl border border-black/40 px-3 py-2.5 text-lg italic outline-none focus:border-black" disabled={isSaving} /></div>
              <div><label className="mb-2 block text-lg font-medium">Adresse</label><input name="adresse_ligne1" value={form.adresse_ligne1 || ""} onChange={handleInputChange} placeholder="Obligatoire" className="w-full rounded-xl border border-black/40 px-3 py-2.5 text-lg italic outline-none focus:border-black" disabled={isSaving} /></div>
              <div><label className="mb-2 block text-lg font-medium">Ville</label><input name="ville" value={form.ville || ""} onChange={handleInputChange} placeholder="Obligatoire" className="w-full rounded-xl border border-black/40 px-3 py-2.5 text-lg italic outline-none focus:border-black" disabled={isSaving} /></div>
              <div><label className="mb-2 block text-lg font-medium">Code Postal</label><input name="code_postal" value={form.code_postal || ""} onChange={handleInputChange} placeholder="Obligatoire" className="w-full rounded-xl border border-black/40 px-3 py-2.5 text-lg italic outline-none focus:border-black" disabled={isSaving} /></div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 px-6 py-5 shrink-0">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/80 disabled:opacity-40"
              >
                J'annule
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {isSaving
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement...</>
                  : <><Check className="h-3.5 w-3.5" /> J'enregistre</>}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal: Supprimer */}
      {showDeleteAlert && selectedAdresse && (
        <ModalPortal onClose={() => setShowDeleteAlert(false)}>
          <div className={`${MODAL_PANEL} max-w-md`}>
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Supprimer l'adresse</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Voulez-vous vraiment supprimer l'adresse de{" "}
                    <span className="font-semibold text-foreground">{selectedAdresse.ville}</span>{" "}?
                  </p>
                  {selectedAdresse.par_defaut_expedition && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      Cette adresse est votre adresse par défaut.
                    </div>
                  )}
                  <p className="text-xs text-destructive/70 mt-2">Cette action est irréversible.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border/50 bg-secondary/10 rounded-b-2xl">
              <button
                onClick={() => setShowDeleteAlert(false)}
                className="px-4 py-2 text-sm border border-border/60 rounded-xl hover:bg-secondary/50 text-muted-foreground transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex items-center gap-2 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.3); }
      `}</style>
    </div>
    </div>
  );
};

export default DashboardAdresses;
