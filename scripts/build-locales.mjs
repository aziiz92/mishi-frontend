import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const canonicalBaseUrl = (process.env.VITE_CANONICAL_BASE_URL || 'https://mishi.app').replace(/\/$/, '');
const appStoreUrl = process.env.VITE_APP_STORE_URL?.trim() || 'https://apps.apple.com/app/mishi/id0000000000';
const campaignUrl = (lang) => {
  const url = new URL(appStoreUrl);
  url.searchParams.set('ct', `mishi_website_${lang}`);
  url.searchParams.set('mt', '8');
  return url.toString().replaceAll('&', '&amp;');
};
const index = readFileSync('dist/index.html', 'utf8')
  .replaceAll('https://mishi.app', canonicalBaseUrl)
  .replaceAll('https://apps.apple.com/app/mishi/id0000000000', campaignUrl('en'));

const english = index;
const french = index
  .replace('<html lang="en">', '<html lang="fr">')
  .replaceAll('Mishi | One photo. One recommendation.', 'Mishi | Une photo. Une recommandation.')
  .replaceAll(
    'Photograph a menu, understand every dish, and get a recommendation shaped around your tastes in under 60 seconds.',
    'Photographie un menu, comprends chaque plat et reçois une recommandation adaptée à tes goûts en moins de 60 secondes.',
  )
  .replaceAll('content="en_US"', 'content="fr_SN"')
  .replaceAll(`${canonicalBaseUrl}/en/`, `${canonicalBaseUrl}/fr/`)
  .replace(
    `rel="alternate" hreflang="en" href="${canonicalBaseUrl}/fr/"`,
    `rel="alternate" hreflang="en" href="${canonicalBaseUrl}/en/"`,
  )
  .replaceAll('href="/en/"', 'href="/fr/"')
  .replaceAll('Your iPhone menu guide', 'Ton guide de menu sur iPhone')
  .replaceAll('You read the menu. The menu reads you.', 'Tu regardes le menu. Le menu te regarde.')
  .replaceAll('One photo. One recommendation. Under 60 seconds.', 'Une photo. Une recommandation. Moins de 60 secondes.')
  .replaceAll('How it works', 'Comment ça marche')
  .replaceAll('Why Mishi', 'Pourquoi Mishi')
  .replaceAll('Get launch updates', 'Recevoir les nouvelles du lancement')
  .replaceAll('>Download<', '>Télécharger<')
  .replaceAll('Download on the App Store', 'Télécharger dans l’App Store')
  .replaceAll('See the demo', 'Voir la démo')
  .replaceAll('Mishi menu illustration', 'Illustration du menu Mishi')
  .replaceAll(campaignUrl('en'), campaignUrl('fr'));

mkdirSync('dist/en', { recursive: true });
mkdirSync('dist/fr', { recursive: true });
writeFileSync('dist/en/index.html', english);
writeFileSync('dist/fr/index.html', french);
writeFileSync('dist/index.html', english);

console.log('Localized static HTML written to /en/ and /fr/.');
