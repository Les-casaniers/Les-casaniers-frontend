// Champs de la ligne produit du catalogue (maquette), stockés comme colonnes de la table `produits`.
// Partagés entre l'admin (saisie) et la page Catalogue (affichage / filtres).

/** Specs affichées sur la ligne produit du catalogue, dans l'ordre de la maquette. */
export const CATALOG_SPEC_FIELDS = [
  { key: "processeur", label: "Processeur", placeholder: "Ex: Ryzen 7 170" },
  { key: "ssd", label: "SSD", placeholder: "Ex: 512 Go" },
  { key: "os", label: "OS", placeholder: "Ex: Windows 11" },
  { key: "gpu", label: "GPU", placeholder: "Ex: RTX 5060" },
  { key: "resolution", label: "Résolution", placeholder: "Ex: FHD 1920x1080" },
  { key: "ram", label: "RAM", placeholder: "Ex: 16 Go" },
  { key: "taille", label: "Taille", placeholder: 'Ex: 15.6"' },
] as const;

export type CatalogSpecKey = (typeof CATALOG_SPEC_FIELDS)[number]["key"];

/** Filtres rapides "Gamer | Bureautique | Multimédia | Créateur" (colonne `usages`). */
export const USAGE_OPTIONS = ["Gamer", "Bureautique", "Multimédia", "Créateur"] as const;

export const normalizeText = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** "Gamer, Créateur" → ["Gamer", "Créateur"] */
export const parseUsages = (value?: string | null) =>
  (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

/** Ancien stockage en caractéristiques : ces noms sont désormais des colonnes du produit. */
const LEGACY_CARACT_NAMES = ["EAN", "Usage", ...CATALOG_SPEC_FIELDS.map((f) => f.label)];

export const isCatalogColumnName = (nom: string) =>
  LEGACY_CARACT_NAMES.some((f) => normalizeText(f) === normalizeText(nom));
