// src/hooks/useBoutiqueMisa.ts

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import api from '@/service/api';
// import { useToast } from '@/hooks/use-toast';

// export interface BoutiqueMisaItem {
//   id: number;
//   nom: string;
//   description: string | null;
//   stock: number;
//   prix: number;
//   image_url: string | null; // Changé de 'image' à 'image_url'
//   created_at: string;
//   updated_at: string;
// }

// export interface BoutiqueMisaFilters {
//   search?: string;
//   stock_min?: number;
//   prix_max?: number;
//   per_page?: number;
// }

// // Plus besoin de getFullImageUrl car l'URL est déjà complète dans la base
// export const useBoutiqueMisa = (filters?: BoutiqueMisaFilters) => {
//   return useQuery({
//     queryKey: ['boutique-misa', filters],
//     queryFn: async () => {
//       // ✅ LIMITER LA VALEUR MAXIMUM DE per_page
//       const safeFilters = { ...filters };
//       if (safeFilters.per_page) {
//         // Limiter à 100 maximum (ou ce que vous voulez)
//         safeFilters.per_page = Math.min(safeFilters.per_page, 100);
//       }
      
//       const { data } = await api.get('/admin/boutique-misa', { params: safeFilters });
//       return data;
//     },
//   });
// };

// export const useCreateBoutiqueMisa = () => {
//   const queryClient = useQueryClient();
//   const { toast } = useToast();

//   return useMutation({
//     mutationFn: async (formData: FormData) => {
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

// export const useUpdateBoutiqueMisa = () => {
//   const queryClient = useQueryClient();
//   const { toast } = useToast();

//   return useMutation({
//     mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
//       const { data } = await api.post(`/admin/boutique-misa/${id}`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         params: { _method: 'PUT' },
//       });
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['boutique-misa'] });
//       toast({ title: 'Succès', description: 'Article modifié avec succès' });
//     },
//     onError: (error: any) => {
//       toast({
//         title: 'Erreur',
//         description: error?.response?.data?.message || 'Impossible de modifier l\'article',
//         variant: 'destructive',
//       });
//     },
//   });
// };

// export const useDeleteBoutiqueMisa = () => {
//   const queryClient = useQueryClient();
//   const { toast } = useToast();

//   return useMutation({
//     mutationFn: async (id: number) => {
//       await api.delete(`/admin/boutique-misa/${id}`);
//       return id;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['boutique-misa'] });
//       toast({ title: 'Succès', description: 'Article supprimé avec succès' });
//     },
//     onError: (error: any) => {
//       toast({
//         title: 'Erreur',
//         description: error?.response?.data?.message || 'Impossible de supprimer l\'article',
//         variant: 'destructive',
//       });
//     },
//   });
// };

// export const useUpdateBoutiqueMisaStock = () => {
//   const queryClient = useQueryClient();
//   const { toast } = useToast();

//   return useMutation({
//     mutationFn: async ({ id, stock }: { id: number; stock: number }) => {
//       const { data } = await api.patch(`/admin/boutique-misa/${id}/stock`, { stock });
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['boutique-misa'] });
//       toast({ title: 'Succès', description: 'Stock mis à jour' });
//     },
//     onError: (error: any) => {
//       toast({
//         title: 'Erreur',
//         description: error?.response?.data?.message || 'Impossible de mettre à jour le stock',
//         variant: 'destructive',
//       });
//     },
//   });
// };

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

export const useBoutiqueMisa = (filters?: BoutiqueMisaFilters) => {
  return useQuery({
    queryKey: ['boutique-misa', filters],
    queryFn: async () => {
      // Limiter per_page à 100 maximum
      const safeFilters = { ...filters };
      if (safeFilters.per_page) {
        safeFilters.per_page = Math.min(safeFilters.per_page, 100);
      }
      
      const { data } = await api.get('/admin/boutique-misa', { params: safeFilters });
      return data;
    },
  });
};

export const useCreateBoutiqueMisa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/admin/boutique-misa', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boutique-misa'] });
      toast({ title: 'Succès', description: 'Article ajouté avec succès' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible d\'ajouter l\'article',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBoutiqueMisa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
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

export const useDeleteBoutiqueMisa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
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

export const useUpdateBoutiqueMisaStock = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, stock }: { id: number; stock: number }) => {
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