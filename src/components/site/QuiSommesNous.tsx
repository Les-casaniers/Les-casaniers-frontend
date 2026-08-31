import { SiteLayout } from "@/components/site/SiteLayout";
import misa from "@/assets/Mascotte_Plan de travail 1.png";

const team = [
  { role: "CEO", name: "Valérie", title: "Vision, stratégie et sourcing :", text: "Ma mission : te donner accès à ce qui se fait de mieux en tech pour que ton PC ne soit jamais un frein à tes projets, que ce soit au travail ou en jeu." },
  { role: "LA DIRECTRICE", name: "Noro", title: "La cheffe d’orchestre du quotidien :", text: "Je veille sur l’équipe pour qu’elle puisse t’offrir le meilleur accompagnement possible, du premier contact jusqu’à la livraison." },
  { role: "LE TECHNICIEN", name: "Plein", title: "L’expert SAV et technique :", text: "Je t’aide à trouver le produit idéal pour tes besoins et je t’accompagne dans l’entretien de ta machine pour qu’elle reste performante." },
  { role: "LE LOGISTICIEN", name: "Brunnel", title: "Le garant des livraisons partout à Mada :", text: "Mon rôle est de faire en sorte que tu reçoives tes produits dans les meilleures conditions possibles, où que tu sois à Madagascar." },
  { role: "LE STREAMER", name: "Jean-Charles", title: "L’expert performance et watercooling custom :", text: "J’accompagne les projets de watercooling sur mesure et je partage des moments de détente avec la communauté en stream sur nos réseaux." },
  { role: "LE CREATIF", name: "Yves", title: "Créateur des supports visuels :", text: "Je conçois les contenus qui nourrissent le lien entre Les Casaniers et sa communauté." },
  { role: "LE VIDEASTE", name: "Oscar", title: "Capteur des moments forts :", text: "J’enregistre les moments partagés entre toi et notre équipe, pour raconter la vie de l’atelier et de la communauté." },
  { role: "LE WEBMASTER", name: "", title: "La garant du référencement :", text: "Je ferai vivre ce site en l’alimentant avec les meilleurs produits du marché et en rendant les fiches techniques plus lisibles grâce au copywriting." },
];

const QuiSommesNous = () => (
  <SiteLayout footerClassName="bg-white text-black">
    <main className="bg-black py-10 text-white sm:py-14">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <header className="-ml-40">
<h1 className="inline-flex items-end text-3xl font-black uppercase tracking-[0.12em] sm:text-4xl">
  <span className="shrink-0 border-b-2 border-white pb-1 pr-3">
    Qui sommes
  </span>
  <span className="inline-flex items-end whitespace-nowrap font-light normal-case italic tracking-normal relative">
    <span className="border-b-2 border-dashed border-white pb-1 pr-3 uppercase">nous ?</span>
    <svg
      className="ml-1.5 h-5 w-5 shrink-0 stroke-[3] translate-y-0.5 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
       style={{ marginBottom: '-13px' }}
    >
      <path d="M3 3c7 0 13 4 13 13" />
      <path d="M10 12l6 6 6-6" />
    </svg>
  </span>
</h1>
        </header>
        <p className="mt-12 rounded-lg border border-white/45 px-5 py-4 text-base leading-relaxed text-white/80 sm:px-6 sm:text-lg">
          Bienvenue dans l’atelier où tes ambitions prennent forme. Ici, on écoute tes besoins et on met nos savoir-faire en commun pour te conseiller l'outil qui te correspond vraiment. On teste chaque machine, on soigne la livraison et on t'accompagne dans son entretien, parce qu'on tient à rester ton partenaire durable de performance.
        </p>

        <section className="mt-12 grid items-center gap-8 md:grid-cols-[250px_1fr]">
          <div className="relative mx-auto flex flex-col items-center">
            {/* Cercle avec focus uniquement sur le visage */}
            <div className="flex h-44 w-44 sm:h-48 sm:w-48 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
              <img 
                src={misa} 
                alt="Misa, la mascotte" 
                className="h-full w-full object-cover object-top scale-[1.2] translate-y-1" 
              />
            </div>
            {/* Étiquette collée en pied d'image */}
            <div className="-mt-7 relative z-10 w-full max-w-[170px] rounded-xl bg-white px-3 py-1.5 text-center text-black shadow-xl border border-gray-100">
              <p className="text-xs font-black tracking-wider underline sm:text-sm">
                LA MASCOTTE
              </p>
              <p className="text-xl font-bold leading-none">
                Misa
              </p>
            </div>
          </div>
          <div className="space-y-6 text-base leading-relaxed text-white/80 sm:text-lg">
            <p>Sur notre site, Misa t'aide à te repérer, à mieux comprendre nos univers et à avancer plus facilement dans ton parcours.</p>
            <p>Son nom vient de Misaotra, "merci" en malgache : une façon de remercier nos clients pour leur confiance et pour faire vivre ce projet.</p>
            <p>À travers la Boutique de Misa, il porte aussi une mission qui nous tient à cœur : contribuer à la préservation de la forêt malgache.</p>
          </div>
        </section>

        <section className="mt-16 space-y-14 sm:space-y-16">
          {team.map((member) => (
            <article key={member.name} className="grid items-start gap-8 sm:grid-cols-[240px_1fr] sm:gap-10">
              <div className="relative mx-auto h-64 w-56 rounded-lg bg-white shadow-sm">
                <div className="absolute -bottom-5 left-1/2 w-[calc(100%-12px)] -translate-x-1/2 rounded-xl bg-white px-3 py-2 text-center text-black shadow-lg">
                  <p className="text-sm font-black underline">{member.role}</p>
                  <p className="text-xl leading-none">{member.name}</p>
                </div>
              </div>
              <div className="pt-3 text-base leading-relaxed text-white/80 sm:text-lg">
                <h2 className="mb-3 text-xl font-medium italic text-white sm:text-2xl">{member.title}</h2>
                <p>{member.text}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  </SiteLayout>
);

export default QuiSommesNous;