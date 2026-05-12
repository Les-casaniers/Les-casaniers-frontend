

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { login, isAdmin } = useAuth();
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
        navigate(result.isAdmin ? "/DashboardAdmin" : "/DashboardClient");
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
      <section className="py-16">
        <div className="container-x">
          <div className="max-w-md mx-auto">
            {/* En-tête */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-foreground/10 rounded-full mb-4">
                <LogIn className="h-6 w-6 text-foreground" />
              </div>
              <h1 className="text-3xl font-bold">Connexion</h1>
              <p className="text-muted-foreground">Connectez-vous à votre compte</p>
            </div>

            {/* Message d'erreur général */}
            {generalError && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${sessionExpired ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400' : 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400'}`}>
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{generalError}</p>
              </div>
            )}

            {/* Formulaire */}
            <div className="border border-border rounded-xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-3 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 transition ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-foreground/20 focus:border-foreground'}`}
                      placeholder="exemple@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-10 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 transition ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-foreground/20 focus:border-foreground'}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Mot de passe oublié */}
                {!isAdmin && (
                  <div className="flex justify-end">
                    <Link to="/mot-de-passe-oublie" className="text-xs text-muted-foreground hover:text-foreground transition">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                )}

                {/* Bouton de connexion MODIFIÉ */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-foreground text-background font-semibold rounded-lg hover:bg-foreground/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      <span>Connexion en cours...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Se connecter</span>
                      <LogIn className="h-4 w-4" />
                    </span>
                  )}
                </button>
              </form>

              {/* Lien inscription */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Pas encore de compte ?{" "}
                  <Link to="/inscription" className="text-foreground font-medium hover:underline">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Login;