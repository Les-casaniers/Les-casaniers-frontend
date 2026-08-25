import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SubCategory {
  name: string;
  href: string;
}

interface MainCategory {
  id: string;
  name: string;
  href: string;
  subcategories: SubCategory[];
}

const categoriesData: MainCategory[] = [
  {
    id: 'ordinateurs',
    name: 'ORDINATEURS & TABLETTES',
    href: '/categories/ordinateurs-tablettes',
    subcategories: [
      { name: 'PC FIXES', href: '/categories/pc-fixes' },
      { name: 'MINI PC', href: '/categories/mini-pc' },
      { name: 'PC PORTABLES', href: '/categories/pc-portables' },
      { name: 'ACCESSOIRES', href: '/categories/accessoires-pc' },
    ],
  },
  {
    id: 'composants',
    name: 'COMPOSANTS',
    href: '/categories/composants',
    subcategories: [
      { name: 'PROCESSEURS (CPU)', href: '/categories/cpu' },
      { name: 'CARTES GRAPHIQUES', href: '/categories/gpu' },
      { name: 'MÉMOIRE RAM', href: '/categories/ram' },
      { name: 'CARTES MÈRES', href: '/categories/cartes-meres' },
      { name: 'STOCKAGE SSD / HDD', href: '/categories/stockage' },
      { name: 'BOÎTIERS & ALIMENTATIONS', href: '/categories/boitiers-alims' },
    ],
  },
  {
    id: 'peripheriques',
    name: 'PÉRIPHÉRIQUES',
    href: '/categories/peripheriques',
    subcategories: [
      { name: 'CLAVIERS', href: '/categories/claviers' },
      { name: 'SOURIS', href: '/categories/souris' },
      { name: 'CASQUES & MICROPHONES', href: '/categories/casques' },
      { name: 'ÉCRANS', href: '/categories/ecrans' },
    ],
  },
  {
    id: 'mobilier',
    name: 'MOBILIER GAMING',
    href: '/categories/mobilier-gaming',
    subcategories: [
      { name: 'CHAISES GAMING', href: '/categories/chaises-gaming' },
      { name: 'BUREAUX GAMING', href: '/categories/bureaux-gaming' },
    ],
  },
  {
    id: 'reseau',
    name: 'RÉSEAU',
    href: '/categories/reseau',
    subcategories: [
      { name: 'ROUTEURS & SWITCHES', href: '/categories/routeurs' },
      { name: 'CÂBLES & ADAPTATEURS', href: '/categories/cables-reseau' },
    ],
  },
  {
    id: 'connectiques',
    name: 'CONNECTIQUES',
    href: '/categories/connectiques',
    subcategories: [
      { name: 'ADAPTATEURS & HUBS', href: '/categories/hubs' },
      { name: 'CÂBLES VIDÉO', href: '/categories/cables-video' },
    ],
  },
  {
    id: 'video-son',
    name: 'VIDÉO & SON',
    href: '/categories/video-son',
    subcategories: [
      { name: 'ENCEINTES & BARRES DE SON', href: '/categories/enceintes' },
      { name: 'WEBCAMS & STREAMING', href: '/categories/streaming' },
    ],
  },
  {
    id: 'divers',
    name: 'DIVERS',
    href: '/categories/divers',
    subcategories: [
      { name: 'GOODIES & ACCESSOIRES', href: '/categories/goodies' },
    ],
  },
];

export const CategoriesMegaMenu: React.FC = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categoriesData[0].id);

  const activeCategory = categoriesData.find((cat) => cat.id === activeCategoryId) || categoriesData[0];

  return (
    <div className="w-[850px] bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 text-white">
      {/* Colonne de gauche : Catégories principales */}
      <div className="md:col-span-4 bg-neutral-900 py-2 border-r border-neutral-800 space-y-0.5">
        {categoriesData.map((category) => {
          const isActive = category.id === activeCategoryId;
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
              <span className="truncate">{category.name}</span>
              <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'opacity-100 text-white' : 'opacity-30'}`} />
            </button>
          );
        })}
      </div>

      {/* Colonne de droite : Grille des sous-catégories */}
      <div className="md:col-span-8 p-6 bg-neutral-900 flex flex-col justify-between">
        <div>
          <div className="pb-3 mb-6 border-b border-neutral-800">
            <h3 className="font-extrabold text-sm tracking-wider uppercase text-white">
              {activeCategory.name}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
            {activeCategory.subcategories.map((sub) => (
              <Link
                key={sub.name}
                to={sub.href}
                className="group block text-xs font-bold tracking-wider uppercase text-neutral-300 hover:text-white transition-colors"
              >
                <span>{sub.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};