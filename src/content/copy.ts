// The landing's copy deck — ONE module, FR first. French lines are
// verbatim from docs/mishi-landing-concept.md and byte-guarded by
// `npm run check:copy` (DL50): zero paraphrase, ever. The EN column ships
// with the FR/EN toggle mandated by the 2026-07-17 brief (DL64 —
// supersedes A-P5's hold; strings flagged for Aziiz ratification).
//
// The index.html pre-hydration shell duplicates the FR hero + nav lines
// (DL17/DL47) — edit those in lockstep.

export type Lang = 'fr' | 'en';

export interface LandingCopy {
  navHow: string;
  navWhy: string;
  heroTitle: string;
  heroSub: string;
  heroQr: string; // beside the QR tile
  heroQrAria: string; // what the QR actually encodes, for AT
  heroContact: string; // restaurateur mailto CTA
  /** the phone showcase, sections 2..n — big line + support line each
   *  (draft copy, pending Aziiz ratification) */
  features: readonly { title: string; body: string }[];
  chaosLines: readonly [string, string, string];
  scanLine: string;
  choiceTitle: string;
  resultDish: string;
  resultReason: string;
  resultConfidence: string;
  resultImageLabel: string;
  trustDietaryTitle: string;
  trustDietaryTags: readonly string[];
  trustImagesTitle: string;
  trustImagesChips: readonly string[];
  trustImagesLine: string;
  trustLocalTitle: string;
  trustLocalChips: readonly string[];
  trustLocalLine: string;
  decisionLead: string; // before the nowrap dot-period fragment
  decisionEnd: string; // "manges" — the dot is its full stop
  ctaDownload: string;
  ctaDemo: string;
  attribution: string;
}

export const COPY: Record<Lang, LandingCopy> = {
  fr: {
    navHow: 'Comment ça marche',
    navWhy: 'Pourquoi Mishi',
    heroTitle: 'Tu regardes le menu. Le menu te regarde.',
    heroSub: 'Une photo. Une recommandation. Moins de 60 secondes.',
    heroQr: 'Scanner pour iOS',
    heroQrAria: "QR code : Mishi, bientôt sur l'App Store.",
    heroContact: 'Restaurateur ? Écrivez-nous',
    features: [
      { title: 'Scanne le menu.', body: 'Une photo suffit. Mishi lit chaque plat — même sans photos, même écrit à la main.' },
      { title: 'Comprends chaque plat.', body: 'Ingrédients, images honnêtes, FR / EN. Le menu devient clair, plat par plat.' },
      { title: 'Une recommandation. La tienne.', body: 'Tes goûts, tes allergènes, ton budget — Mishi choisit le plat sûr, pour toi.' },
    ],
    chaosLines: ['14 plats.', 'Aucune photo.', 'Le serveur attend.'],
    scanLine: 'Mishi lit le menu comme un ami qui vit ici.',
    choiceTitle: 'Un seul plat. Choisi pour toi.',
    resultDish: 'Poulet Yassa',
    resultReason: 'Généreux et parfumé — le choix sûr ici.',
    resultConfidence: 'Global ·',
    resultImageLabel: 'Illustration',
    trustDietaryTitle: 'Tes préférences, prises au sérieux.',
    trustDietaryTags: ['halal', 'végétarien', 'allergènes'],
    trustImagesTitle: 'Images honnêtes',
    trustImagesChips: ['Photo du plat', "Photo d'exemple", 'Illustration', 'Illustration'],
    trustImagesLine: 'On ne te ment jamais sur la photo.',
    trustLocalTitle: "D'ici",
    trustLocalChips: ['FR · EN', 'Poulet Yassa'],
    trustLocalLine: 'Conçu à Dakar. Compréhensible partout.',
    decisionLead: 'Mishi choisit. Tu',
    decisionEnd: 'manges',
    ctaDownload: 'Télécharger Mishi',
    ctaDemo: 'Voir une démo',
    attribution: 'Assiette 3D : « Plate » par andrejpustovojtenko7 (Sketchfab) — licence CC-BY-4.0',
  },
  en: {
    navHow: 'How it works',
    navWhy: 'Why Mishi',
    heroTitle: 'You read the menu. The menu reads you.',
    heroSub: 'One photo. One recommendation. Under 60 seconds.',
    heroQr: 'Scan for iOS',
    heroQrAria: 'QR code: Mishi, coming soon to the App Store.',
    heroContact: 'Restaurant owner? Write to us',
    features: [
      { title: 'Scan the menu.', body: 'One photo is enough. Mishi reads every dish — no pictures needed, even handwritten.' },
      { title: 'Understand every dish.', body: 'Ingredients, honest images, FR / EN. The menu becomes clear, dish by dish.' },
      { title: 'One recommendation. Yours.', body: 'Your tastes, your allergens, your budget — Mishi picks the safe dish, for you.' },
    ],
    chaosLines: ['14 dishes.', 'No photos.', 'The waiter is waiting.'],
    scanLine: 'Mishi reads the menu like a friend who lives here.',
    choiceTitle: 'One dish. Chosen for you.',
    resultDish: 'Poulet Yassa',
    resultReason: 'Generous and fragrant, the safe pick here.',
    resultConfidence: 'Global ·',
    resultImageLabel: 'Illustration',
    trustDietaryTitle: 'Your preferences, taken seriously.',
    trustDietaryTags: ['halal', 'vegetarian', 'allergens'],
    trustImagesTitle: 'Honest images',
    trustImagesChips: ['Dish photo', 'Example photo', 'Illustration', 'Illustration'],
    trustImagesLine: 'We never lie about the photo.',
    trustLocalTitle: 'From here',
    trustLocalChips: ['FR · EN', 'Poulet Yassa'],
    trustLocalLine: 'Designed in Dakar. Understood everywhere.',
    decisionLead: 'Mishi decides. You',
    decisionEnd: 'eat',
    ctaDownload: 'Download Mishi',
    ctaDemo: 'Watch a demo',
    attribution: '3D plate: “Plate” by andrejpustovojtenko7 (Sketchfab), CC-BY-4.0 license',
  },
};
