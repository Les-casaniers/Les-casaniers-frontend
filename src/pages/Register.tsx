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
} from "lucide-react";
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
  const [infoMessage, setInfoMessage] = useState(""); //infos newsletter
  const redirectTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const navigate = useNavigate();

  // MODIFIÉ : useEffect avec infoMessage et scroll
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("newsletterEmail");
    if (savedEmail && savedEmail.trim() !== "") {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setInfoMessage(
        "Complétez votre inscription pour recevoir notre newsletter !",
      );
      sessionStorage.removeItem("newsletterEmail");

      // Défiler vers le haut
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
        // Map backend errors to form fields
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
      <section className="py-16">
        <div className="container-x">
          <div className="max-w-md mx-auto">
            {/* En-tête */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-foreground/10 rounded-full mb-4">
                <UserPlus className="h-6 w-6 text-foreground" />
              </div>
              <h1 className="text-3xl font-bold">Inscription</h1>
              <p className="text-muted-foreground">
                Créez votre compte gratuitement
              </p>
            </div>

            {/* Message de succès */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-xl">
                <p className="text-sm text-green-600 dark:text-green-400 text-center">
                  ✅ Inscription réussie ! Redirection vers la connexion...
                </p>
              </div>
            )}

            {/* NOUVEAU : Message d'information en vert */}
            {infoMessage && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  {infoMessage}
                </p>
              </div>
            )}

            {/* Message d'erreur */}
            {generalError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {generalError}
                </p>
              </div>
            )}

            {/* Formulaire */}
            <div className="border border-border rounded-xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nom */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Nom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-3 py-2.5 bg-background border ${errors.name ? "border-red-500" : "border-border"} rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition`}
                      placeholder="Dupont"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Prénom (NOUVEAU CHAMP) */}
                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-medium mb-2"
                  >
                    Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="lastname"
                      name="lastname"
                      type="text"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-3 py-2.5 bg-background border ${errors.lastname ? "border-red-500" : "border-border"} rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition`}
                      placeholder="Jean"
                    />
                  </div>
                  {errors.lastname && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.lastname}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
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
                      className={`w-full pl-10 pr-3 py-2.5 bg-background border ${errors.email ? "border-red-500" : "border-border"} rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition`}
                      placeholder="exemple@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Mot de passe */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-2"
                  >
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
                      className={`w-full pl-10 pr-10 py-2.5 bg-background border ${errors.password ? "border-red-500" : "border-border"} rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition`}
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
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-2"
                  >
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-10 py-2.5 bg-background border ${errors.confirmPassword ? "border-red-500" : "border-border"} rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Bouton d'inscription */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-foreground text-background font-semibold rounded-lg hover:bg-foreground/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    <>
                      S'inscrire
                      <UserPlus className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Lien connexion */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Déjà un compte ?{" "}
                  <Link
                    to="/login"
                    className="text-foreground font-medium hover:underline"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>

              {/* Conditions */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  En créant un compte, vous acceptez nos{" "}
                  <Link to="/conditions" className="hover:underline">
                    Conditions d'utilisation
                  </Link>{" "}
                  et notre{" "}
                  <Link to="/confidentialite" className="hover:underline">
                    Politique de confidentialité
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

export default Register;
