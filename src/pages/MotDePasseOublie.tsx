import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import api from "@/service/api";
import { useAuth } from "@/contexts/AuthContext";

const MotDePasseOublie = () => {
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({
    email: "",
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
    const newErrors = { email: "", newPassword: "", confirmPassword: "" };

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
        new_password: formData.newPassword,
        new_password_confirmation: formData.confirmPassword,
      });

      if (response.data.success) {
        if (isMountedRef.current) {
          setErrors({ email: "", newPassword: "", confirmPassword: "" });
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
      <section className="relative min-h-[calc(100vh-200px)] flex items-center justify-center bg-black py-16">
        <div className="w-full container-x">
          <div className="max-w-md mx-auto border border-white/20 rounded-2xl p-8 md:p-10">
            <h1 className="text-center text-xl font-sans font-bold text-white mb-6">
              Retrouve ton mot de passe
            </h1>

            {showSuccess && (
              <div className="mb-5 p-3 rounded-xl border border-emerald-500/40 text-emerald-400 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="text-sm font-sans">
                  Mot de passe mis à jour. Redirection vers la connexion...
                </p>
              </div>
            )}

            {generalError && (
              <div className="mb-5 p-3 rounded-xl border border-red-500/40 text-red-400 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-sans">{generalError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <div>
                <label htmlFor="newPassword" className="block text-[13px] font-sans text-white/70 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••••"
                    className={`w-full px-4 pr-12 py-2.5 bg-black text-white font-sans text-sm placeholder:text-white/40 border rounded-lg focus:outline-none transition-colors duration-200 ${
                      errors.newPassword
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
                {errors.newPassword && (
                  <p className="mt-1.5 text-xs font-sans text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-white text-black font-sans font-semibold text-sm rounded-full hover:bg-white/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <span>Valider</span>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-[13px] font-sans text-white/50">
                Retour à la{" "}
                <Link to="/login" className="font-bold text-white hover:underline">
                  connexion
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default MotDePasseOublie;