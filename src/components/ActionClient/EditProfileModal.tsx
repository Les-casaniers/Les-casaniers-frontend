import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import api from "@/service/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  initialNom?: string;
  initialPrenom?: string;
  onClose: () => void;
};

const inputClass =
  "w-full px-4 py-3 text-sm font-sans italic text-slate-900 bg-white border border-black/70 rounded-xl focus:outline-none focus:border-black placeholder:text-slate-500";
const labelClass = "block text-xs font-semibold text-slate-700";

const EditProfileModal = ({ initialNom = "", initialPrenom = "", onClose }: Props) => {
  const { user, updateUser } = useAuth();
  const [nom, setNom] = useState(initialNom);
  const [prenom, setPrenom] = useState(initialPrenom);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleSave = async () => {
    if (!nom.trim() || !prenom.trim()) {
      toast({ title: "Champs manquants", description: "Le nom et le prénom sont obligatoires.", variant: "destructive" });
      return;
    }
    try {
      setIsSaving(true);
      // ⚠️ Endpoint à adapter si ton backend utilise une autre route
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("nom", nom.trim());
      fd.append("prenom", prenom.trim());
      if (user?.email) fd.append("email", user.email);
      if (photo) fd.append("photo", photo);
      const response = await api.post("/utilisateurs/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const responseData = response.data;
      let updatedUser = responseData?.data?.utilisateur
        ?? responseData?.data?.user
        ?? responseData?.data
        ?? responseData?.utilisateur
        ?? responseData?.user;

      if (!updatedUser || typeof updatedUser !== "object" || !updatedUser.id) {
        const profileResponse = await api.get("/utilisateurs/profile");
        updatedUser = profileResponse.data?.data ?? profileResponse.data;
      }

      if (!updatedUser || typeof updatedUser !== "object") {
        throw new Error("Le profil mis à jour est introuvable.");
      }

      updateUser(updatedUser);
      toast({ title: "Profil mis à jour", description: "Tes informations ont été enregistrées." });
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de mettre à jour ton profil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ margin: 0 }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="bg-white border border-black rounded-md shadow-2xl w-full max-w-[calc(32rem+2cm)] overflow-hidden">
          <div className="px-6 py-4 border-b border-black/40 bg-white">
            <h2 className="text-center text-3xl font-sans font-bold tracking-wide text-black">Change ton pseudo</h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className={labelClass}>Nom</label>
                <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Obligatoire" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Prénom</label>
                <input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Obligatoire" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Importer une photo</label>
                {/* Input fichier caché : s'ouvre sur le device, comme une pièce jointe */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={`${inputClass} block text-left truncate ${photo ? "not-italic" : "text-slate-500"}`}
                >
                  {photo ? photo.name : "Facultatif"}
                </button>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-8 h-[calc(3rem-0.1cm)] rounded-xl bg-black text-white text-base font-sans font-bold hover:bg-slate-900 transition"
                >
                  J'annule
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 h-[calc(3rem-0.1cm)] rounded-xl bg-orange-600 text-white text-base font-sans font-bold hover:bg-orange-700 disabled:opacity-50 transition"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "J'enregistre"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default EditProfileModal;
