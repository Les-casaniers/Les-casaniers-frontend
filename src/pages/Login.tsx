


// Login.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Shield, User } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/contexts/AuthContext";

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
      {/* min-h adapté pour ne pas casser le header/footer sur mobile */}
      <section className="relative min-h-[calc(100vh-160px)] sm:min-h-[calc(100vh-200px)] flex items-start bg-black overflow-hidden pt-6 sm:pt-10">
        <div className="relative z-10 w-full container-x py-4 md:py-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* Section Gauche */}
            <div className="space-y-3 sm:space-y-4 pl-2 sm:pl-4 md:pl-8 lg:pl-0 -ml-1 sm:-ml-2 lg:-ml-4 pr-2 sm:pr-4 lg:pr-0">
              <h1
                className="whitespace-nowrap text-2xl sm:text-3xl md:text-4xl lg:text-[42px] leading-[1.2] sm:leading-[1.25] lg:leading-[52px]"
                style={{
                  fontStyle: 'italic',
                  fontWeight: 'normal',
                  fontFamily: '"Glacial Indifference", system-ui, sans-serif',
                  color: '#FFFFFF',
                  textAlign: 'left',
                  letterSpacing: '0.04em',
                }}
              >
                Bienvenue dans ton espace.
              </h1>
              <p
                className="text-sm sm:text-base lg:text-[16px] leading-relaxed lg:leading-[26px]"
                style={{
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  fontFamily: '"Glacial Indifference", system-ui, sans-serif',
                  color: '#FFFFFF',
                  textAlign: 'left',
                  letterSpacing: '0.02em',
                  opacity: 0.7,
                }}
              >
                Gère tes commandes, suis tes réparations et accède <br className="hidden sm:block" />
                facilement à tes données.
              </p>
            </div>

            {/* Section Droite - Formulaire */}
            <div className="border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 bg-black/40 backdrop-blur-sm">
              <h2 className="text-center text-white text-base sm:text-lg font-semibold mb-6 sm:mb-8 tracking-wide">
                Connexion
              </h2>

              {(isAdmin || isLivreur) && (
                <div className="flex justify-center mb-5 sm:mb-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border ${
                    isAdmin ? 'border-white/30 bg-white/5' : 'border-white/20 bg-white/5'
                  }`}>
                    {isAdmin ? (
                      <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    )}
                    <span className="text-[10px] sm:text-xs font-medium text-white uppercase tracking-wider">
                      {isAdmin ? 'Espace Administrateur' : 'Espace Livreur'}
                    </span>
                  </div>
                </div>
              )}

              {generalError && (
                <div className={`mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl flex items-start gap-3 border ${
                  sessionExpired
                    ? 'border-amber-500/30 bg-amber-500/5 text-amber-200'
                    : 'border-red-500/30 bg-red-500/5 text-red-200'
                }`}>
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium">{generalError}</p>
                    {sessionExpired && (
                      <p className="text-[10px] sm:text-xs mt-1 opacity-80">Veuillez vous reconnecter pour continuer</p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm text-white/60 mb-1.5 sm:mb-2 font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Obligatoire"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent text-white text-sm placeholder:text-white/40 border rounded-lg sm:rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.email
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/20 focus:border-white/40'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 sm:mt-2 text-xs text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm text-white/60 mb-1.5 sm:mb-2 font-medium">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••••"
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent text-white text-sm placeholder:text-white/40 border rounded-lg sm:rounded-xl focus:outline-none transition-all duration-200 pr-10 sm:pr-12 ${
                        errors.password
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-white/20 focus:border-white/40'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-white/40 hover:text-white/70 transition-colors" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-white/40 hover:text-white/70 transition-colors" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 sm:mt-2">
                    {errors.password ? (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.password}
                      </p>
                    ) : (
                      <div />
                    )}
                    {!isAdmin && !isLivreur && (
                      <Link
                        to="/mot-de-passe-oublie"
                        className="text-xs text-white/50 hover:text-white/80 transition-colors duration-200"
                      >
                        Mot de passe oublié ?
                      </Link>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-3.5 bg-white text-black font-semibold text-sm rounded-full hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-5 sm:mt-6 shadow-lg shadow-white/10"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Je me connecte</span>
                    </>
                  )}
                </button>
              </form>

              {!isAdmin && !isLivreur && (
                <div className="mt-6 sm:mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-4 bg-black text-white/50 italic">ou</span>
                    </div>
                  </div>
                  
                  <div className="text-center mt-5 sm:mt-6 space-y-3">
                    <p className="text-sm text-white/50 italic">Pas encore de compte ?</p>
                    <Link
                      to="/inscription"
                      className="inline-flex w-full items-center justify-center py-2.5 sm:py-3 border border-white/30 text-white font-medium text-sm rounded-full hover:bg-white/5 hover:border-white/50 transition-all duration-200"
                    >
                      Créer ton compte
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Login;