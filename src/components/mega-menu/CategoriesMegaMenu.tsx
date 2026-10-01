import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useCategories, useSousCategories } from '@/hooks/useProducts';

interface CategoriesMegaMenuProps {
  onNavigate?: () => void;
}

export const CategoriesMegaMenu: React.FC<CategoriesMegaMenuProps> = ({ onNavigate }) => {
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: sousCategories = [], isLoading: isLoadingSousCategories } = useSousCategories();
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const activeCategory =
    categories.find((cat) => cat.id === activeCategoryId) ?? categories[0] ?? null;
  const activeSousCategories = activeCategory
    ? sousCategories.filter((sc) => sc.id_categorie === activeCategory.id)
    : [];

  if (isLoadingCategories || isLoadingSousCategories) {
    return (
      <div className="w-[850px] bg-neutral-900 border border-neutral-800 shadow-2xl p-8 flex items-center justify-center gap-2 text-xs text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement des catégories…
      </div>
    );
  }

  if (!activeCategory) {
    return (
      <div className="w-[850px] bg-neutral-900 border border-neutral-800 shadow-2xl p-8 text-center text-xs text-neutral-400">
        Aucune catégorie disponible
      </div>
    );
  }

  return (
    <div className="w-[850px] bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 text-white">
      {/* Colonne de gauche : Catégories principales */}
      <div className="md:col-span-4 bg-neutral-900 py-2 border-r border-neutral-800 space-y-0.5">
        {categories.map((category) => {
          const isActive = category.id === activeCategory.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              onMouseEnter={() => setActiveCategoryId(category.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold tracking-wider transition-colors text-left uppercase ${
                isActive
                  ? 'bg-neutral-800 text-white'
                  : 'hover:bg-neutral-800/50 text-neutral-300'
              }`}
            >
              <span className="truncate">{category.nom}</span>
              <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'opacity-100 text-white' : 'opacity-30'}`} />
            </button>
          );
        })}
      </div>

      {/* Colonne de droite : Grille des sous-catégories */}
      <div className="md:col-span-8 p-6 bg-neutral-900 flex flex-col justify-between">
        <div>
          <div className="pb-3 mb-6 border-b border-neutral-800 flex items-center justify-between gap-4">
            <h3 className="font-extrabold text-sm tracking-wider uppercase text-white">
              {activeCategory.nom}
            </h3>
            <Link
              to={`/catalogue?categorie=${activeCategory.id}`}
              onClick={onNavigate}
              className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Tout voir
            </Link>
          </div>
          {activeSousCategories.length > 0 ? (
            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              {activeSousCategories.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/catalogue?categorie=${activeCategory.id}&sous_categorie=${sub.id}`}
                  onClick={onNavigate}
                  className="group block text-xs font-bold tracking-wider uppercase text-neutral-300 hover:text-white transition-colors"
                >
                  <span>{sub.nom}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic">
              Aucune sous-catégorie pour le moment
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
