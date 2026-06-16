// types/index.ts
export interface Utilisateur {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  statut: boolean;
  date_creation: string;
  date_modification: string;
  adresses?: AdresseUtilisateur[];
}

export interface AdresseUtilisateur {
  id: number;
  utilisateur_id: number;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  par_defaut_expedition: boolean;
  par_defaut_facturation: boolean;
  date_creation: string;
  date_modification: string;
}

export interface CreateUtilisateurData {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  mot_de_passe: string;
  statut?: boolean;
}

export interface UpdateUtilisateurData {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  mot_de_passe?: string;
  statut?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}