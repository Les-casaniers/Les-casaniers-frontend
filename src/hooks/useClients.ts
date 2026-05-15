import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/service/api";

export type ClientStatus = "actif" | "desactive";

export type ClientApi = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string | null;
  statut: ClientStatus;
  date_creation?: string | null;
  created_at?: string | null;
  adresses?: ClientAddress[];
};

export type ClientView = {
  id: number;
  code: string;
  prenom: string;
  nom: string;
  nomComplet: string;
  email: string;
  telephone: string;
  statut: "Actif" | "Inactif";
  dateInscription: string;
  adressesCount: number;
};

export type ClientCreatePayload = {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  mot_de_passe: string;
  mot_de_passe_confirmation: string;
};

export type ClientUpdatePayload = {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string | null;
  statut?: ClientStatus;
};

export type ClientAddress = {
  id: number;
  utilisateur_id: number;
  etiquette?: string | null;
  nom_complet: string;
  telephone?: string | null;
  adresse_ligne1: string;
  adresse_ligne2?: string | null;
  ville: string;
  region?: string | null;
  code_postal?: string | null;
  pays: string;
  par_defaut_expedition: boolean;
  par_defaut_facturation: boolean;
  date_creation?: string;
};

export type ClientAddressPayload = {
  etiquette?: string;
  nom_complet: string;
  telephone?: string;
  adresse_ligne1: string;
  adresse_ligne2?: string;
  ville: string;
  region?: string;
  code_postal?: string;
  pays: string;
  par_defaut_expedition?: boolean;
  par_defaut_facturation?: boolean;
};

const pickArray = (payload: any): any[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const toView = (c: ClientApi): ClientView => {
  const dateInscription = String(c.date_creation ?? c.created_at ?? "");
  return {
    id: c.id,
    code: `CLT-${String(c.id).padStart(4, "0")}`,
    prenom: c.prenom ?? "",
    nom: c.nom ?? "",
    nomComplet: `${c.prenom ?? ""} ${c.nom ?? ""}`.trim(),
    email: c.email ?? "",
    telephone: c.telephone?.trim() || "-",
    statut: c.statut === "actif" ? "Actif" : "Inactif",
    dateInscription,
    adressesCount: 0,
  };
};

const getApiErrorMessage = (e: any, fallback: string) => {
  const firstValidationError = e?.response?.data?.errors
    ? Object.values(e.response.data.errors)?.flat?.()?.[0]
    : null;
  return (
    firstValidationError ||
    e?.response?.data?.message ||
    e?.message ||
    fallback
  );
};

export const useClients = () => {
  const [rawClients, setRawClients] = useState<ClientApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({});
  const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});
  const [togglingIds, setTogglingIds] = useState<Record<number, boolean>>({});
  const [addressLoadingByClient, setAddressLoadingByClient] = useState<Record<number, boolean>>({});
  const [addressMutatingByClient, setAddressMutatingByClient] = useState<Record<number, boolean>>({});
  const [addressesByClient, setAddressesByClient] = useState<Record<number, ClientAddress[]>>({});

  const clients = useMemo(() => {
    return rawClients.map((client) => {
      const view = toView(client);
      const list = addressesByClient[client.id];
      return {
        ...view,
        adressesCount: Array.isArray(list) ? list.length : 0,
      };
    });
  }, [rawClients, addressesByClient]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/utilisateurs");
      const list = pickArray(response?.data) as ClientApi[];
      setRawClients(list);
      setAddressesByClient((prev) => {
        const next = { ...prev };
        list.forEach((client) => {
          next[client.id] = Array.isArray(client.adresses) ? client.adresses : [];
        });
        return next;
      });
    } catch (e: any) {
      setError(getApiErrorMessage(e, "Impossible de charger les clients."));
    } finally {
      setLoading(false);
    }
  }, []);

  const getClientById = useCallback(async (id: number): Promise<ClientApi> => {
    const response = await api.get(`/admin/utilisateurs/${id}`);
    return response?.data?.data;
  }, []);

  const createClient = useCallback(async (payload: ClientCreatePayload) => {
    setCreating(true);
    try {
      await api.post("/admin/utilisateurs", payload);
      await fetchClients();
    } finally {
      setCreating(false);
    }
  }, [fetchClients]);

  const updateClient = useCallback(async (id: number, payload: ClientUpdatePayload) => {
    setUpdatingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await api.put(`/admin/utilisateurs/${id}`, payload);
      await fetchClients();
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [id]: false }));
    }
  }, [fetchClients]);

  const updateClientStatus = useCallback(async (id: number, statut: ClientStatus) => {
    setTogglingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await api.put(`/admin/utilisateurs/${id}`, { statut });
      await fetchClients();
    } finally {
      setTogglingIds((prev) => ({ ...prev, [id]: false }));
    }
  }, [fetchClients]);

  const deleteClient = useCallback(async (id: number) => {
    setDeletingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await api.delete(`/admin/utilisateurs/${id}`);
      await fetchClients();
    } finally {
      setDeletingIds((prev) => ({ ...prev, [id]: false }));
    }
  }, [fetchClients]);

  const fetchClientAddresses = useCallback(async (clientId: number) => {
    setAddressLoadingByClient((prev) => ({ ...prev, [clientId]: true }));
    try {
      const response = await api.get(`/admin/utilisateurs/${clientId}/adresses`);
      const list = pickArray(response?.data) as ClientAddress[];
      setAddressesByClient((prev) => ({ ...prev, [clientId]: list }));
      return list;
    } catch (e) {
      setAddressesByClient((prev) => ({ ...prev, [clientId]: [] }));
      throw e;
    } finally {
      setAddressLoadingByClient((prev) => ({ ...prev, [clientId]: false }));
    }
  }, []);

  const createClientAddress = useCallback(async (clientId: number, payload: ClientAddressPayload) => {
    setAddressMutatingByClient((prev) => ({ ...prev, [clientId]: true }));
    try {
      await api.post(`/admin/utilisateurs/${clientId}/adresses`, payload);
      await fetchClientAddresses(clientId);
    } finally {
      setAddressMutatingByClient((prev) => ({ ...prev, [clientId]: false }));
    }
  }, [fetchClientAddresses]);

  const updateClientAddress = useCallback(async (clientId: number, addressId: number, payload: Partial<ClientAddressPayload>) => {
    setAddressMutatingByClient((prev) => ({ ...prev, [clientId]: true }));
    try {
      await api.put(`/admin/utilisateurs/${clientId}/adresses/${addressId}`, payload);
      await fetchClientAddresses(clientId);
    } finally {
      setAddressMutatingByClient((prev) => ({ ...prev, [clientId]: false }));
    }
  }, [fetchClientAddresses]);

  const deleteClientAddress = useCallback(async (clientId: number, addressId: number) => {
    setAddressMutatingByClient((prev) => ({ ...prev, [clientId]: true }));
    try {
      await api.delete(`/admin/utilisateurs/${clientId}/adresses/${addressId}`);
      await fetchClientAddresses(clientId);
    } finally {
      setAddressMutatingByClient((prev) => ({ ...prev, [clientId]: false }));
    }
  }, [fetchClientAddresses]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    creating,
    updatingIds,
    deletingIds,
    togglingIds,
    addressLoadingByClient,
    addressMutatingByClient,
    addressesByClient,
    fetchClients,
    getClientById,
    createClient,
    updateClient,
    updateClientStatus,
    deleteClient,
    fetchClientAddresses,
    createClientAddress,
    updateClientAddress,
    deleteClientAddress,
    getApiErrorMessage,
  };
};

export default useClients;
