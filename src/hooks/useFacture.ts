import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/service/api";

export type StatutFactureApi = "brouillon" | "emise" | "payee" | "annulee";

export const FACTURE_STATUS_LABELS: Record<StatutFactureApi, string> = {
  brouillon: "Brouillon",
  emise: "Émise",
  payee: "Payée",
  annulee: "Annulée",
};

export type FactureItem = {
  id: number;
  commande_id: number;
  facture_ref: string;
  statut: StatutFactureApi;
  montant_total: number;
  devise: string;
  methode_paiement: string | null;
  date_emission: string | null;
  date_paiement: string | null;
  date_creation: string;
  pdf_path: string | null;
  commande?: {
    commande_uuid: string;
    utilisateur?: {
      id: number;
      prenom?: string;
      nom?: string;
      email?: string;
    };
  };
};

const normalizeFacture = (raw: any): FactureItem => ({
  id: Number(raw.id),
  commande_id: Number(raw.commande_id ?? 0),
  facture_ref: String(raw.facture_ref ?? ""),
  statut: (raw.statut as StatutFactureApi) ?? "brouillon",
  montant_total: Number(raw.montant_total ?? 0),
  devise: String(raw.devise ?? "MGA"),
  methode_paiement: raw.methode_paiement ?? null,
  date_emission: raw.date_emission ?? null,
  date_paiement: raw.date_paiement ?? null,
  date_creation: String(raw.date_creation ?? ""),
  pdf_path: raw.pdf_path ?? null,
  commande: raw.commande ?? undefined,
});

const normalizeFactures = (raw: any[]): FactureItem[] =>
  (raw ?? []).map(normalizeFacture);

export const useFacture = () => {
  const [factures, setFactures] = useState<FactureItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = factures.length;
    const brouillon = factures.filter((f) => f.statut === "brouillon").length;
    const emises = factures.filter((f) => f.statut === "emise").length;
    const payees = factures.filter((f) => f.statut === "payee").length;
    const annulees = factures.filter((f) => f.statut === "annulee").length;
    const montantTotal = factures.reduce((sum, f) => sum + f.montant_total, 0);
    return { total, brouillon, emises, payees, annulees, montantTotal };
  }, [factures]);

  const fetchFactures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/factures");
      setFactures(normalizeFactures(response?.data?.data ?? []));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors du chargement des factures");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFactureDetail = useCallback(async (id: number): Promise<FactureItem> => {
    const response = await api.get(`/admin/factures/${id}`);
    return normalizeFacture(response?.data?.data ?? response?.data);
  }, []);

  const createFromCommande = useCallback(async (commandeUuid: string) => {
    await api.post("/admin/factures", { commande_uuid: commandeUuid });
    await fetchFactures();
  }, [fetchFactures]);

  const emitFacture = useCallback(async (id: number) => {
    await api.post(`/admin/factures/${id}/emettre`);
    await fetchFactures();
  }, [fetchFactures]);

  const markPaid = useCallback(async (id: number, methodePaiement?: string) => {
    await api.post(`/admin/factures/${id}/payer`, {
      methode_paiement: methodePaiement ?? null,
    });
    await fetchFactures();
  }, [fetchFactures]);

  const cancelFacture = useCallback(async (id: number) => {
    await api.post(`/admin/factures/${id}/annuler`);
    await fetchFactures();
  }, [fetchFactures]);

  const downloadFacture = useCallback(async (id: number) => {
    const response = await api.get(`/admin/factures/${id}/download`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facture_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    fetchFactures();
  }, [fetchFactures]);

  return {
    factures,
    stats,
    loading,
    error,
    fetchFactures,
    fetchFactureDetail,
    createFromCommande,
    emitFacture,
    markPaid,
    cancelFacture,
    downloadFacture,
  };
};

export default useFacture;
