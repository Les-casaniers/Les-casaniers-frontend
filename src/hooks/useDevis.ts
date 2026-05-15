import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/service/api";

export type StatutDevisApi = "brouillon" | "envoye" | "accepte" | "refuse" | "expire";

export const DEVIS_STATUS_LABELS: Record<StatutDevisApi, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
  expire: "Expiré",
};

export const DEVIS_STATUS_OPTIONS: StatutDevisApi[] = [
  "brouillon", "envoye", "accepte", "refuse", "expire",
];

export type DevisItem = {
  id: number;
  statut: StatutDevisApi;
  note: string | null;
  montant_total: number;
  devise: string;
  date_creation: string;
  utilisateur?: {
    id: number;
    prenom?: string;
    nom?: string;
    email?: string;
  };
};

export type AdminCreateDevisPayload = {
  utilisateur_id: number;
  panier_id?: number;
  note?: string;
  devise?: string;
};

const normalizeDevis = (raw: any[]): DevisItem[] => {
  return (raw ?? []).map((item) => ({
    id: Number(item.id),
    statut: item.statut as StatutDevisApi,
    note: item.note ?? null,
    montant_total: Number(item.montant_total ?? 0),
    devise: String(item.devise ?? "MGA"),
    date_creation: String(item.date_creation ?? ""),
    utilisateur: item.utilisateur ?? undefined,
  }));
};

export const useDevis = () => {
  const [devis, setDevis] = useState<DevisItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: devis.length,
    brouillon: devis.filter((d) => d.statut === "brouillon").length,
    envoye: devis.filter((d) => d.statut === "envoye").length,
    accepte: devis.filter((d) => d.statut === "accepte").length,
    refuse: devis.filter((d) => d.statut === "refuse").length,
    expire: devis.filter((d) => d.statut === "expire").length,
    montantTotal: devis.reduce((sum, d) => sum + d.montant_total, 0),
  }), [devis]);

  const fetchDevis = useCallback(async (statut?: StatutDevisApi) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/devis", { params: statut ? { statut } : undefined });
      setDevis(normalizeDevis(response?.data?.data ?? []));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors du chargement des devis");
    } finally {
      setLoading(false);
    }
  }, []);

  const createDevis = useCallback(async (payload: AdminCreateDevisPayload) => {
    await api.post("/admin/devis", payload);
    await fetchDevis();
  }, [fetchDevis]);

  useEffect(() => {
    fetchDevis();
  }, [fetchDevis]);

  return {
    devis,
    stats,
    loading,
    error,
    fetchDevis,
    createDevis,
  };
};

export default useDevis;
