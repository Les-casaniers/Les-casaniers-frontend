// src/hooks/useBoutiqueMisa.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { useToast } from '@/hooks/use-toast';

export interface BoutiqueMisaItem {
  id: number;
  nom: string;
  description: string | null;
  stock: number;
  prix: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoutiqueMisaFilters {
  search?: string;
  stock_min?: number;
  prix_max?: number;
  per_page?: number;
}

// ============================================
// HOOKS PUBLICS (GET - Sans authentification)
// ============================================

/**
 * Récupère la liste des articles de la boutique Misa (PUBLIC)
 */
export const useBoutiqueMisa = (filters?: BoutiqueMisaFilters) => {
  return useQuery({
    queryKey: ['boutique-misa', filters],
    queryFn: async () => {
      // Limiter per_page à 100 maximum
      const safeFilters = { ...filters };
      if (safeFilters.per_page) {
        safeFilters.per_page = Math.min(safeFilters.per_page, 100);
      }
      
      // ✅ URL PUBLIQUE (sans /admin/)
      const { data } = await api.get('/boutique-misa', { params: safeFilters });
      return data;
    },
  });
};

/**
 * Récupère un article spécifique de la boutique Misa (PUBLIC)
 */
export const useBoutiqueMisaItem = (id: number) => {
  return useQuery({
    queryKey: ['boutique-misa', id],
    queryFn: async () => {
      // ✅ URL PUBLIQUE (sans /admin/)
      const { data } = await api.get(`/boutique-misa/${id}`);
      return data;
    },
    enabled: !!id, // Ne s'exécute que si l'ID est fourni
  });
};

// ============================================
// HOOKS ADMIN (POST, PUT, DELETE, PATCH - Avec authentification)
// ============================================

/**
 * Crée un nouvel article dans la boutique Misa (ADMIN)
 */
// export const useCreateBoutiqueMisa = () => {
//   const queryClient = useQueryClient();
//   const { toast } = useToast();

//   return useMutation({
//     mutationFn: async (formData: FormData) => {
//       // ✅ URL ADMIN (avec /admin/)
//       const { data } = await api.post('/admin/boutique-misa', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['boutique-misa'] });
//       toast({ title: 'Succès', description: 'Article ajouté avec succès' });
//     },
//     onError: (error: any) => {
//       toast({
//         title: 'Erreur',
//         description: error?.response?.data?.message || 'Impossible d\'ajouter l\'article',
//         variant: 'destructive',
//       });
//     },
//   });
// };

export const useCreateBoutiqueMisa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      // ✅ Vérifier le contenu du FormData
      console.log("📦 Mutation - FormData envoyé:");
      for (let pair of formData.entries()) {
        console.log("  ", pair[0], pair[1] instanceof File ? `[File: ${pair[1].name}]` : pair[1]);
      }
      
      const { data } = await api.post('/admin/boutique-misa', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boutique-misa'] });
      toast({ title: 'Succès', description: 'Article ajouté avec succès' });
    },
    onError: (error: any) => {
      console.error("❌ Mutation - Erreur:", error.response?.data);
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible d\'ajouter l\'article',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Met à jour un article existant dans la boutique Misa (ADMIN)
 */
export const useUpdateBoutiqueMisa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      // ✅ URL ADMIN (avec /admin/)
      const { data } = await api.post(`/admin/boutique-misa/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { _method: 'PUT' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boutique-misa'] });
      toast({ title: 'Succès', description: 'Article modifié avec succès' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de modifier l\'article',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Supprime un article de la boutique Misa (ADMIN)
 */
export const useDeleteBoutiqueMisa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      // ✅ URL ADMIN (avec /admin/)
      await api.delete(`/admin/boutique-misa/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boutique-misa'] });
      toast({ title: 'Succès', description: 'Article supprimé avec succès' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de supprimer l\'article',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Met à jour le stock d'un article de la boutique Misa (ADMIN)
 */
export const useUpdateBoutiqueMisaStock = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, stock }: { id: number; stock: number }) => {
      // ✅ URL ADMIN (avec /admin/)
      const { data } = await api.patch(`/admin/boutique-misa/${id}/stock`, { stock });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boutique-misa'] });
      toast({ title: 'Succès', description: 'Stock mis à jour' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de mettre à jour le stock',
        variant: 'destructive',
      });
    },
  });
};