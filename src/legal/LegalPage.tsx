import { useEffect, type ReactNode } from 'react';

import type { LegalPageKind } from './routes';

const titles: Record<LegalPageKind, string> = {
  privacy: 'Politique de confidentialité',
  support: 'Aide et demandes sur vos données',
  terms: 'Conditions d’utilisation',
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border py-8">
      <h2 className="font-display-small text-xl text-content-primary">{title}</h2>
      <div className="mt-3 space-y-3 font-sans text-base leading-7 text-content-secondary">
        {children}
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <>
      <Section title="Ce que Mishi traite">
        <p>
          Quand vous lancez un scan, Mishi reçoit la photo du menu, la langue choisie et, si
          vous le renseignez, le nom du restaurant. La photo sert à transcrire le menu et à
          produire les descriptions, images indicatives et recommandations affichées dans
          l’application.
        </p>
        <p>
          Mishi conserve aussi un identifiant aléatoire propre à l’installation, les résultats
          structurés du scan, vos corrections et retours, ainsi que les choix effectués dans une
          session partagée. Il n’y a ni compte nominatif, ni publicité, ni suivi entre les apps.
        </p>
      </Section>

      <Section title="Mesures d’usage facultatives">
        <p>
          Les mesures d’usage et de qualité sont désactivées par défaut. Si vous les activez
          depuis le Profil, Mishi peut recevoir les actions réalisées, la durée et le résultat
          des scans, les écrans consultés et les corrections. Vous pouvez retirer ce choix à
          tout moment au même endroit ; les événements non envoyés sont alors supprimés de
          l’appareil.
        </p>
      </Section>

      <Section title="Sous-traitants et finalités">
        <p>
          Les données sont utilisées pour fournir le scan, sécuriser le service, répondre aux
          demandes d’aide et, uniquement après activation, mesurer et améliorer le produit. La
          photo peut être transmise aux prestataires techniques et de traitement IA configurés
          par Mishi pour exécuter le scan. Ces données ne sont pas vendues et ne servent pas à
          la publicité ciblée.
        </p>
      </Section>

      <Section title="Conservation et suppression">
        <p>
          La photo originale du menu est supprimée du stockage au plus tard 24 heures après son
          envoi. Les résultats structurés, corrections, retours et événements activés sont
          conservés pour faire fonctionner et améliorer le service, jusqu’à ce qu’ils ne soient
          plus nécessaires ou que vous demandiez leur suppression.
        </p>
        <p>
          Dans l’application, ouvrez Profil → Données et confidentialité → « Demander la
          suppression de mes données ». La demande inclut votre identifiant d’installation afin
          que Mishi puisse retrouver les données concernées.
        </p>
      </Section>

      <Section title="Vos choix et contact">
        <p>
          Vous pouvez refuser la caméra et choisir une photo existante, retirer l’accès aux
          photos dans les réglages iOS, désactiver les mesures d’usage et demander l’accès, la
          rectification ou la suppression de vos données.
        </p>
        <p>
          Pour toute question :{' '}
          <a className="underline decoration-border-strong underline-offset-4" href="mailto:contact@mishi.app">
            contact@mishi.app
          </a>
          .
        </p>
      </Section>
    </>
  );
}

function Support() {
  return (
    <>
      <Section title="Obtenir de l’aide">
        <p>
          Décrivez le problème, le modèle d’iPhone, la version d’iOS et l’étape concernée. Ne
          joignez pas de photo contenant des informations que vous ne souhaitez pas partager.
        </p>
        <p>
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 py-3 font-sans-semibold text-accent-on"
            href="mailto:contact@mishi.app?subject=Mishi%20%E2%80%94%20demande%20d%E2%80%99aide">
            Écrire à contact@mishi.app
          </a>
        </p>
      </Section>

      <Section title="Supprimer vos données">
        <p>
          Utilisez le bouton prévu dans Profil → Données et confidentialité. Il prépare un
          message avec l’identifiant aléatoire de votre installation. Vous pouvez relire le
          message avant de l’envoyer.
        </p>
      </Section>

      <Section title="Signaler un menu partagé">
        <p>
          Ouvrez le menu dans l’application puis choisissez « Signaler ce menu partagé ». Mishi
          peut désactiver le lien concerné après vérification. Les sessions sont accessibles
          uniquement aux personnes qui possèdent leur lien ; il n’existe ni profil public, ni
          messagerie entre utilisateurs.
        </p>
      </Section>
    </>
  );
}

function Terms() {
  return (
    <>
      <Section title="Objet du service">
        <p>
          Mishi aide à lire un menu photographié et propose un choix à partir des informations
          qu’il parvient à reconnaître. La transcription, les descriptions, les images et les
          recommandations peuvent contenir des erreurs ou être incomplètes.
        </p>
      </Section>

      <Section title="Allergies et besoins médicaux">
        <p>
          Les indications alimentaires sont informatives. Mishi ne remplace ni le personnel du
          restaurant, ni l’étiquette officielle des ingrédients, ni un avis médical. En cas
          d’allergie, d’intolérance ou de besoin médical, vérifiez toujours directement les
          ingrédients et les risques de contamination croisée auprès du restaurant.
        </p>
      </Section>

      <Section title="Photos, corrections et partage">
        <p>
          Vous devez disposer du droit d’utiliser la photo envoyée. N’envoyez pas d’image
          contenant des données personnelles inutiles. Si vous partagez une session, toute
          personne possédant le lien peut consulter son contenu et participer au choix. Vous
          restez responsable des corrections que vous saisissez.
        </p>
      </Section>

      <Section title="Disponibilité et contact">
        <p>
          Le service peut évoluer, être interrompu ou limiter temporairement certains scans. Un
          usage abusif peut entraîner le blocage d’une requête ou la désactivation d’un lien
          partagé. Pour toute question, écrivez à{' '}
          <a className="underline decoration-border-strong underline-offset-4" href="mailto:contact@mishi.app">
            contact@mishi.app
          </a>
          .
        </p>
      </Section>
    </>
  );
}

export function LegalPage({ page }: { page: LegalPageKind }) {
  const title = titles[page];

  useEffect(() => {
    document.title = `${title} — Mishi`;
  }, [title]);

  return (
    <main data-legal className="min-h-screen bg-surface-canvas px-5 py-10 sm:px-8 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <header className="pb-10">
          <a href="/" className="inline-flex items-center gap-3 font-display-small text-xl text-content-primary">
            <span className="h-3 w-3 rounded-full bg-accent" aria-hidden="true" />
            Mishi
          </a>
          <p className="mt-12 font-sans-semibold text-xs uppercase tracking-widest text-content-secondary">
            Informations légales
          </p>
          <h1 className="mt-3 font-display-title text-4xl leading-tight text-content-primary sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 font-sans text-sm text-content-secondary">Mise à jour : 16 juillet 2026</p>
        </header>

        {page === 'privacy' ? <Privacy /> : page === 'support' ? <Support /> : <Terms />}

        <footer className="flex flex-wrap gap-x-5 gap-y-3 border-t border-border py-8 font-sans text-sm text-content-secondary">
          <a className="underline underline-offset-4" href="/privacy">Confidentialité</a>
          <a className="underline underline-offset-4" href="/terms">Conditions</a>
          <a className="underline underline-offset-4" href="/support">Aide</a>
          <a className="underline underline-offset-4" href="/">Retour à Mishi</a>
        </footer>
      </article>
    </main>
  );
}
