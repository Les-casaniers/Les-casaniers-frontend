import { useEffect, useRef, useState, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompatibilityItem {
  categorie: string;
  etat: "OK" | "ATTENTION" | "ERREUR";
  message: string;
}

interface CompatibilityResult {
  compatible: boolean;
  score_compatibilite: number;
  analyse: CompatibilityItem[];
  problemes: string[];
  recommandations: string[];
}

interface ComponentSelection {
  nom: string;
  reference?: string;
  description_courte?: string;
  specifications?: Record<string, string>;
}

interface AICompatibilityPanelProps {
  /** Map of step key → selected product (null if not selected) */
  selections: Record<string, ComponentSelection | null>;
  /** Whether to auto-analyze when selections change (debounced 1.5s) */
  autoAnalyze?: boolean;
  /** Gemini API key — pass via import.meta.env.VITE_GEMINI_API_KEY */
  apiKey?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es un expert mondial en assemblage et compatibilité de matériel informatique.

Ton rôle est d'analyser une configuration informatique composée de plusieurs composants et de déterminer si tous les composants sont compatibles entre eux.

Tu dois agir comme un technicien informatique senior spécialisé dans :
- Processeurs (Intel et AMD)
- Cartes mères
- Mémoire RAM
- Cartes graphiques
- Alimentations
- SSD SATA
- SSD NVMe
- Disques durs
- Boîtiers
- Refroidissement (Air Cooling / Water Cooling)
- Réseaux
- Serveurs
- Stations de travail

MISSION :
Lorsque l'utilisateur fournit une configuration, tu dois :
1. Identifier les caractéristiques techniques des composants.
2. Vérifier la compatibilité entre tous les composants.
3. Détecter les incompatibilités.
4. Détecter les limitations potentielles.
5. Détecter les risques de sous-dimensionnement.
6. Détecter les risques de surconsommation électrique.
7. Détecter les problèmes de format physique.
8. Détecter les problèmes de performances.
9. Donner des recommandations.

Tu ne dois jamais inventer des caractéristiques techniques.
Si tu n'es pas certain d'une information :
- indique clairement "Information non vérifiable"
- ne fais pas de supposition

CRITÈRES DE VÉRIFICATION :

CPU ↔ Carte mère
- Socket
- Génération
- Compatibilité BIOS

RAM ↔ Carte mère
- DDR3
- DDR4
- DDR5
- Fréquence maximale

Carte graphique ↔ Carte mère
- PCIe

Carte graphique ↔ Boîtier
- Longueur maximale

Refroidissement ↔ Boîtier
- Hauteur maximale

Alimentation ↔ Configuration
- Puissance recommandée
- Connecteurs nécessaires

SSD NVMe ↔ Carte mère
- Présence de port M.2
- Compatibilité PCIe

Boîtier ↔ Carte mère
- ATX
- Micro ATX
- Mini ITX
- E-ATX

FORMAT DE RÉPONSE OBLIGATOIRE (JSON uniquement, sans backticks, sans commentaires) :
{
  "compatible": true|false,
  "score_compatibilite": 0-100,
  "analyse": [
    {
      "categorie": "",
      "etat": "OK|ATTENTION|ERREUR",
      "message": ""
    }
  ],
  "problemes": [],
  "recommandations": []
}

RÈGLES :
- Compatible = true uniquement si aucun problème critique n'est détecté.
- Compatible = false dès qu'un composant empêche le fonctionnement du système.
- Ne jamais répondre en texte libre.
- Toujours répondre en JSON valide.`;

const STEP_LABELS: Record<string, string> = {
  case: "Boîtier",
  cpu: "Processeur",
  motherboard: "Carte mère",
  cooling: "Refroidissement",
  ram: "Mémoire RAM",
  storage: "Stockage",
  gpu: "Carte graphique",
  psu: "Alimentation",
};

// ─── Helper: build user prompt from selections ─────────────────────────────

function buildUserPrompt(selections: Record<string, ComponentSelection | null>): string {
  const lines: string[] = ["Analyse cette configuration informatique.\n\nConfiguration actuelle :\n"];

  const mapping: Array<[string, string]> = [
    ["cpu", "CPU"],
    ["motherboard", "Carte mère"],
    ["ram", "RAM"],
    ["gpu", "Carte graphique"],
    ["storage", "Stockage"],
    ["psu", "Alimentation"],
    ["case", "Boîtier"],
    ["cooling", "Refroidissement"],
  ];

  for (const [key, label] of mapping) {
    const product = selections[key];
    lines.push(`${label} :\n${product ? product.nom : "Non sélectionné"}\n`);
  }

  lines.push("\nRespecte strictement le format JSON défini. Réponds uniquement en JSON valide.");
  return lines.join("\n");
}

// ─── Sub-components ────────────────────────────────────────────────────────

const StateIcon = ({ etat }: { etat: CompatibilityItem["etat"] }) => {
  if (etat === "OK") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />;
  if (etat === "ATTENTION") return <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />;
  return <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />;
};

const ScoreRing = ({ score, compatible }: { score: number; compatible: boolean }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = compatible ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle
          cx="36" cy="36" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-secondary"
        />
        <circle
          cx="36" cy="36" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold leading-none">{score}</span>
        <span className="text-[8px] text-muted-foreground leading-none mt-0.5">/ 100</span>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

export const AICompatibilityPanel = ({
  selections,
  autoAnalyze = true,
  apiKey,
}: AICompatibilityPanelProps) => {
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [lastAnalyzed, setLastAnalyzed] = useState<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedCount = Object.values(selections).filter(Boolean).length;
  const selectionsKey = JSON.stringify(
    Object.entries(selections)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => [k, v?.nom])
  );

  const analyze = useCallback(async () => {
    if (selectedCount < 2) return;

    const key = apiKey ?? import.meta.env.VITE_GEMINI_API_KEY ?? "";
    if (!key) {
      setError("Clé API Gemini manquante. Définissez VITE_GEMINI_API_KEY dans votre .env");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userPrompt = buildUserPrompt(selections);

      // Gemini — systemInstruction + user turn
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData?.error?.message ?? `Erreur HTTP ${response.status}`;
        throw new Error(msg);
      }

      const data = await response.json();

      // Détection blocage de sécurité Gemini
      const finishReason = data?.candidates?.[0]?.finishReason;
      if (finishReason === "SAFETY" || finishReason === "RECITATION") {
        throw new Error(`Gemini a refusé la requête (${finishReason})`);
      }

      // Extraction du texte — candidates[0].content.parts[0].text
      const rawText: string =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("") ?? "";

      // Log pour debug (retirez en prod)
      console.debug("[Gemini raw]", rawText);

      if (!rawText || rawText.trim() === "") {
        // Affiche la réponse complète pour diagnostiquer
        console.error("[Gemini full response]", JSON.stringify(data, null, 2));
        throw new Error(`Réponse vide (finishReason: ${finishReason ?? "inconnu"})`);
      }

      // Nettoyage : strip backticks markdown + extraction JSON si encapsulé dans du texte
      let cleaned = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```/g, "")
        .trim();

      // Si Gemini a quand même ajouté du texte avant/après le JSON, on extrait le bloc JSON
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`JSON introuvable dans la réponse Gemini`);
      }
      cleaned = jsonMatch[0];

      const parsed: CompatibilityResult = JSON.parse(cleaned);

      setResult(parsed);
      setLastAnalyzed(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selections, selectedCount, apiKey]);

  // Auto-analyze with debounce when selections change
  useEffect(() => {
    if (!autoAnalyze) return;
    if (selectedCount < 2) return;
    if (selectionsKey === lastAnalyzed) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      analyze();
    }, 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectionsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Idle state (< 2 selected) ────────────────────────────────────────────
  if (selectedCount < 2) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-4 text-center">
        <Sparkles className="h-5 w-5 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Sélectionnez au moins <span className="font-medium text-foreground">2 composants</span> pour
          activer l'analyse de compatibilité IA
        </p>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 shrink-0">
            <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
            <Sparkles className="h-3.5 w-3.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium">Analyse en cours…</p>
            <p className="text-[10px] text-muted-foreground">
              Vérification de {selectedCount} composant{selectedCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          {[60, 80, 45].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-primary/10 overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-primary/30 animate-pulse"
                style={{ width: `${w}%`, animationDelay: `${i * 0.2}s` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <div className="flex items-start gap-2 mb-3">
          <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-red-600 dark:text-red-400">Analyse échouée</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{error}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={analyze}
          className="h-7 text-[10px] w-full border border-red-500/20 text-red-600 hover:bg-red-500/10"
        >
          <RefreshCw className="h-3 w-3 mr-1.5" />
          Réessayer
        </Button>
      </div>
    );
  }

  // ── No result yet ────────────────────────────────────────────────────────
  if (!result) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
        <Sparkles className="h-5 w-5 mx-auto text-primary/40 mb-2" />
        <p className="text-[10px] text-muted-foreground mb-3">
          {selectedCount} composant{selectedCount > 1 ? "s" : ""} sélectionné{selectedCount > 1 ? "s" : ""}
        </p>
        <Button
          variant="soft"
          size="sm"
          onClick={analyze}
          className="h-8 text-xs"
        >
          <Zap className="h-3 w-3 mr-1.5" />
          Analyser la compatibilité
        </Button>
      </div>
    );
  }

  // ── Result display ───────────────────────────────────────────────────────
  const erreurs = result.analyse.filter((a) => a.etat === "ERREUR");
  const attentions = result.analyse.filter((a) => a.etat === "ATTENTION");
  const oks = result.analyse.filter((a) => a.etat === "OK");

  const statusColor = result.compatible
    ? "border-emerald-500/20 bg-emerald-500/5"
    : result.score_compatibilite >= 50
      ? "border-amber-500/20 bg-amber-500/5"
      : "border-red-500/20 bg-red-500/5";

  const statusLabel = result.compatible
    ? "Compatible"
    : erreurs.length > 0
      ? "Incompatible"
      : "À vérifier";

  const statusTextColor = result.compatible
    ? "text-emerald-600 dark:text-emerald-400"
    : erreurs.length > 0
      ? "text-red-600 dark:text-red-400"
      : "text-amber-600 dark:text-amber-400";

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${statusColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Analyse IA
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {lastAnalyzed && (
            <span className="text-[9px] text-muted-foreground">{lastAnalyzed}</span>
          )}
          <button
            onClick={analyze}
            className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Relancer l'analyse"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Score + Status */}
      <div className="flex items-center gap-3">
        <ScoreRing score={result.score_compatibilite} compatible={result.compatible} />
        <div>
          <div className={`text-sm font-bold ${statusTextColor}`}>{statusLabel}</div>
          <div className="flex gap-2 mt-1">
            {oks.length > 0 && (
              <span className="text-[9px] flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-2.5 w-2.5" />{oks.length} OK
              </span>
            )}
            {attentions.length > 0 && (
              <span className="text-[9px] flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-2.5 w-2.5" />{attentions.length} alerte{attentions.length > 1 ? "s" : ""}
              </span>
            )}
            {erreurs.length > 0 && (
              <span className="text-[9px] flex items-center gap-0.5 text-red-600 dark:text-red-400">
                <XCircle className="h-2.5 w-2.5" />{erreurs.length} erreur{erreurs.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Problèmes critiques (always visible) */}
      {result.problemes.length > 0 && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 space-y-1">
          <p className="text-[9px] uppercase tracking-wider font-semibold text-red-600 dark:text-red-400">
            Problèmes détectés
          </p>
          {result.problemes.map((p, i) => (
            <p key={i} className="text-[10px] text-red-700 dark:text-red-300 leading-relaxed">
              • {p}
            </p>
          ))}
        </div>
      )}

      {/* Toggle détails */}
      <button
        onClick={() => setShowDetails((v) => !v)}
        className="w-full flex items-center justify-between text-[10px] text-muted-foreground hover:text-foreground transition-colors py-0.5"
      >
        <span>Détails de l'analyse ({result.analyse.length} catégories)</span>
        {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {/* Analyse détaillée */}
      {showDetails && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
          {result.analyse.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2 py-1.5 border-b border-border/20 last:border-0"
            >
              <StateIcon etat={item.etat} />
              <div className="min-w-0">
                <p className="text-[10px] font-medium truncate">{item.categorie}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommandations */}
      {result.recommandations.length > 0 && (
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5 space-y-1">
          <p className="text-[9px] uppercase tracking-wider font-semibold text-primary/80">
            Recommandations
          </p>
          {result.recommandations.map((r, i) => (
            <p key={i} className="text-[10px] text-muted-foreground leading-relaxed">
              → {r}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default AICompatibilityPanel;