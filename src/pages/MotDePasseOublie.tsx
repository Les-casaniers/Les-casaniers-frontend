import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import api from "@/service/api";
import { useAuth } from "@/contexts/AuthContext";

const MotDePasseOublie = () => {
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const redirectTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      navigate("/login");
    }
  }, [isAdmin, navigate]);

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
    const newErrors = { email: "", currentPassword: "", newPassword: "", confirmPassword: "" };

    if (!formData.email) {
      newErrors.email = "L'email est requis";
      isValid = false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }
    if (!formData.newPassword) {
      newErrors.newPassword = "Le mot de passe est requis";
      isValid = false;
    }
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Le mot de passe actuel est requis";
      isValid = false;
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation est requise";
      isValid = false;
    }
    if (formData.newPassword && !/(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/.test(formData.newPassword)) {
      newErrors.newPassword = "Le mot de passe doit contenir 8 caracteres minimum, 1 majuscule, 1 chiffre et 1 symbole";
      isValid = false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
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
    setShowSuccess(false);

    try {
      const response = await api.post("/change-password", {
        email: formData.email,
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        new_password_confirmation: formData.confirmPassword,
      });

      if (response.data.success) {
        if (isMountedRef.current) {
          setErrors({ email: "", currentPassword: "", newPassword: "", confirmPassword: "" });
          setShowSuccess(true);
          redirectTimeoutRef.current = window.setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } else if (isMountedRef.current) {
        setGeneralError(response.data.message || "Erreur lors de la mise a jour du mot de passe");
      }
    } catch (error: any) {
      const responseData = error.response?.data;
      if (responseData?.errors) {
        const backendErrors = responseData.errors;
        const newErrors: Record<string, string> = {};
        if (backendErrors.email) newErrors.email = backendErrors.email[0];
        if (backendErrors.current_password) newErrors.currentPassword = backendErrors.current_password[0];
        if (backendErrors.new_password) newErrors.newPassword = backendErrors.new_password[0];
        if (backendErrors.new_password_confirmation) newErrors.confirmPassword = backendErrors.new_password_confirmation[0];
        if (isMountedRef.current) {
          setErrors(newErrors);
        }
      }
      if (isMountedRef.current) {
        setGeneralError(responseData?.message || "Erreur lors de la mise a jour du mot de passe");
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
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-foreground/10 rounded-full mb-4">
                <Lock className="h-6 w-6 text-foreground" />
              </div>
              <h1 className="text-3xl font-bold">Mot de passe oublie</h1>
              <p className="text-muted-foreground">Reserve aux comptes clients</p>
            </div>

            {showSuccess && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  Mot de passe mis a jour. Redirection vers la connexion...
                </p>
              </div>
            )}

            {generalError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
              </div>
            )}

            <div className="border border-border rounded-xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
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
                      className={`w-full pl-10 pr-3 py-2.5 bg-background border ${errors.email ? "border-red-500" : "border-border"} rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition`}
                      placeholder="exemple@email.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-10 py-2.5 bg-background border ${errors.currentPassword ? "border-red-500" : "border-border"} rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition`}
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
                  {errors.currentPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-10 py-2.5 bg-background border ${errors.newPassword ? "border-red-500" : "border-border"} rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition`}
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
                  {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-foreground text-background font-semibold rounded-lg hover:bg-foreground/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Mise a jour..." : "Mettre a jour le mot de passe"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Retour a la{" "}
                  <Link to="/login" className="text-foreground font-medium hover:underline">
                    connexion
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

export default MotDePasseOublie;
