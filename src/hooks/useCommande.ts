import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/service/api";

export type StatutCommandeApi =
  | "en_attente"
  | "payee"
  | "en_traitement"
  | "expediee"
  | "terminee"
  | "annulee"
  | "remboursee";

export type CommandeLine = {
  id: number;
  commande_uuid: string;
  statut: StatutCommandeApi;
  sous_total: number;
  livraison: number;
  total: number;
  devise: string;
  titre: string;
  quantite: number;
  prix_unitaire: number;
  date_creation: string;
  utilisateur?: {
    prenom?: string;
    nom?: string;
    email?: string;
  };
};

export type CommandeSummary = {
  uuid: string;
  statut: StatutCommandeApi;
  sousTotal: number;
  livraison: number;
  total: number;
  devise: string;
  dateCreation: string;
  itemsCount: number;
  clientNom: string;
  clientEmail: string;
};

export type CommandeDetail = {
  resume: {
    commande_uuid: string;
    statut: StatutCommandeApi;
    sous_total: number;
    livraison: number;
    total: number;
    devise: string;
  };
  items: CommandeLine[];
};

export type AdminCreateCommandePayload = {
  utilisateur_id: number;
  livraison?: number;
  devise?: string;
};

const normalizeLines = (raw: any[]): CommandeLine[] => {
  return (raw ?? []).map((line) => ({
    id: Number(line.id),
    commande_uuid: String(line.commande_uuid),
    statut: line.statut as StatutCommandeApi,
    sous_total: Number(line.sous_total ?? 0),
    livraison: Number(line.livraison ?? 0),
    total: Number(line.total ?? 0),
    devise: String(line.devise ?? "MGA"),
    titre: String(line.titre ?? "Produit"),
    quantite: Number(line.quantite ?? 0),
    prix_unitaire: Number(line.prix_unitaire ?? 0),
    date_creation: String(line.date_creation ?? ""),
    utilisateur: line.utilisateur,
  }));
};

const groupCommandes = (lines: CommandeLine[]): CommandeSummary[] => {
  const map = new Map<string, CommandeSummary>();

  lines.forEach((line) => {
    const existing = map.get(line.commande_uuid);
    const nom = [line.utilisateur?.prenom, line.utilisateur?.nom].filter(Boolean).join(" ").trim();

    if (existing) {
      existing.itemsCount += 1;
      return;
    }

    map.set(line.commande_uuid, {
      uuid: line.commande_uuid,
      statut: line.statut,
      sousTotal: line.sous_total,
      livraison: line.livraison,
      total: line.total,
      devise: line.devise,
      dateCreation: line.date_creation,
      itemsCount: 1,
      clientNom: nom || "Client",
      clientEmail: line.utilisateur?.email || "-",
    });
  });

  return [...map.values()].sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
};

export const useCommande = () => {
  const [lines, setLines] = useState<CommandeLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const commandes = useMemo(() => groupCommandes(lines), [lines]);

  const fetchCommandes = useCallback(async (statut?: StatutCommandeApi) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/commandes", { params: statut ? { statut } : undefined });
      const normalized = normalizeLines(response?.data?.data ?? []);
      setLines(normalized);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommandeDetail = useCallback(async (uuid: string): Promise<CommandeDetail> => {
    const response = await api.get(`/admin/commandes/${uuid}`);
    const payload = response?.data?.data;

    return {
      resume: payload?.resume,
      items: normalizeLines(payload?.items ?? []),
    };
  }, []);

  const updateStatus = useCallback(async (uuid: string, statut: StatutCommandeApi) => {
    await api.patch(`/admin/commandes/${uuid}/statut`, { statut });
    await fetchCommandes();
    // Invalidate products cache — stock may have changed (payee, annulee, remboursee)
    if (["payee", "annulee", "remboursee"].includes(statut)) {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  }, [fetchCommandes, queryClient]);

  const cancelCommande = useCallback(async (uuid: string) => {
    await api.post(`/admin/commandes/${uuid}/cancel`);
    await fetchCommandes();
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }, [fetchCommandes, queryClient]);

  const createCommande = useCallback(async (payload: AdminCreateCommandePayload) => {
    await api.post("/admin/commandes", payload);
    await fetchCommandes();
  }, [fetchCommandes]);

  useEffect(() => {
    fetchCommandes();
  }, [fetchCommandes]);

  return {
    commandes,
    loading,
    error,
    fetchCommandes,
    fetchCommandeDetail,
    updateStatus,
    cancelCommande,
    createCommande,
  };
};

export default useCommande;
