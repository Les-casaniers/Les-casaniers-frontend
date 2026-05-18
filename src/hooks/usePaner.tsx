import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/service/api";

export type PanierItem = {
	id: number;
	produit_id: number;
	quantite: number;
	prix_unitaire?: number | null;
	total?: number | null;
	produit?: unknown;
	date_creation?: string;
	date_modification?: string;
};

export type Panier = {
	id: number;
	utilisateur_id?: number;
	total?: number | null;
	items?: PanierItem[];
	lignes?: PanierItem[];
	date_creation?: string;
	date_modification?: string;
};

export type AddPanierPayload = {
	produit_id: number;
	quantite?: number;
};

export type UpdatePanierPayload = {
	itemId: number;
	quantite: number;
};

const panierQueryKey = ["panier"] as const;

export const usePanier = () =>
	useQuery({
		queryKey: panierQueryKey,
		queryFn: async () => {
			const response = await api.get("/panier");
			return response.data.data as Panier;
		},
	});

export const useAddPanierItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: AddPanierPayload) => api.post("/panier/ajouter", payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: panierQueryKey });
		},
	});
};

export const useUpdatePanierItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ itemId, quantite }: UpdatePanierPayload) =>
			api.put(`/panier/modifier/${itemId}`, { quantite }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: panierQueryKey });
		},
	});
};

export const useRemovePanierItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (itemId: number) => api.delete(`/panier/supprimer/${itemId}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: panierQueryKey });
		},
	});
};

export const useClearPanier = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => api.delete("/panier/vider"),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: panierQueryKey });
		},
	});
};
