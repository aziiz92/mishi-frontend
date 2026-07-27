export type Lang = 'fr' | 'en';

export interface LandingCopy {
  /** Legacy animation modules remain compiled for shared-route compatibility. */
  features: readonly { title: string; body: string }[];
  chaosLines: readonly [string, string, string];
  skip: string;
  nav: {
    how: string;
    trust: string;
    faq: string;
    download: string;
    menu: string;
    close: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    sub: string;
    demo: string;
    storeAria: string;
    unavailable: string;
  };
  how: {
    eyebrow: string;
    title: string;
    intro: string;
    steps: readonly {
      number: string;
      title: string;
      body: string;
      screen: string;
      alt: string;
    }[];
  };
  trust: {
    eyebrow: string;
    title: string;
    intro: string;
    imageTitle: string;
    imageBody: string;
    imageAlt: string;
    preferenceTitle: string;
    preferenceBody: string;
    preferenceAlt: string;
    allergyTitle: string;
    allergyBody: string;
    allergyAlt: string;
    privacyTitle: string;
    privacyBody: string;
    privacyAlt: string;
  };
  care: {
    eyebrow: string;
    title: string;
    body: string;
    link: string;
    sceneLabel: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    items: readonly { question: string; answer: string }[];
  };
  final: {
    eyebrow: string;
    title: string;
    body: string;
    qr: string;
    qrFallback: string;
    qrAria: string;
  };
  footer: {
    line: string;
    product: string;
    company: string;
    legal: string;
    about: string;
    support: string;
    privacy: string;
    terms: string;
    restaurant: string;
    restaurantSubject: string;
    language: string;
    copyright: string;
    appleCredit: string;
  };
  about: {
    eyebrow: string;
    title: string;
    body: string;
    second: string;
    back: string;
  };
}

export const COPY: Record<Lang, LandingCopy> = {
  fr: {
    features: [
      { title: 'Scanne le menu.', body: 'Une photo suffit.' },
      { title: 'Comprends chaque plat.', body: 'Des explications claires.' },
      { title: 'Reçois une recommandation.', body: 'Un choix adapté à tes préférences.' },
    ],
    chaosLines: ['14 plats.', 'Aucune photo.', 'Le serveur attend.'],
    skip: 'Aller au contenu',
    nav: {
      how: 'Comment ça marche',
      trust: 'Pourquoi Mishi',
      faq: 'FAQ',
      download: 'Télécharger',
      menu: 'Ouvrir le menu',
      close: 'Fermer le menu',
    },
    hero: {
      eyebrow: 'Ton guide de menu sur iPhone',
      title: 'Tu regardes le menu. Le menu te regarde.',
      sub: 'Une photo. Une recommandation. Moins de 60 secondes.',
      demo: 'Voir la démo',
      storeAria: 'Télécharger Mishi sur l’App Store',
      unavailable: 'Recevoir les nouvelles du lancement',
    },
    how: {
      eyebrow: 'Un menu flou devient un choix clair',
      title: 'Trois étapes. Un plat qui te ressemble.',
      intro: 'Mishi transforme une photo de menu en explications utiles, puis te propose un seul choix.',
      steps: [
        {
          number: '01',
          title: 'Scanne le menu.',
          body: 'Cadre la carte ou choisis une photo. Mishi lit aussi les menus sans images et tente les écritures manuscrites.',
          screen: '/screens/scan-fr.webp',
          alt: 'Écran de capture Mishi cadrant un menu européen fictif aux intitulés complexes',
        },
        {
          number: '02',
          title: 'Comprends chaque plat.',
          body: 'Retrouve une explication simple, les ingrédients habituels et une image clairement identifiée comme photo ou illustration.',
          screen: '/screens/understand-fr.webp',
          alt: 'Écran Mishi expliquant simplement une ballotine de volaille et ses termes culinaires',
        },
        {
          number: '03',
          title: 'Reçois une recommandation.',
          body: 'Mishi tient compte de tes goûts, de ton budget et de tes préférences pour mettre un choix en avant.',
          screen: '/screens/recommend-fr.webp',
          alt: 'Écran de recommandation Mishi mettant en avant un plat',
        },
      ],
    },
    trust: {
      eyebrow: 'Pourquoi faire confiance à Mishi',
      title: 'Mishi montre ce qu’il sait. Et ce qu’il ne sait pas.',
      intro: 'Chaque réponse distingue les faits, les estimations et ce que tu dois vérifier.',
      imageTitle: 'Images honnêtes',
      imageBody: 'Photo du plat, photo d’exemple ou illustration: l’origine du visuel reste toujours visible.',
      imageAlt: 'Écran Mishi avec une ballotine clairement identifiée comme photo d’exemple',
      preferenceTitle: 'Tes préférences comptent',
      preferenceBody: 'Goûts, budget et préférences alimentaires influencent la recommandation. Tu gardes la main.',
      preferenceAlt: 'Écran Mishi recommandant une ballotine selon les préférences et le budget',
      allergyTitle: 'Pour les allergies, vérifie toujours',
      allergyBody: 'Les ingrédients sont indicatifs. Pour une allergie, confirme toujours avec le restaurant.',
      allergyAlt: 'Écran Mishi signalant les produits laitiers et proposant de corriger un avertissement',
      privacyTitle: 'Ta photo ne reste pas',
      privacyBody: 'La photo originale du menu est supprimée du stockage au plus tard 24 heures après l’envoi.',
      privacyAlt: 'Écran de capture Mishi cadrant un menu fictif',
    },
    care: {
      eyebrow: 'Pensé pour voyager',
      title: 'Chaque menu mérite d’être compris.',
      body: 'Mishi aide chacun à comprendre un menu inconnu, en français ou en anglais, où qu’il soit.',
      link: 'Découvrir l’histoire de Mishi',
      sceneLabel: 'Scène illustrative',
    },
    faq: {
      eyebrow: 'Avant de scanner',
      title: 'Les réponses utiles.',
      items: [
        {
          question: 'Quels menus et langues sont pris en charge ?',
          answer: 'Mishi est conçu pour lire des menus photographiés en français et en anglais. La qualité dépend de la netteté, de la lumière et de la mise en page du menu.',
        },
        {
          question: 'Est-ce que les menus manuscrits fonctionnent ?',
          answer: 'Mishi essaie de les lire, mais une écriture difficile ou une photo floue peut produire un résultat incomplet. Tu peux vérifier et corriger ce qui a été reconnu.',
        },
        {
          question: 'Comment la recommandation est-elle choisie ?',
          answer: 'Elle combine les plats reconnus avec tes goûts, ton budget et les préférences que tu as indiquées. C’est une aide au choix, pas une garantie.',
        },
        {
          question: 'Puis-je utiliser Mishi pour une allergie ?',
          answer: 'Ne te fie jamais uniquement à Mishi pour une allergie ou un besoin médical. Confirme toujours les ingrédients et les risques de contamination avec le restaurant.',
        },
        {
          question: 'Que devient la photo du menu ?',
          answer: 'Elle sert à effectuer le scan et est supprimée du stockage au plus tard 24 heures après son envoi. Consulte la politique de confidentialité pour le détail.',
        },
        {
          question: 'Quand Mishi sera disponible sur Android ?',
          answer: 'Le lancement concerne iPhone uniquement. Aucune date Android n’est annoncée pour le moment.',
        },
        {
          question: 'Je suis restaurateur. Comment vous contacter ?',
          answer: 'Écris à contact@mishi.app. Nous serons ravis de comprendre ton menu et tes besoins.',
        },
      ],
    },
    final: {
      eyebrow: 'Ton prochain plat commence ici',
      title: 'Moins d’hésitation. Plus de découverte.',
      body: 'Scanne le code avec ton iPhone ou ouvre directement la fiche App Store.',
      qr: 'Scanner avec un iPhone',
      qrFallback: 'Nouvelles du lancement',
      qrAria: 'QR code vers la fiche App Store de Mishi',
    },
    footer: {
      line: 'Une photo de menu. Un choix plus clair.',
      product: 'Produit',
      company: 'Mishi',
      legal: 'Informations',
      about: 'À propos',
      support: 'Aide',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      restaurant: 'Restaurateur ? Écrivez-nous',
      restaurantSubject: 'Demande restaurant Mishi',
      language: 'Langue',
      copyright: 'Mishi. Tous droits réservés.',
      appleCredit: 'Apple et le logo Apple sont des marques d’Apple Inc., déposées aux États-Unis et dans d’autres pays. App Store est une marque de service d’Apple Inc.',
    },
    about: {
      eyebrow: 'Notre point de départ',
      title: 'La curiosité devrait gagner sur l’hésitation.',
      body: 'Mishi est né à Dakar, une ville où les tables, les langues et les cuisines se rencontrent. Nous construisons un guide simple pour les moments où un menu ne raconte pas encore assez.',
      second: 'Notre rôle est d’expliquer clairement, d’indiquer ce qui est certain et ce qui ne l’est pas, puis de t’aider à choisir sans prendre la place du restaurant.',
      back: 'Retour à l’accueil',
    },
  },
  en: {
    features: [
      { title: 'Scan the menu.', body: 'One photo is enough.' },
      { title: 'Understand every dish.', body: 'Clear, useful explanations.' },
      { title: 'Get one recommendation.', body: 'One choice shaped around your preferences.' },
    ],
    chaosLines: ['14 dishes.', 'No photos.', 'The waiter is waiting.'],
    skip: 'Skip to content',
    nav: {
      how: 'How it works',
      trust: 'Why Mishi',
      faq: 'FAQ',
      download: 'Download',
      menu: 'Open menu',
      close: 'Close menu',
    },
    hero: {
      eyebrow: 'Your iPhone menu guide',
      title: 'You read the menu. The menu reads you.',
      sub: 'One photo. One recommendation. Under 60 seconds.',
      demo: 'See the demo',
      storeAria: 'Download Mishi on the App Store',
      unavailable: 'Get launch updates',
    },
    how: {
      eyebrow: 'A confusing menu becomes a clear choice',
      title: 'Three steps. One dish that fits.',
      intro: 'Mishi turns a menu photo into useful explanations, then brings one choice forward.',
      steps: [
        {
          number: '01',
          title: 'Scan the menu.',
          body: 'Frame the menu or choose a photo. Mishi also reads menus without pictures and attempts handwritten ones.',
          screen: '/screens/scan-en.webp',
          alt: 'Mishi capture screen framing a fictional European menu with unfamiliar dish names',
        },
        {
          number: '02',
          title: 'Understand every dish.',
          body: 'See a plain explanation, usual ingredients, and an image clearly marked as a dish photo, example photo, or illustration.',
          screen: '/screens/understand-en.webp',
          alt: 'Mishi screen explaining a chicken ballotine and its culinary terms in plain language',
        },
        {
          number: '03',
          title: 'Get one recommendation.',
          body: 'Mishi considers your tastes, budget, and preferences to bring one choice forward.',
          screen: '/screens/recommend-en.webp',
          alt: 'Mishi recommendation screen highlighting one dish',
        },
      ],
    },
    trust: {
      eyebrow: 'Why trust Mishi',
      title: 'Mishi shows what it knows. And what it does not.',
      intro: 'Every answer separates facts, estimates, and what you still need to verify.',
      imageTitle: 'Honest images',
      imageBody: 'Dish photo, example photo, or illustration: the source of every visual stays visible.',
      imageAlt: 'Mishi screen with a chicken ballotine clearly identified as an example photo',
      preferenceTitle: 'Your preferences matter',
      preferenceBody: 'Taste, budget, and food preferences shape the recommendation. You stay in control.',
      preferenceAlt: 'Mishi screen recommending a chicken ballotine based on preferences and budget',
      allergyTitle: 'For allergies, always verify',
      allergyBody: 'Ingredients are indicative. For an allergy, always confirm with the restaurant.',
      allergyAlt: 'Mishi screen flagging dairy and offering a way to report a missing warning',
      privacyTitle: 'Your photo does not stay',
      privacyBody: 'The original menu photo is removed from storage no later than 24 hours after upload.',
      privacyAlt: 'Mishi capture screen framing a fictional menu',
    },
    care: {
      eyebrow: 'Made to travel',
      title: 'Every menu deserves to be understood.',
      body: 'Mishi helps anyone understand an unfamiliar menu, in French or English, wherever they are.',
      link: 'Read the Mishi story',
      sceneLabel: 'Illustrative scene',
    },
    faq: {
      eyebrow: 'Before you scan',
      title: 'Useful answers.',
      items: [
        {
          question: 'Which menus and languages are supported?',
          answer: 'Mishi is designed to read photographed menus in French and English. Quality depends on sharpness, lighting, and the menu layout.',
        },
        {
          question: 'Do handwritten menus work?',
          answer: 'Mishi attempts to read them, but difficult handwriting or a blurry photo can produce an incomplete result. You can review and correct what was recognized.',
        },
        {
          question: 'How is the recommendation chosen?',
          answer: 'It combines the recognized dishes with your tastes, budget, and stated preferences. It is decision support, not a guarantee.',
        },
        {
          question: 'Can I rely on Mishi for an allergy?',
          answer: 'Never rely on Mishi alone for an allergy or medical need. Always confirm ingredients and cross-contamination risks with the restaurant.',
        },
        {
          question: 'What happens to the menu photo?',
          answer: 'It is used to run the scan and removed from storage no later than 24 hours after upload. Read the privacy policy for details.',
        },
        {
          question: 'When will Mishi come to Android?',
          answer: 'The launch is iPhone only. There is no announced Android date at this time.',
        },
        {
          question: 'I run a restaurant. How can I reach you?',
          answer: 'Write to contact@mishi.app. We would be happy to learn about your menu and needs.',
        },
      ],
    },
    final: {
      eyebrow: 'Your next dish starts here',
      title: 'Less hesitation. More discovery.',
      body: 'Scan the code with your iPhone or open the App Store listing directly.',
      qr: 'Scan with an iPhone',
      qrFallback: 'Get launch updates',
      qrAria: 'QR code to the Mishi App Store listing',
    },
    footer: {
      line: 'One menu photo. One clearer choice.',
      product: 'Product',
      company: 'Mishi',
      legal: 'Information',
      about: 'About',
      support: 'Support',
      privacy: 'Privacy',
      terms: 'Terms',
      restaurant: 'Restaurant owner? Write to us',
      restaurantSubject: 'Mishi restaurant enquiry',
      language: 'Language',
      copyright: 'Mishi. All rights reserved.',
      appleCredit: 'Apple and the Apple logo are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc.',
    },
    about: {
      eyebrow: 'Where we started',
      title: 'Curiosity should win over hesitation.',
      body: 'Mishi was born in Dakar, a city where tables, languages, and cuisines meet. We are building a simple guide for moments when a menu does not tell you enough yet.',
      second: 'Our role is to explain clearly, show what is certain and what is not, then help you choose without taking the restaurant’s place.',
      back: 'Back to home',
    },
  },
};
