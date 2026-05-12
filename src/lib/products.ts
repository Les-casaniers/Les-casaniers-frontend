import pcGaming from "@/assets/pc-gaming.jpg";
import pcPro from "@/assets/pc-pro.jpg";
import pcConfig from "@/assets/pc-config.jpg";
import heroPc from "@/assets/hero-pc.jpg";

export type Category = "Gaming" | "Pro" | "Workstation" | "Bureautique";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  tagline: string;
  price: number; // Ariary
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
  stock: number;
  specs: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    psu: string;
    cooling: string;
    motherboard: string;
    case: string;
  };
  story: string;
};

export const products: Product[] = [
  {
    id: "p1",
    slug: "aurora-gaming",
    name: "Aurora Gaming",
    category: "Gaming",
    tagline: "L'aurore d'une nouvelle ère, en 144 FPS.",
    price: 5990000,
    image: pcGaming,
    badge: "Populaire",
    rating: 4.9,
    reviews: 128,
    stock: 7,
    specs: {
      cpu: "Intel Core i7-13700KF",
      gpu: "NVIDIA RTX 4070 12 Go",
      ram: "32 Go DDR5 6000 MHz",
      storage: "SSD NVMe 1 To Gen4",
      psu: "750W 80+ Gold",
      cooling: "Watercooling AIO 240mm",
      motherboard: "B760 Tomahawk WiFi",
      case: "NZXT H7 Flow — Verre trempé",
    },
    story: "Pensée pour les gamers exigeants : du 1440p ultra fluide, un éclairage maîtrisé, et un silence d'orfèvre.",
  },
  {
    id: "p2",
    slug: "atelier-creator",
    name: "Atelier Creator",
    category: "Workstation",
    tagline: "Pour les créateurs qui ne supportent plus d'attendre.",
    price: 8490000,
    image: pcConfig,
    badge: "Pro Choice",
    rating: 4.8,
    reviews: 64,
    stock: 4,
    specs: {
      cpu: "AMD Ryzen 9 7900X",
      gpu: "NVIDIA RTX 4080 Super 16 Go",
      ram: "64 Go DDR5 ECC 5600",
      storage: "SSD NVMe 2 To + HDD 4 To",
      psu: "850W 80+ Platinum",
      cooling: "Watercooling 360mm",
      motherboard: "X670E Pro Creator",
      case: "Fractal Define 7 — Silence",
    },
    story: "DaVinci, Blender, Premiere : votre time-line répond enfin instantanément. Le rendu 4K devient une formalité.",
  },
  {
    id: "p3",
    slug: "office-essentiel",
    name: "Office Essentiel",
    category: "Bureautique",
    tagline: "Le compagnon discret de votre productivité.",
    price: 1890000,
    image: pcPro,
    rating: 4.7,
    reviews: 212,
    stock: 23,
    specs: {
      cpu: "Intel Core i5-12400F",
      gpu: "GPU intégré (UHD 730)",
      ram: "16 Go DDR4 3200",
      storage: "SSD NVMe 500 Go",
      psu: "500W 80+ Bronze",
      cooling: "Ventirad tour",
      motherboard: "B660M-A",
      case: "Mini-tour discret",
    },
    story: "Bureautique fluide, multi-écrans, visioconférence. Idéal PME, freelance et étudiant.",
  },
  {
    id: "p4",
    slug: "titan-streamer",
    name: "Titan Streamer",
    category: "Gaming",
    tagline: "Streamez, jouez, encodez. Sans compromis.",
    price: 9990000,
    image: heroPc,
    badge: "Édition limitée",
    rating: 5.0,
    reviews: 41,
    stock: 2,
    specs: {
      cpu: "Intel Core i9-14900K",
      gpu: "NVIDIA RTX 4090 24 Go",
      ram: "64 Go DDR5 6400",
      storage: "SSD NVMe 2 To Gen4",
      psu: "1000W 80+ Platinum",
      cooling: "Watercooling Custom 360mm",
      motherboard: "Z790 Hero WiFi 7",
      case: "Lian Li O11 Dynamic EVO",
    },
    story: "La machine ultime pour streamers et compétiteurs. RGB maîtrisé, performances de studio.",
  },
  {
    id: "p5",
    slug: "freelance-mobile",
    name: "Freelance Nomade",
    category: "Pro",
    tagline: "Compact, puissant, élégant.",
    price: 3490000,
    image: pcPro,
    rating: 4.6,
    reviews: 89,
    stock: 12,
    specs: {
      cpu: "AMD Ryzen 7 7700",
      gpu: "Radeon graphics intégré",
      ram: "32 Go DDR5 5200",
      storage: "SSD NVMe 1 To",
      psu: "550W 80+ Gold SFX",
      cooling: "Low profile",
      motherboard: "B650I ITX",
      case: "Mini-ITX premium",
    },
    story: "Format ITX qui se glisse partout. Idéal architectes, devs, créateurs nomades.",
  },
  {
    id: "p6",
    slug: "data-beast",
    name: "Data Beast",
    category: "Workstation",
    tagline: "Quand vos données pèsent des téraoctets.",
    price: 12990000,
    image: pcConfig,
    rating: 4.9,
    reviews: 23,
    stock: 1,
    specs: {
      cpu: "AMD Threadripper 7960X",
      gpu: "RTX 4090 24 Go",
      ram: "128 Go DDR5 ECC",
      storage: "SSD NVMe 4 To + RAID 16 To",
      psu: "1200W 80+ Titanium",
      cooling: "Watercooling Custom",
      motherboard: "TRX50 Sage WiFi",
      case: "Full Tower silencieux",
    },
    story: "IA, machine learning, simulations : 24 cœurs au service de vos calculs lourds.",
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatAr = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " Ar";
