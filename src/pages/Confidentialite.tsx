import React from 'react';
import { Link } from 'react-router-dom';
import { FosaBot } from '@/components/layout/FosaBot';

const Confidentialite = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple (inspiré de votre design PDF) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <span className="text-3xl">🐱</span>
            <span>Les Casaniers</span>
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header avec mascotte */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4 animate-bounce-slow">🐱🔒</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-xl text-gray-600">
            Le Fosa garde un œil sur vos données (mais ne les mange pas)
          </p>
          <div className="w-24 h-1 bg-amber-500 mx-auto mt-4"></div>
        </div>

        <div className="space-y-8 text-gray-700">
          {/* Introduction */}
          <section className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-500">
            <p className="text-lg">
              Chez <strong>Les Casaniers</strong>, la protection de vos données personnelles 
              est aussi importante que la fiabilité de nos configurations PC. 
              Cette politique vous explique comment nous collectons, utilisons et protégeons 
              vos informations.
            </p>
          </section>

          {/* Collecte des données */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📋</span> Données collectées
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="mb-3">Nous collectons uniquement ce qui est nécessaire pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Traiter votre commande et la livrer à Madagascar</li>
                <li>✅ Sécuriser votre compte client (authentification, historique)</li>
                <li>✅ Améliorer votre expérience (configurateur, favoris, panier)</li>
                <li>✅ Répondre à vos questions et demandes de devis</li>
                <li>✅ Vous informer des nouveautés (avec votre consentement)</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>🍪</span> Gestion des cookies
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <p>Le site utilise différents types de cookies :</p>
              
              <div className="space-y-3">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Cookies essentiels</h3>
                  <p className="text-sm text-gray-600">Nécessaires au fonctionnement du site (panier, authentification, paiement). Toujours actifs.</p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Cookies de performance</h3>
                  <p className="text-sm text-gray-600">Analyse d'audience et performance du site. Optionnels.</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Cookies fonctionnels</h3>
                  <p className="text-sm text-gray-600">Préférences et historique de navigation. Optionnels.</p>
                </div>
                
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Cookies marketing</h3>
                  <p className="text-sm text-gray-600">Publicités personnalisées et recommandations. Optionnels.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Vos droits */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>⚖️</span> Vos droits
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>🔍 Droit d'accès à vos données</li>
                <li>✏️ Droit de rectification</li>
                <li>🗑️ Droit à l'effacement ("droit à l'oubli")</li>
                <li>⛔ Droit à la limitation du traitement</li>
                <li>📦 Droit à la portabilité des données</li>
              </ul>
            </div>
          </section>

          {/* Comment exercer vos droits */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📧</span> Comment exercer vos droits ?
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="mb-3">
                Pour exercer vos droits, vous pouvez nous contacter :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Par email : <a href="mailto:dpo@lescasaniers.mg" className="text-amber-600 hover:text-amber-700">dpo@lescasaniers.mg</a></li>
                <li>Par courrier : Les Casaniers - Service DPO - Tananarive, Madagascar</li>
                <li>Via votre espace client (section "Mes données personnelles")</li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">
                Nous nous engageons à vous répondre dans un délai maximum de 30 jours.
              </p>
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>🛡️</span> Sécurité de vos données
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p>
                Nous mettons en œuvre toutes les mesures techniques et organisationnelles nécessaires 
                pour protéger vos données contre tout accès non autorisé, modification, divulgation 
                ou destruction. Nos serveurs sont sécurisés et notre site utilise le chiffrement SSL/TLS.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🐱</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Une question ?</h2>
            <p className="mb-3">Le Fosa et son équipe sont là pour vous répondre :</p>
            <p className="font-medium">Email : <a href="mailto:contact@lescasaniers.mg" className="text-amber-600 hover:text-amber-700">contact@lescasaniers.mg</a></p>
            <p className="font-medium">Téléphone : <a href="tel:+261341234567" className="text-amber-600 hover:text-amber-700">+261 34 12 345 67</a></p>
            <p className="text-sm text-gray-500 mt-4">
              Dernière mise à jour : 20 avril 2026
            </p>
          </section>

          {/* Bouton retour */}
          <div className="text-center pt-4">
            <Link to="/" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>© 2026 Les Casaniers - Tous droits réservés</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/cgv" className="hover:text-amber-400 transition-colors">CGV</Link>
            <Link to="/confidentialite" className="hover:text-amber-400 transition-colors">Confidentialité</Link>
            <Link to="/nous-trouver" className="hover:text-amber-400 transition-colors">Nous trouver</Link>
          </div>
        </div>
      </footer>

      {/* Le FosaBot est déjà global dans votre App.tsx */}
      <FosaBot />
    </div>
  );
};

export default Confidentialite;