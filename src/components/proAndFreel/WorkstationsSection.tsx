import { CheckCircle, Cpu } from "lucide-react";

export const WorkstationsSection = () => (
  <section id="workstations" className="py-20 border-b border-border bg-secondary/30">
    <div className="container-x grid md:grid-cols-2 gap-12 items-center">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
        <Cpu className="h-16 w-16 text-purple-500" />
        <p className="text-sm text-muted-foreground">
          Rendu 3D, montage 4K, entraînement de modèles IA —
          nos workstations ne transigent pas sur la puissance.
        </p>
      </div>
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-purple-500">
          Workstations (Création & Data)
        </span>
        <h2 className="mt-3 text-3xl font-bold">
          La puissance brute pour vos projets les plus exigeants.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Montage vidéo 4K/8K, modélisation 3D, analyse de données massives —
          nos workstations sont configurées pour les professionnels qui ne
          peuvent pas se permettre d'attendre.
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {[
            "Processeurs AMD Threadripper ou Intel Xeon",
            "64 à 128 Go de RAM ECC pour la stabilité",
            "GPU NVIDIA RTX 4000/6000 pour le rendu et l'IA",
            "Stockage NVMe RAID pour la rapidité et la sécurité",
            "Optimisé Adobe Premiere, DaVinci Resolve, Blender",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);