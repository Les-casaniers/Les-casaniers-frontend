import { useQuery } from "@tanstack/react-query";
import api from "@/service/api";

export interface Category {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: number;
  nom: string;
  slug: string;
  description: string;
  prix: number;
  stock_disponible: number;
  categorie_id: number;
  type_produit: string;
  actif: boolean;
  image_principale?: string;
  images?: any[];
  attributs?: any[];
  categorie?: Category;
}

export const useProducts = (filters: any = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await api.get('/produits', { params: filters });
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

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await api.get(`/produits/${slug}`);
      return response.data.data as Product;
    },
    enabled: !!slug,
  });
};
