import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface CookieConsentBannerProps {
  onAccept?: () => void;
  onRefuse?: () => void;
}

export const CookieConsentBanner = ({ onAccept, onRefuse }: CookieConsentBannerProps) => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const consentGiven = localStorage.getItem('cookie_consent');
    const consentTimestamp = localStorage.getItem('cookie_consent_timestamp');
    
    // Si pas de consentement OU si le consentement date de plus de 12 mois
    if (!consentGiven) {
      setVisible(true);
    } else if (consentTimestamp) {
      const twelveMonths = 12 * 30 * 24 * 60 * 60 * 1000;
      const isExpired = Date.now() - parseInt(consentTimestamp) > twelveMonths;
      if (isExpired) {
        localStorage.removeItem('cookie_consent');
        localStorage.removeItem('cookie_consent_timestamp');
        setVisible(true);
      }
    }
  }, []);

  const handleChoice = async (choix: 'accepter' | 'refuser') => {
  // Sauvegarder le choix dans localStorage
  localStorage.setItem('cookie_consent', choix);
  localStorage.setItem('cookie_consent_timestamp', Date.now().toString());
  
  // URL CORRIGÉE - correspond à votre route Laravel
  const API_URL = 'http://localhost:8000'; // Port de votre Laravel
  
  try {
    const response = await fetch(`${API_URL}/api/cookies/consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        choix: choix,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      console.warn('Erreur serveur:', response.status);
    } else {
      console.log('Consentement enregistré avec succès');
    }
  } catch (error) {
    console.warn('Erreur lors de l\'enregistrement du consentement', error);
  }
  
  // Appliquer les règles de cookies
  if (choix === 'accepter') {
    enableTrackingCookies();
    if (onAccept) onAccept();
  } else {
    disableTrackingCookies();
    if (onRefuse) onRefuse();
  }
  
  // Masquer le banner
  setVisible(false);
};

  const enableTrackingCookies = () => {
    // Exemple pour Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
    }
    
    // Activer d'autres scripts de tracking
    const trackingScripts = document.querySelectorAll('[data-cookie-type="tracking"]');
    trackingScripts.forEach(script => {
      const newScript = document.createElement('script');
      const scriptAttributes = script.attributes;
      for (let i = 0; i < scriptAttributes.length; i++) {
        if (scriptAttributes[i].name !== 'data-cookie-type') {
          newScript.setAttribute(scriptAttributes[i].name, scriptAttributes[i].value);
        }
      }
      newScript.src = script.getAttribute('src') || '';
      document.body.appendChild(newScript);
    });
  };

  const disableTrackingCookies = () => {
    // Désactiver les cookies de tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
    
    // Supprimer les cookies existants (optionnel)
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      if (name.trim().startsWith('_ga') || name.trim().startsWith('_gid')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-full duration-300">
      {/* Overlay semi-transparent */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Banner principal */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 border-t-4 border-amber-500 shadow-2xl">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Contenu avec mascotte Fosa */}
            <div className="flex-1 flex items-start gap-4">
              {/* Icône Fosa */}
              <div className="hidden sm:block text-5xl animate-bounce-slow">
                
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl"></span>
                  <h3 className="text-white font-semibold text-lg">
                    Le Fosa veille sur vos données
                  </h3>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed">
                  Chez Les Casaniers, votre vie privée est aussi précieuse que votre configuration PC. 
                  Nous utilisons quelques cookies pour sécuriser votre panier, améliorer votre expérience 
                  et vous proposer des conseils personnalisés. Vous gardez le contrôle.
                </p>
                
                {/* Liens vers politiques */}
                <div className="flex flex-wrap gap-4 mt-3 text-xs">
                  <Link 
                    to="/confidentialite" 
                    className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                    onClick={() => setVisible(false)}
                  >
                     Politique de Confidentialité
                  </Link>
                  <Link 
                    to="/cgv" 
                    className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                    onClick={() => setVisible(false)}
                  >
                     Conditions Générales de Vente
                  </Link>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showDetails ? 'Masquer les détails' : '🍪 En savoir plus sur les cookies'}
                  </button>
                </div>
                
                {/* Détails des cookies */}
                {showDetails && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded-lg text-xs text-gray-400 space-y-2">
                    <p><strong className="text-white">Cookies essentiels :</strong> Authentification, panier, paiement - Toujours actifs</p>
                    <p><strong className="text-white">Cookies de performance :</strong> Analyse d'audience, performance du site - Optionnels</p>
                    <p><strong className="text-white">Cookies fonctionnels :</strong> Préférences, historique de navigation - Optionnels</p>
                    <p><strong className="text-white">Cookies marketing :</strong> Publicités personnalisées, recommandations - Optionnels</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={() => handleChoice('refuser')}
                className="px-6 py-2.5 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                 Refuser
              </button>
              <button
                onClick={() => handleChoice('accepter')}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                 Accepter
              </button>
            </div>
          </div>
        </div>
        
        {/* Bouton fermeture */}
        <button
          onClick={() => handleChoice('refuser')}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// Déclaration des types globaux pour TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}