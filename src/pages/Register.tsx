import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Cpu,
  Wrench,
  Package,
  Award,
  Sparkles
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import api from "@/service/api";
import logo from "@/assets/casaniers-logo.png";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "", // Nom
    lastname: "", // Prénom
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("newsletterEmail");
    if (savedEmail && savedEmail.trim() !== "") {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setInfoMessage(
        "Complétez votre inscription pour recevoir notre newsletter !",
      );
      sessionStorage.removeItem("newsletterEmail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.name) {
      newErrors.name = "Le nom est requis";
      isValid = false;
    }
    if (!formData.lastname) {
      newErrors.lastname = "Le prénom est requis";
      isValid = false;
    }
    if (!formData.email) {
      newErrors.email = "L'email est requis";
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
      isValid = false;
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation est requise";
      isValid = false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }
    if (
      formData.password &&
      !/(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/.test(formData.password)
    ) {
      newErrors.password =
        "Le mot de passe doit contenir 8 caracteres minimum, 1 majuscule, 1 chiffre et 1 symbole";
      isValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      isValid = false;
    }

    if (isMountedRef.current) {
      setErrors(newErrors);
    }
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) setGeneralError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError("");
    if (isMountedRef.current) {
      setShowSuccess(false);
    }

    try {
      const response = await api.post("/utilisateurs/register", {
        prenom: formData.lastname,
        nom: formData.name,
        email: formData.email,
        mot_de_passe: formData.password,
        mot_de_passe_confirmation: formData.confirmPassword,
      });

      if (response.data.success) {
        if (isMountedRef.current) {
          setErrors({
            name: "",
            lastname: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          setGeneralError("");
          setShowSuccess(true);
          setFormData({
            name: "",
            lastname: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          redirectTimeoutRef.current = window.setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } else {
        if (isMountedRef.current) {
          setGeneralError(
            response.data.message || "Erreur lors de l'inscription",
          );
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const responseData = error.response?.data;

      if (responseData?.errors) {
        const backendErrors = responseData.errors;
        const newErrors: Record<string, string> = {};
        if (backendErrors.nom) newErrors.name = backendErrors.nom[0];
        if (backendErrors.prenom) newErrors.lastname = backendErrors.prenom[0];
        if (backendErrors.email) newErrors.email = backendErrors.email[0];
        if (backendErrors.mot_de_passe)
          newErrors.password = backendErrors.mot_de_passe[0];
        if (backendErrors.mot_de_passe_confirmation)
          newErrors.confirmPassword =
            backendErrors.mot_de_passe_confirmation[0];
        if (isMountedRef.current) {
          setErrors(newErrors);
        }
      }

      if (isMountedRef.current) {
        setGeneralError(
          responseData?.message ||
            "Erreur lors de l'inscription. Veuillez réessayer.",
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
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
              {/* Logo et titre */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center shadow-2xl overflow-hidden">
                    <img 
                      src={logo} 
                      alt="Les Casaniers" 
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
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
                  Rejoignez la communauté
                </h2>
                <p className="text-white/70 text-base max-w-md">
                  Créez votre compte pour accéder à vos commandes, suivre vos réparations et configurer vos PC sur-mesure.
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
                {/* En-tête du formulaire */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground">Inscription</h3>
                  <p className="text-sm text-muted-foreground">Créez votre compte gratuitement</p>
                </div>

                {/* Message de succès */}
                {showSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    <p className="text-sm text-center">
                      ✅ Inscription réussie ! Redirection vers la connexion...
                    </p>
                  </div>
                )}

                {/* Message d'information */}
                {infoMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm">{infoMessage}</p>
                  </div>
                )}

                {/* Message d'erreur général */}
                {generalError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm">{generalError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nom */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-foreground/80">
                      Nom
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                        focusedField === 'name' ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        <User className="h-5 w-5" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`w-full pl-10 pr-3 py-2.5 bg-background/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          errors.name 
                            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                            : 'border-border/50 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
                        }`}
                        placeholder="Dupont"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Prénom */}
                  <div>
                    <label htmlFor="lastname" className="block text-sm font-medium mb-1.5 text-foreground/80">
                      Prénom
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                        focusedField === 'lastname' ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        <User className="h-5 w-5" />
                      </div>
                      <input
                        id="lastname"
                        name="lastname"
                        type="text"
                        value={formData.lastname}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('lastname')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`w-full pl-10 pr-3 py-2.5 bg-background/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          errors.lastname 
                            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                            : 'border-border/50 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
                        }`}
                        placeholder="Jean"
                      />
                    </div>
                    {errors.lastname && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.lastname}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground/80">
                      Adresse email
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-foreground' : 'text-muted-foreground'
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

                  {/* Mot de passe */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-foreground/80">
                      Mot de passe
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                        focusedField === 'password' ? 'text-foreground' : 'text-muted-foreground'
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

                  {/* Confirmation mot de passe */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5 text-foreground/80">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                        focusedField === 'confirmPassword' ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`w-full pl-10 pr-12 py-2.5 bg-background/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          errors.confirmPassword 
                            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                            : 'border-border/50 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center group/eye"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Bouton d'inscription */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-3 bg-gradient-to-r from-foreground to-foreground/80 text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-foreground/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group mt-2"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          <span>Création du compte...</span>
                        </>
                      ) : (
                        <>
                          <span>S'inscrire</span>
                          <UserPlus className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </>
                      )}
                    </span>
                    {!isLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    )}
                  </button>
                </form>

                {/* Séparateur */}
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-card/50 backdrop-blur-sm text-muted-foreground">
                      Déjà inscrit ?
                    </span>
                  </div>
                </div>

                {/* Lien connexion */}
                <div className="mt-4 text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-1.5 text-sm text-foreground font-medium hover:text-primary transition-colors duration-200 group"
                  >
                    <span>Se connecter</span>
                    <Sparkles className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform duration-300" />
                  </Link>
                </div>

                {/* Conditions */}
                <div className="mt-4 text-center">
                  <p className="text-[10px] text-muted-foreground">
                    En créant un compte, vous acceptez nos{" "}
                    <Link to="/conditions" className="hover:text-foreground transition-colors duration-200 hover:underline">
                      Conditions d'utilisation
                    </Link>{" "}
                    et notre{" "}
                    <Link to="/confidentialite" className="hover:text-foreground transition-colors duration-200 hover:underline">
                      Politique de confidentialité
                    </Link>
                  </p>
                </div>

                {/* Badge de sécurité */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Données sécurisées
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

      {/* Styles d'animation */}
      <style>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

export default Register;