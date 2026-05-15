import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/service/api";

export interface Category {
  id: number;
  nom: string;
  description?: string;
  image?: string;
}

export interface ProductConfiguration {
  id: number;
  produit_id: number;
  utilisateur_id: number;
  nom_configuration: string;
  nom_configuration_autre?: string | null;
  devise?: string | null;
  prix_total: number;
  composants_json: { nom?: string; prix?: number; quantite?: number }[];
  date_creation?: string;
  date_modification?: string;
}

export interface Product {
  id: number;
  nom: string;
  reference?: string | null;
  description_courte?: string | null;
  description: string;
  prix: number;
  devise?: string | null;
  quantite_stock: number;
  est_dispo: boolean;
  categorie_id: number;
  type_produit: string;
  actif: boolean;
  date_creation?: string;
  date_modification?: string;
  images?: { id: number; url: string; alt: string; ordre?: number }[];
  attributs?: { cle_attr: string; valeur_attr: string; libelle_attr?: string }[];
  categorie?: Category;
  configurations?: ProductConfiguration[];
}

export type ProductFilters = {
  categorie_id?: number;
  type_produit?: string;
  actif?: boolean;
  est_dispo?: boolean | 0 | 1 | "0" | "1";
  search?: string;
};

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const normalizedParams = {
        ...filters,
        // Force a stable API payload to avoid boolean/string mismatches in query params.
        est_dispo:
          filters.est_dispo === undefined
            ? undefined
            : filters.est_dispo === true || filters.est_dispo === 1 || filters.est_dispo === "1"
              ? 1
              : 0,
      };

      const response = await api.get("/produits", { params: normalizedParams });
      return response.data.data as Product[];
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data as Category[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProduct: FormData) => api.post("/produits", newProduct, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updatedProduct }: { id: number; updatedProduct: FormData }) =>
      api.post(`/produits/${id}?_method=PUT`, updatedProduct, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/produits/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useProductImageActions = () => {
  const queryClient = useQueryClient();

  const uploadImage = useMutation({
    mutationFn: ({ produitId, imageFile, alt, ordre }: { produitId: number; imageFile: File; alt?: string; ordre?: number }) => {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (alt) formData.append("alt", alt);
      if (ordre !== undefined) formData.append("ordre", String(ordre));
      return api.post(`/produits/${produitId}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });

  const deleteImage = useMutation({
    mutationFn: (imageId: number) => api.delete(`/images/${imageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });

  const setMainImage = useMutation({
    mutationFn: ({ produitId, imageId }: { produitId: number; imageId: number }) =>
      api.patch(`/produits/${produitId}/images/${imageId}/set-main`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });

  return { uploadImage, deleteImage, setMainImage };
};

export const useProductAttributesActions = () => {
  const queryClient = useQueryClient();

  const syncAttributes = useMutation({
    mutationFn: ({ produitId, attributes }: { produitId: number; attributes: { cle_attr: string; valeur_attr: string; libelle_attr?: string }[] }) =>
      api.post(`/produits/${produitId}/attributes/sync`, attributes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });

  const getStandardKeys = useQuery({
    queryKey: ["standardAttributeKeys"],
    queryFn: async () => {
      const response = await api.get("/attributes/standard-keys");
      const data = response.data.data as Record<string, { label?: string }> | { cle_attr: string; libelle_attr: string }[];
      if (Array.isArray(data)) {
        return data;
      }
      return Object.entries(data).map(([cle_attr, payload]) => ({
        cle_attr,
        libelle_attr: payload?.label ?? cle_attr,
      }));
    },
  });

  return { syncAttributes, getStandardKeys };
};

export type CreateConfigurationPayload = {
  produit_id: number;
  nom_configuration: string;
  nom_configuration_autre?: string | null;
  devise?: string;
  composants_json: { nom?: string; prix?: number; quantite?: number }[];
};

export const useCreateConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateConfigurationPayload) =>
      api.post("/configurations", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};

export const useDeleteConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/configurations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};

export const useProduct = (id: number | null) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/produits/${id}`);
      return response.data.data as Product;
    },
    enabled: id !== null,
  });
};
