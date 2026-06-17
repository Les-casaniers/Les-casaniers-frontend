import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/service/api";

export interface Category {
  id: number;
  nom: string;
  description?: string;
  image?: string;
}

export type SousCategoryWithProducts = SousCategory & {
  produits: Product[];
};

export type CategoryWithSubcategoriesAndProducts = Category & {
  sous_categories: SousCategoryWithProducts[];
};

export interface SousCategory {
  id: number;
  id_categorie: number;
  nom: string;
  categorie?: Category;
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
  atout?: string;
  prix: number;
  devise?: string | null;
  quantite_stock: number;
  est_dispo: boolean;
  categorie_id: number;
  id_sous_categorie?: number | null;
  actif: boolean;
  image_principale?: string | null;
  badge?: string | null;
  tagline?: string | null;
  note?: number | null;
  processeur?: string | null;
  carte_graphique?: string | null;
  ram?: string | null;
  disque_dur?: string | null;
  alimentation?: string | null;
  refroidissement?: string | null;
  carte_mere?: string | null;
  boitier?: string | null;
  date_creation?: string;
  date_modification?: string;
  images?: { id: number; url: string; alt: string; ordre?: number }[];
  attributs?: { cle_attr: string; valeur_attr: string; libelle_attr?: string }[];
  categorie?: Category;
  sous_categorie?: SousCategory;
  configurations?: ProductConfiguration[];
}

export type ProductFilters = {
  categorie_id?: number;
  id_sous_categorie?: number;
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
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
};

export const useSousCategories = () => {
  return useQuery({
    queryKey: ['sous-categories'],
    queryFn: async () => {
      const response = await api.get('/sous-categories');
      return response.data.data as SousCategory[];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
};

export const useCreateSousCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSousCategory: { id_categorie: number | string; nom: string }) => api.post("/sous-categories", newSousCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sous-categories"] });
    },
  });
};

export const useUpdateSousCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updatedData }: { id: number; updatedData: { id_categorie?: number | string; nom?: string } }) =>
      api.put(`/sous-categories/${id}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sous-categories"] });
    },
  });
};

export const useDeleteSousCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/sous-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sous-categories"] });
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

// ============================================================
// ⭐ HOOK OPTIMISÉ - SANS "TOO MANY REQUESTS" ⭐
// ============================================================
export const useProductsBySubcategory = (limit: number = 3) => {
  return useQuery({
    queryKey: ["products-by-subcategory", limit],
    queryFn: async () => {
      console.log("🔍 Chargement des données du menu...");
      
      // Étape 1: Récupérer toutes les catégories et sous-catégories (2 requêtes)
      const [categoriesResponse, sousCategoriesResponse] = await Promise.all([
        api.get('/categories'),
        api.get('/sous-categories')
      ]);
      
      const categories = categoriesResponse.data.data as Category[];
      const sousCategories = sousCategoriesResponse.data.data as SousCategory[];
      
      console.log(`📁 ${categories.length} catégories, 📂 ${sousCategories.length} sous-catégories`);
      
      // Étape 2: Récupérer TOUS les produits en UNE SEULE requête
      const productsResponse = await api.get('/produits', {
        params: {
          limit: 500
        }
      });
      
      const allProducts = (productsResponse.data.data ?? []) as Product[];
      console.log(`📦 ${allProducts.length} produits récupérés en une seule requête`);
      
      // Étape 3: Grouper les produits par sous-catégorie avec limite
      const productsBySousCat = allProducts.reduce<Record<number, Product[]>>(
        (acc, product) => {
          const scId = product.id_sous_categorie;
          if (!scId) return acc;
          if (!acc[scId]) acc[scId] = [];
          if (acc[scId].length < limit) acc[scId].push(product);
          return acc;
        },
        {}
      );
      
      console.log(`📊 ${Object.keys(productsBySousCat).length} sous-catégories ont des produits`);
      
      // Étape 4: Construire l'arborescence
      return categories.map((cat) => ({
        ...cat,
        sous_categories: sousCategories
          .filter((sc) => sc.id_categorie === cat.id)
          .map((sc) => ({
            ...sc,
            produits: productsBySousCat[sc.id] ?? [],
          })),
      })) as CategoryWithSubcategoriesAndProducts[];
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
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

export const productImage = (product: Pick<Product, "image_principale" | "images">) =>
  product.image_principale || product.images?.[0]?.url || "/placeholder-pc.jpg";

export const productAttribute = (product: Product, key: string) =>
  product.attributs?.find((attr) => attr.cle_attr === key)?.valeur_attr ?? null;

export const productSpec = (product: Product, key: keyof Product | string) => {
  const direct = product[key as keyof Product];
  if (typeof direct === "string" && direct.trim()) return direct;
  return productAttribute(product, String(key)) || undefined;
};