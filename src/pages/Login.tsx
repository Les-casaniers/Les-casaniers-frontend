// Login.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Shield, User, Sparkles,
  Cpu, Wrench, Package, Award
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/casaniers-logo.png";

const Login = () => {
  const { login, isAdmin, isLivreur } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const navigate = useNavigate();
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_expired') === 'true') {
      setSessionExpired(true);
      setGeneralError("Votre session a expiré. Veuillez vous reconnecter.");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (generalError) setGeneralError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({ email: "", password: "" });

    if (!formData.email || !formData.password) {
      setGeneralError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);

      setIsLoading(false);

      if (result.success) {
        if (result.isAdmin) {
          navigate("/DashboardAdmin");
        } else if (result.isLivreur) {
          navigate("/DashboardLivreur");
        } else {
          navigate("/DashboardClient");
        }
      } else {
        if (result.errors) {
          const emailError = result.errors.email
            ? Array.isArray(result.errors.email)
              ? result.errors.email[0]
              : result.errors.email
            : "";
          const passwordError = result.errors.password || result.errors.mot_de_passe
            ? Array.isArray(result.errors.password || result.errors.mot_de_passe)
              ? (result.errors.password || result.errors.mot_de_passe)[0]
              : (result.errors.password || result.errors.mot_de_passe)
            : "";

          setErrors({
            email: typeof emailError === "string" ? emailError : JSON.stringify(emailError),
            password: typeof passwordError === "string" ? passwordError : JSON.stringify(passwordError),
          });
        }
        setGeneralError(result.message || "Email ou mot de passe incorrect");
      }
    } catch (error) {
      console.error("Critical login submission error:", error);
      setIsLoading(false);
      setGeneralError("Une erreur inattendue est survenue. Veuillez réessayer.");
    }
  };

  return (
    <SiteLayout>
      <section className="relative min-h-[calc(100vh-200px)] flex items-center border-b border-border overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ 
            backgroundColor: '#0a0a0f'
          }}
        />
        
        {/* Dégradé multi-couche */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />
        
        {/* Teinte bleutée/techno */}
        <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
        
        {/* Animation du fond (cercles rotatifs) */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,transparent_70%)] animate-spin-slow" />
          <div className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] bg-[radial-gradient(circle,rgba(139,92,246,0.04)_0%,transparent_70%)] animate-spin-slow-reverse" />
        </div>

        <div className="relative z-10 w-full container-x py-12 md:py-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Section Gauche - Contenu informatif */}
            <div className="space-y-8 animate-fade-up">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center shadow-2xl overflow-hidden">
                    {logo ? (
                      <img 
                        src={logo} 
                        alt="Les Casaniers" 
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary-foreground">LC</span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      Les Casaniers
                    </h1>
                    <p className="text-white/60 text-sm">
                      PC sur-mesure & réparation
                    </p>
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Votre espace professionnel
                </h2>
                <p className="text-white/70 text-base max-w-md">
                  Gérez vos commandes, suivez vos réparations et accédez à vos configurations sur-mesure.
                </p>
              </div>

              {/* Caractéristiques */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors duration-300">
                    <Cpu className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">PC sur-mesure</p>
                    <p className="text-xs text-white/60">Configurations 100% personnalisées</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors duration-300">
                    <Wrench className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Réparation & SAV</p>
                    <p className="text-xs text-white/60">Service réactif et humain</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors duration-300">
                    <Package className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Importation directe</p>
                    <p className="text-xs text-white/60">Composants premium d'Europe</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <div className="p-2 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors duration-300">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Garantie 24 mois</p>
                    <p className="text-xs text-white/60">Sur toutes nos configurations</p>
                  </div>
                </div>
              </div>

              {/* Badges de confiance */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span>500+ PC livrés</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span>4.9/5 Avis clients</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span>Showroom à Tananarive</span>
                </div>
              </div>
            </div>

            {/* Section Droite - Formulaire */}
            <div className="animate-fade-up delay-1">
              <div className="bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground">Connexion</h3>
                  <p className="text-sm text-muted-foreground">Accédez à votre compte client</p>
                </div>

                {(isAdmin || isLivreur) && (
                  <div className="flex justify-center mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                      isAdmin 
                        ? 'bg-primary/10 border-primary/20' 
                        : 'bg-secondary/10 border-secondary/20'
                    }`}>
                      {isAdmin ? (
                        <Shield className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4 text-secondary" />
                      )}
                      <span className={`text-xs font-medium ${
                        isAdmin ? 'text-primary' : 'text-secondary'
                      }`}>
                        {isAdmin ? 'Espace Administrateur' : 'Espace Livreur'}
                      </span>
                    </div>
                  </div>
                )}

                {generalError && (
                  <div className={`mb-4 p-3 rounded-xl flex items-start gap-3 border backdrop-blur-sm ${
                    sessionExpired 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                      : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                  }`}>
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{generalError}</p>
                      {sessionExpired && (
                        <p className="text-xs mt-1 opacity-80">Veuillez vous reconnecter pour continuer</p>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground/80">
                      Adresse email
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`w-full pl-10 pr-3 py-2.5 bg-background/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          errors.email 
                            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                            : 'border-border/50 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
                        }`}
                        placeholder="exemple@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
                        Mot de passe
                      </label>
                      {!isAdmin && !isLivreur && (
                        <Link 
                          to="/mot-de-passe-oublie" 
                          className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 hover:underline"
                        >
                          Mot de passe oublié ?
                        </Link>
                      )}
                    </div>
                    <div className="relative group">
                      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                        focusedField === 'password' ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`w-full pl-10 pr-12 py-2.5 bg-background/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          errors.password 
                            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                            : 'border-border/50 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center group/eye"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-3 bg-gradient-to-r from-foreground to-foreground/80 text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-foreground/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group mt-2"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          <span>Connexion en cours...</span>
                        </>
                      ) : (
                        <>
                          <span>Se connecter</span>
                          <LogIn className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </>
                      )}
                    </span>
                    {!isLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    )}
                  </button>
                </form>

                {!isAdmin && !isLivreur && (
                  <>
                    <div className="relative mt-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/50" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-4 bg-card/50 backdrop-blur-sm text-muted-foreground">
                          Nouveau client ?
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <Link 
                        to="/inscription" 
                        className="inline-flex items-center gap-1.5 text-sm text-foreground font-medium hover:text-primary transition-colors duration-200 group"
                      >
                        <span>Créer un compte</span>
                        <Sparkles className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform duration-300" />
                      </Link>
                    </div>
                  </>
                )}

                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Connexion sécurisée
                    </span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <span className="text-[10px] text-muted-foreground">
                    SSL 256-bit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        
        .animate-fade-up {
          animation: fade-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .delay-1 {
          animation-delay: 0.2s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out both;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 15s linear infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </SiteLayout>
  );
};

export default Login;