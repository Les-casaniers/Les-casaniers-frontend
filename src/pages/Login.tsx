// // Login.tsx
// import { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Shield, User } from "lucide-react";
// import { SiteLayout } from "@/components/site/SiteLayout";
// import { useAuth } from "@/contexts/AuthContext";

// const Login = () => {
//   const { login, isAdmin, isLivreur } = useAuth();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: ""
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState({
//     email: "",
//     password: ""
//   });
//   const [generalError, setGeneralError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const navigate = useNavigate();
//   const [sessionExpired, setSessionExpired] = useState(false);

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     if (urlParams.get('session_expired') === 'true') {
//       setSessionExpired(true);
//       setGeneralError("Votre session a expiré. Veuillez vous reconnecter.");
//     }
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name as keyof typeof errors]) {
//       setErrors(prev => ({ ...prev, [name]: "" }));
//     }
//     if (generalError) setGeneralError("");
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setGeneralError("");
//     setErrors({ email: "", password: "" });

//     if (!formData.email || !formData.password) {
//       setGeneralError("Veuillez remplir tous les champs obligatoires.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const result = await login(formData.email, formData.password);

//       setIsLoading(false);

//       if (result.success) {
//         if (result.isAdmin) {
//           navigate("/DashboardAdmin");
//         } else if (result.isLivreur) {
//           navigate("/DashboardLivreur");
//         } else {
//           navigate("/DashboardClient");
//         }
//       } else {
//         if (result.errors) {
//           const emailError = result.errors.email
//             ? Array.isArray(result.errors.email)
//               ? result.errors.email[0]
//               : result.errors.email
//             : "";
//           const passwordError = result.errors.password || result.errors.mot_de_passe
//             ? Array.isArray(result.errors.password || result.errors.mot_de_passe)
//               ? (result.errors.password || result.errors.mot_de_passe)[0]
//               : (result.errors.password || result.errors.mot_de_passe)
//             : "";

//           setErrors({
//             email: typeof emailError === "string" ? emailError : JSON.stringify(emailError),
//             password: typeof passwordError === "string" ? passwordError : JSON.stringify(passwordError),
//           });
//         }
//         setGeneralError(result.message || "Email ou mot de passe incorrect");
//       }
//     } catch (error) {
//       console.error("Critical login submission error:", error);
//       setIsLoading(false);
//       setGeneralError("Une erreur inattendue est survenue. Veuillez réessayer.");
//     }
//   };

//   return (
//     <SiteLayout>
//       <section className="relative min-h-[calc(100vh-200px)] flex items-center bg-black overflow-hidden">
//         <div className="relative z-10 w-full container-x py-16 md:py-24">
//           <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

//             {/* Section Gauche */}
//             {/* <div className="space-y-5 pl-1 lg:pl-4">
//               <h1 className="font-handwritten font-semibold text-5xl md:text-6xl text-white leading-[1.1] tracking-wide">
//                 Bienvenue dans ton espace.
//               </h1>
//               <p className="font-sans text-white/60 text-[15px] leading-relaxed max-w-[280px]">
//                 Gère tes commandes, suit tes réparations et accède facilement à tes données.
//               </p>
//             </div> */}
//                {/* Section Gauche */}
//                         {/* Section Gauche */}
//             <div className="space-y-3 pl-1 lg:pl-4 mt-[10px]">
//               <h1
//                 className="max-w-[712px] text-3xl md:text-[38px] whitespace-nowrap"
//                 style={{
//                   fontFamily: '"Glacial Indifference", "Space Grotesk", system-ui, sans-serif',
//                   fontStyle: 'italic',
//                   fontWeight: 'normal',
//                   lineHeight: '1.25',
//                   letterSpacing: '1px',
//                   color: '#FFFFFF',
//                 }}
//               >
//                 Bienvenue dans ton espace.
//               </h1>
//               <p
//                 className="max-w-[320px] text-left"
//                 style={{
//                   fontFamily: '"Glacial Indifference", Inter, system-ui, sans-serif',
//                   fontStyle: 'normal',
//                   fontWeight: 'normal',
//                   fontSize: '22px',
//                   lineHeight: '37px',
//                   letterSpacing: '0.81px',
//                   color: '#FFFFFF',
//                   opacity: 1,
//                 }}
//               >
//                 Gère tes commandes, suit tes réparations et accède facilement à tes données.
//               </p>
//             </div>
//             {/* Section Droite - Formulaire */}
//             <div className="border border-white/20 rounded-2xl p-8 md:p-10">
//               <h2 className="text-center text-[15px] font-sans font-bold tracking-wide text-white mb-6">
//                 Connexion
//               </h2>

//               {(isAdmin || isLivreur) && (
//                 <div className="flex justify-center mb-4">
//                   <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
//                     isAdmin ? 'border-white/30' : 'border-white/20'
//                   }`}>
//                     {isAdmin ? (
//                       <Shield className="w-4 h-4 text-white" />
//                     ) : (
//                       <User className="w-4 h-4 text-white" />
//                     )}
//                     <span className="text-xs font-sans font-medium text-white">
//                       {isAdmin ? 'Espace Administrateur' : 'Espace Livreur'}
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {generalError && (
//                 <div className={`mb-5 p-3 rounded-xl flex items-start gap-3 border ${
//                   sessionExpired
//                     ? 'border-amber-500/40 text-amber-400'
//                     : 'border-red-500/40 text-red-400'
//                 }`}>
//                   <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
//                   <div>
//                     <p className="text-sm font-sans font-medium">{generalError}</p>
//                     {sessionExpired && (
//                       <p className="text-xs font-sans mt-1 opacity-80">Veuillez vous reconnecter pour continuer</p>
//                     )}
//                   </div>
//                 </div>
//               )}

//               <form onSubmit={handleSubmit} className="space-y-5">
//                 <div>
//                   <label htmlFor="email" className="block text-[13px] font-sans text-white/70 mb-1.5">
//                     Email
//                   </label>
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     placeholder="Obligatoire"
//                     className={`w-full px-4 py-2.5 bg-black text-white font-sans text-sm placeholder:text-white/40 placeholder:italic border rounded-lg focus:outline-none transition-colors duration-200 ${
//                       errors.email
//                         ? 'border-red-500 focus:border-red-500'
//                         : 'border-white/20 focus:border-white/60'
//                     }`}
//                   />
//                   {errors.email && (
//                     <p className="mt-1.5 text-xs font-sans text-red-400 flex items-center gap-1.5">
//                       <AlertCircle className="h-3.5 w-3.5" />
//                       {errors.email}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="password" className="block text-[13px] font-sans text-white/70 mb-1.5">
//                     Mot de passe
//                   </label>
//                   <div className="relative">
//                     <input
//                       id="password"
//                       name="password"
//                       type={showPassword ? "text" : "password"}
//                       value={formData.password}
//                       onChange={handleChange}
//                       required
//                       placeholder="••••••••••"
//                       className={`w-full px-4 pr-12 py-2.5 bg-black text-white font-sans text-sm placeholder:text-white/40 border rounded-lg focus:outline-none transition-colors duration-200 ${
//                         errors.password
//                           ? 'border-red-500 focus:border-red-500'
//                           : 'border-white/20 focus:border-white/60'
//                       }`}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-5 w-5 text-white/50 hover:text-white transition-colors duration-200" />
//                       ) : (
//                         <Eye className="h-5 w-5 text-white/50 hover:text-white transition-colors duration-200" />
//                       )}
//                     </button>
//                   </div>
//                   {errors.password && (
//                     <p className="mt-1.5 text-xs font-sans text-red-400 flex items-center gap-1.5">
//                       <AlertCircle className="h-3.5 w-3.5" />
//                       {errors.password}
//                     </p>
//                   )}
//                   {!isAdmin && !isLivreur && (
//                     <div className="text-right mt-1.5">
//                       <Link
//                         to="/mot-de-passe-oublie"
//                         className="text-[12px] font-handwritten italic text-white/50 hover:text-white transition-colors duration-200"
//                       >
//                         Mot de passe oublié ?
//                       </Link>
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full py-3 bg-white text-black font-sans font-semibold text-sm rounded-full hover:bg-white/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
//                 >
//                   {isLoading ? (
//                     <>
//                       <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
//                       <span>Connexion en cours...</span>
//                     </>
//                   ) : (
//                     <>
//                       <span>Je me connecte</span>
//                     </>
//                   )}
//                 </button>
//               </form>

//               {!isAdmin && !isLivreur && (
//                 <div className="text-center mt-5 space-y-2">
//                   <p className="text-[13px] font-handwritten italic text-white/50">ou</p>
//                   <p className="text-[13px] font-handwritten italic text-white/50">Pas encore de compte ?</p>
//                   <Link
//                     to="/inscription"
//                     className="inline-block w-full py-2.5 mt-2 border border-white/30 text-white font-sans text-sm font-medium rounded-full hover:bg-white/10 transition-colors duration-200"
//                   >
//                     Créer ton compte
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>
//     </SiteLayout>
//   );
// };

// export default Login;
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
      <section className="relative min-h-[calc(100vh-200px)] flex items-start bg-black overflow-hidden pt-10">
        <div className="relative z-10 w-full container-x py-4 md:py-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Section Gauche */}
            <div className="space-y-4 pl-0 lg:pl-0 -ml-2 lg:-ml-4 pr-4 lg:pr-0">
              <h1
                className="whitespace-nowrap"
                style={{
                  fontStyle: 'italic',
                  fontWeight: 'normal',
                  fontSize: '42px',
                  lineHeight: '52px',
                  fontFamily: '"Glacial Indifference", system-ui, sans-serif',
                  color: '#FFFFFF',
                  textAlign: 'left',
                  letterSpacing: '1.5px',
                }}
              >
                Bienvenue dans ton espace.
              </h1>
              <p
                style={{
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  fontSize: '16px',
                  lineHeight: '26px',
                  fontFamily: '"Glacial Indifference", system-ui, sans-serif',
                  color: '#FFFFFF',
                  textAlign: 'left',
                  letterSpacing: '0.6px',
                  opacity: 0.7,
                }}
              >
                Gère tes commandes, suit tes réparations et accède <br />facilement à tes données.
              </p>
            </div>

            {/* Section Droite - Formulaire */}
            <div className="border border-white/10 rounded-3xl p-8 md:p-10 bg-black/40 backdrop-blur-sm">
              <h2 className="text-center text-white text-lg font-semibold mb-8 tracking-wide">
                Connexion
              </h2>

              {(isAdmin || isLivreur) && (
                <div className="flex justify-center mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                    isAdmin ? 'border-white/30 bg-white/5' : 'border-white/20 bg-white/5'
                  }`}>
                    {isAdmin ? (
                      <Shield className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                    <span className="text-xs font-medium text-white uppercase tracking-wider">
                      {isAdmin ? 'Espace Administrateur' : 'Espace Livreur'}
                    </span>
                  </div>
                </div>
              )}

              {generalError && (
                <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
                  sessionExpired
                    ? 'border-amber-500/30 bg-amber-500/5 text-amber-200'
                    : 'border-red-500/30 bg-red-500/5 text-red-200'
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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm text-white/60 mb-2 font-medium">
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
                    className={`w-full px-4 py-3 bg-transparent text-white text-sm placeholder:text-white/40 border rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.email
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/20 focus:border-white/40'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm text-white/60 mb-2 font-medium">
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
                      className={`w-full px-4 py-3 bg-transparent text-white text-sm placeholder:text-white/40 border rounded-xl focus:outline-none transition-all duration-200 pr-12 ${
                        errors.password
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-white/20 focus:border-white/40'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-white/40 hover:text-white/70 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-white/40 hover:text-white/70 transition-colors" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
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
                  className="w-full py-3.5 bg-white text-black font-semibold text-sm rounded-full hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 shadow-lg shadow-white/10"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      <span>Je me connecte</span>
                    </>
                  )}
                </button>
              </form>

              {!isAdmin && !isLivreur && (
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-4 bg-black text-white/50 italic">ou</span>
                    </div>
                  </div>
                  
                  <div className="text-center mt-6 space-y-3">
                    <p className="text-sm text-white/50 italic">Pas encore de compte ?</p>
                    <Link
                      to="/inscription"
                      className="inline-flex w-full items-center justify-center py-3 border border-white/30 text-white font-medium text-sm rounded-full hover:bg-white/5 hover:border-white/50 transition-all duration-200"
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