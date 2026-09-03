// Register.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import api from "@/service/api";

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
      <section className="relative min-h-[calc(100vh-160px)] sm:min-h-[calc(100vh-200px)] flex items-start bg-black overflow-hidden pt-6 sm:pt-10">
        <div className="relative z-10 w-full container-x py-4 md:py-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

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
                Rejoins la communauté.
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
                <span className="block">Crée ton compte pour accéder à tes commandes,</span>
                <span className="block sm:whitespace-nowrap">suivre tes réparations et configurer ton PC sur-mesure.</span>
              </p>
            </div>

            {/* Section Droite - Formulaire */}
            <div className="border border-white/20 rounded-2xl p-8 md:p-10">
              <h2 className="text-center text-[15px] font-sans font-bold tracking-wide text-white mb-6">
                Inscription
              </h2>

              {showSuccess && (
                <div className="mb-4 p-3 rounded-xl border border-emerald-500/40 text-emerald-400">
                  <p className="text-sm font-sans text-center">
                    ✅ Inscription réussie ! Redirection vers la connexion...
                  </p>
                </div>
              )}

              {infoMessage && (
                <div className="mb-4 p-3 rounded-xl border border-blue-500/40 text-blue-400 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-sans">{infoMessage}</p>
                </div>
              )}

              {generalError && (
                <div className="mb-4 p-3 rounded-xl border border-red-500/40 text-red-400 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-sans">{generalError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nom */}
                <div>
                  <label htmlFor="name" className="block text-[13px] font-sans text-white/70 mb-1.5">
                    Nom
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Obligatoire"
                    className={`w-full px-4 py-2.5 bg-black text-white font-sans text-sm placeholder:text-white/40 placeholder:italic border rounded-lg focus:outline-none transition-colors duration-200 ${
                      errors.name
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-white/20 focus:border-white/60'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs font-sans text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Prénom */}
                <div>
                  <label htmlFor="lastname" className="block text-[13px] font-sans text-white/70 mb-1.5">
                    Prénom
                  </label>
                  <input
                    id="lastname"
                    name="lastname"
                    type="text"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                    placeholder="Obligatoire"
                    className={`w-full px-4 py-2.5 bg-black text-white font-sans text-sm placeholder:text-white/40 placeholder:italic border rounded-lg focus:outline-none transition-colors duration-200 ${
                      errors.lastname
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-white/20 focus:border-white/60'
                    }`}
                  />
                  {errors.lastname && (
                    <p className="mt-1.5 text-xs font-sans text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.lastname}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-[13px] font-sans text-white/70 mb-1.5">
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
                    className={`w-full px-4 py-2.5 bg-black text-white font-sans text-sm placeholder:text-white/40 placeholder:italic border rounded-lg focus:outline-none transition-colors duration-200 ${
                      errors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-white/20 focus:border-white/60'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-sans text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-[13px] font-sans text-white/70 mb-1.5">
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
                      className={`w-full px-4 pr-12 py-2.5 bg-black text-white font-sans text-sm placeholder:text-white/40 border rounded-lg focus:outline-none transition-colors duration-200 ${
                        errors.password
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/20 focus:border-white/60'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-white/50 hover:text-white transition-colors duration-200" />
                      ) : (
                        <Eye className="h-5 w-5 text-white/50 hover:text-white transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs font-sans text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-[13px] font-sans text-white/70 mb-1.5">
                    Confirme ton mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••••"
                      className={`w-full px-4 pr-12 py-2.5 bg-black text-white font-sans text-sm placeholder:text-white/40 border rounded-lg focus:outline-none transition-colors duration-200 ${
                        errors.confirmPassword
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/20 focus:border-white/60'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-white/50 hover:text-white transition-colors duration-200" />
                      ) : (
                        <Eye className="h-5 w-5 text-white/50 hover:text-white transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs font-sans text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Bouton Je m'inscris - Centré et compact comme sur la capture 090145 */}
                <div className="flex justify-center mt-3 sm:mt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-white text-black font-semibold text-xs sm:text-sm rounded-lg hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Création du compte...</span>
                      </>
                    ) : (
                      <span>Je m'inscris</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Section liens - Espacement resserré et bouton centré identique au modèle 090145 */}
              <div className="mt-2.5 sm:mt-3 text-center space-y-1.5 sm:space-y-2">
                <p className="text-[11px] sm:text-xs italic text-white/50">ou</p>
                <p className="text-xs sm:text-sm italic text-white/60">Tu as déjà un compte ?</p>
                <div className="flex justify-center pt-0.5">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-2 border border-white/30 text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-white/5 hover:border-white/50 transition-all duration-200"
                  >
                    Je me connecte
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Register;