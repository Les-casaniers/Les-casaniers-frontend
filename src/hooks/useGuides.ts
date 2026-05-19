import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/service/api";

export const GUIDE_CATEGORIES = ["guides-achat", "actualites-tech", "tutos-maintenance"] as const;
export const GUIDE_STATUSES = ["publie", "brouillon", "archive"] as const;
export const GUIDE_DIFFICULTIES = ["debutant", "intermediaire", "avance"] as const;
export const GUIDE_BADGES = ["Nouveaute", "Test", "Sortie", "Tendance", "Promo", "Guide"] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];
export type GuideStatus = (typeof GUIDE_STATUSES)[number];
export type GuideDifficulty = (typeof GUIDE_DIFFICULTIES)[number];

export type Guide = {
  id: number;
  titre: string;
  slug?: string | null;
  resume: string;
  contenu: string;
  categorie: GuideCategory;
  statut: GuideStatus;
  badge?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  budget_range?: string | null;
  composants_recommandes?: string[] | null;
  niveau?: string | null;
  difficulte?: GuideDifficulty | null;
  duree?: string | null;
  etapes?: string[] | null;
  video_url?: string | null;
  tags?: string[] | null;
  ordre?: number;
  mis_en_avant?: boolean;
  image_url?: string | null;
  image_alt?: string | null;
  auteur?: string | null;
  temps_lecture?: string | null;
  popularite: number;
  vues: number;
  publie_le?: string | null;
  date_creation?: string;
  date_modification?: string;
};

export type GuideFilters = {
  search?: string;
  categorie?: GuideCategory | "";
  statut?: GuideStatus | "";
  sort?: "recent" | "popular";
  badge?: string;
  mis_en_avant?: boolean;
  page?: number;
  per_page?: number;
};

export type PaginatedGuides = {
  data: Guide[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
};

export const guideCategoryLabels: Record<GuideCategory, string> = {
  "guides-achat": "Guides d'achat",
  "actualites-tech": "Actualites Tech",
  "tutos-maintenance": "Tutos Maintenance",
};

export const guideStatusLabels: Record<GuideStatus, string> = {
  publie: "Publie",
  brouillon: "Brouillon",
  archive: "Archive",
};

export const guideDifficultyLabels: Record<GuideDifficulty, string> = {
  debutant: "Debutant",
  intermediaire: "Intermediaire",
  avance: "Avance",
};

export const guideDifficultyColors: Record<GuideDifficulty, string> = {
  debutant: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediaire: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  avance: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const cleanParams = (filters: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""));

/* ───────────── PUBLIC QUERIES ───────────── */

export const useGuides = (filters: GuideFilters = {}, admin = false) =>
  useQuery({
    queryKey: [admin ? "admin-guides" : "guides", filters],
    queryFn: async () => {
      const response = await api.get(admin ? "/admin/guides" : "/guides", { params: cleanParams(filters) });
      return response.data.data as PaginatedGuides;
    },
  });

export const useGuide = (id: string | undefined) =>
  useQuery({
    queryKey: ["guide", id],
    queryFn: async () => {
      const endpoint = /^\d+$/.test(String(id)) ? `/guides/${id}` : `/guides/slug/${id}`;
      const response = await api.get(endpoint);
      return response.data.data as Guide;
    },
    enabled: Boolean(id),
  });

export const useRecentGuides = (limit = 4) =>
  useQuery({
    queryKey: ["guides-recent", limit],
    queryFn: async () => {
      const response = await api.get("/guides/recent", { params: { limit } });
      return response.data.data as Guide[];
    },
  });

export const usePopularGuides = (limit = 4) =>
  useQuery({
    queryKey: ["guides-popular", limit],
    queryFn: async () => {
      const response = await api.get("/guides/popular", { params: { limit } });
      return response.data.data as Guide[];
    },
  });

export const useFeaturedGuides = (limit = 6) =>
  useQuery({
    queryKey: ["guides-featured", limit],
    queryFn: async () => {
      const response = await api.get("/guides/featured", { params: { limit } });
      return response.data.data as Guide[];
    },
  });

export const useGuidesByCategory = (categorie: GuideCategory, limit = 6) =>
  useQuery({
    queryKey: ["guides-category", categorie, limit],
    queryFn: async () => {
      const response = await api.get(`/guides/categorie/${categorie}`, { params: { limit } });
      return response.data.data as Guide[];
    },
  });

/* ───────────── ADMIN MUTATIONS ───────────── */

const guideQueryKeys = ["admin-guides", "guides", "guide", "guides-recent", "guides-popular", "guides-featured", "guides-category"];

export const useCreateGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => api.post("/admin/guides", payload, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => {
      guideQueryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
  });
};

export const useUpdateGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      api.post(`/admin/guides/${id}?_method=PUT`, payload, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => {
      guideQueryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
  });
};

export const useDeleteGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/admin/guides/${id}`),
    onSuccess: () => {
      guideQueryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
  });
};

/* ───────────── NEWSLETTER ───────────── */

export const useSubscribeNewsletter = () =>
  useMutation({
    mutationFn: (email: string) => api.post("/newsletter/subscribe", { email, website: "" }),
  });

export type NewsletterSubscriber = {
  id: number;
  email: string;
  actif: boolean;
  source: string;
  subscribed_at: string;
  unsubscribed_at?: string | null;
};

export const useNewsletterSubscribers = (
  filters: { search?: string; actif?: boolean | ""; page?: number; per_page?: number } = {},
) =>
  useQuery({
    queryKey: ["admin-newsletter", filters],
    queryFn: async () => {
      const response = await api.get("/admin/newsletter", { params: cleanParams(filters) });
      return response.data.data as {
        data: NewsletterSubscriber[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
    },
  });
