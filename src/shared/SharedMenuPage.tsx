import { useEffect, useMemo, useState } from 'react';

import {
  getLeans,
  getSharedMenu,
  postLean,
  SharedApiError,
  type Leans,
  type SharedDish,
  type SharedMenu,
} from './api';

type PageState =
  | { status: 'loading' }
  | { status: 'ready'; menu: SharedMenu }
  | { status: 'error'; kind: 'not_found' | 'unavailable' };

const EMPTY_LEANS: Leans = { participants: 0, leans: [] };

function localChoiceKey(token: string) {
  return `mishi.share.lean.${token}`;
}

function readLocalChoice(token: string): string | null {
  try {
    return window.localStorage.getItem(localChoiceKey(token));
  } catch {
    return null;
  }
}

function saveLocalChoice(token: string, dishId: string | null) {
  try {
    if (dishId) window.localStorage.setItem(localChoiceKey(token), dishId);
    else window.localStorage.removeItem(localChoiceKey(token));
  } catch {
    // A private browsing quota must not prevent a table choice.
  }
}

function DishPicture({ dish, eager = false }: { dish: SharedDish; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const image = dish.image;

  if (!image?.url || failed) {
    return (
      <div className="flex min-h-48 items-end bg-surface-sunken p-4" aria-hidden="true">
        <span className="font-sans text-xs text-content-tertiary">Image indisponible</span>
      </div>
    );
  }

  return (
    <figure>
      <div className="relative overflow-hidden bg-surface-sunken">
        <img
          src={image.url}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          onError={() => setFailed(true)}
          className="h-56 w-full object-cover sm:h-64"
        />
        <figcaption className="absolute bottom-3 left-3 rounded-sm bg-surface-raised px-2 py-1 font-sans text-xs text-content-secondary shadow-sm">
          {image.label}
        </figcaption>
      </div>
      {image.attribution && (
        <p className="px-4 pt-2 font-sans text-xs text-content-tertiary">{image.attribution}</p>
      )}
    </figure>
  );
}

function ChoiceButton({
  dishId,
  dishName,
  count,
  selected,
  disabled,
  pending,
  onChoose,
}: {
  dishId: string;
  dishName: string;
  count: number;
  selected: boolean;
  disabled: boolean;
  pending: boolean;
  onChoose: (dishId: string | null, sourceDishId: string) => void;
}) {
  const countLabel = count === 0 ? 'Aucun choix' : `${count} choix`;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-pressed={selected}
        aria-label={selected ? `Retirer mon choix pour ${dishName}` : `Choisir ${dishName}`}
        disabled={disabled}
        onClick={() => onChoose(selected ? null : dishId, dishId)}
        className={`min-h-11 rounded-full px-5 py-2.5 font-sans-semibold text-sm transition-colors duration-fast ease-standard focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary disabled:cursor-wait disabled:opacity-60 ${
          selected
            ? 'bg-surface-inverse text-content-inverse'
            : 'border border-border-strong bg-surface-raised text-content-primary hover:bg-surface-sunken'
        }`}>
        {pending ? 'Mise à jour…' : selected ? 'Mon choix' : 'Je choisis ce plat'}
      </button>
      <span className="font-sans text-sm tabular-nums text-content-secondary">{countLabel}</span>
    </div>
  );
}

function DishContent({ dish }: { dish: SharedDish }) {
  const dietary = dish.tags?.dietary ?? [];
  return (
    <div className="p-5 sm:p-6">
      {dish.section && (
        <p className="font-sans-semibold text-xs uppercase tracking-widest text-content-secondary">
          {dish.section}
        </p>
      )}
      <div className="mt-1 flex items-start justify-between gap-4">
        <h3 className="break-words font-display-title text-2xl leading-tight text-content-primary">{dish.name}</h3>
        {dish.price && (
          <p className="shrink-0 font-sans-medium text-sm tabular-nums text-content-primary">
            {dish.price}
          </p>
        )}
      </div>
      {dish.simple_description && (
        <p className="mt-3 font-sans text-sm leading-6 text-content-secondary">
          {dish.simple_description}
        </p>
      )}
      {dietary.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Informations alimentaires">
          {dietary.map((tag) => (
            <span
              key={tag}
              className="rounded-sm bg-signal-dietary px-2.5 py-1 font-sans text-xs text-signal-dietary-on">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <main data-shared className="min-h-screen bg-surface-canvas px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl" role="status" aria-live="polite">
        <div className="h-5 w-24 animate-pulse rounded-full bg-surface-sunken" />
        <div className="mt-16 h-10 w-4/5 animate-pulse rounded-md bg-surface-sunken sm:w-1/2" />
        <div className="mt-4 h-5 w-2/3 animate-pulse rounded-md bg-surface-sunken" />
        <div className="mt-10 h-96 animate-pulse rounded-xl bg-surface-raised" />
        <span className="sr-only">Chargement du menu partagé</span>
      </div>
    </main>
  );
}

function ErrorState({ kind, onRetry }: { kind: 'not_found' | 'unavailable'; onRetry?: () => void }) {
  const missing = kind === 'not_found';
  return (
    <main data-shared className="flex min-h-screen items-center bg-surface-canvas px-5 py-12">
      <section className="mx-auto w-full max-w-xl rounded-xl border border-border bg-surface-raised p-7 sm:p-10">
        <a href="/" className="inline-flex items-center gap-3 font-display-small text-xl text-content-primary">
          <span className="h-3 w-3 rounded-full bg-accent" aria-hidden="true" />
          Mishi
        </a>
        <p className="mt-14 font-sans-semibold text-xs uppercase tracking-widest text-content-secondary">
          Menu partagé
        </p>
        <h1 className="mt-3 font-display-title text-4xl leading-tight text-content-primary">
          {missing ? "Ce menu n'est plus disponible." : 'Le menu ne peut pas être chargé.'}
        </h1>
        <p className="mt-4 font-sans text-base leading-7 text-content-secondary">
          {missing
            ? "Le lien est incomplet, a expiré ou a été désactivé. Demandez un nouveau partage à la personne qui l'a envoyé."
            : 'Vérifiez votre connexion puis réessayez. Aucun choix ne sera enregistré tant que le menu reste inaccessible.'}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="min-h-11 rounded-full bg-accent px-5 py-2.5 font-sans-semibold text-accent-on focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary">
              Réessayer
            </button>
          )}
          <a
            href="/support"
            className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-5 py-2.5 font-sans-semibold text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary">
            Obtenir de l’aide
          </a>
        </div>
      </section>
    </main>
  );
}

export function SharedMenuPage({ token }: { token: string | null }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<PageState>(token ? { status: 'loading' } : { status: 'error', kind: 'not_found' });
  const [leans, setLeans] = useState<Leans>(EMPTY_LEANS);
  const [myChoice, setMyChoice] = useState<string | null>(() => (token ? readLocalChoice(token) : null));
  const [busyDish, setBusyDish] = useState<string | null>(null);
  const [leanError, setLeanError] = useState(false);

  useEffect(() => {
    document.title = 'Menu partagé — Mishi';
    return () => {
      document.title = 'Mishi — Une photo. Une recommandation. Moins de 60 secondes.';
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();

    void Promise.allSettled([
      getSharedMenu(token, controller.signal),
      getLeans(token, controller.signal),
    ]).then(([menuResult, leansResult]) => {
      if (controller.signal.aborted) return;
      if (menuResult.status === 'rejected') {
        const notFound = menuResult.reason instanceof SharedApiError && menuResult.reason.kind === 'not_found';
        setState({ status: 'error', kind: notFound ? 'not_found' : 'unavailable' });
        return;
      }
      setState({ status: 'ready', menu: menuResult.value });
      if (leansResult.status === 'fulfilled') setLeans(leansResult.value);
    });

    return () => controller.abort();
  }, [attempt, token]);

  useEffect(() => {
    if (!token || state.status !== 'ready') return;
    let controller: AbortController | null = null;
    const refresh = () => {
      if (document.visibilityState === 'hidden') return;
      controller?.abort();
      controller = new AbortController();
      void getLeans(token, controller.signal)
        .then(setLeans)
        .catch(() => undefined);
    };
    const interval = window.setInterval(refresh, 3000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
      controller?.abort();
    };
  }, [state.status, token]);

  const counts = useMemo(
    () => new Map(leans.leans.map((lean) => [lean.dish_id, lean.count])),
    [leans],
  );

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') {
    const retry =
      state.kind === 'unavailable'
        ? () => {
            setState({ status: 'loading' });
            setLeanError(false);
            setAttempt((value) => value + 1);
          }
        : undefined;
    return <ErrorState kind={state.kind} onRetry={retry} />;
  }

  const menu = state.menu;
  const recommendedId = menu.recommendation?.recommended_dish_id;
  const recommended = menu.dishes.find((dish) => dish.id === recommendedId) ?? null;
  const otherDishes = recommended
    ? menu.dishes.filter((dish) => dish.id !== recommended.id)
    : menu.dishes;

  const choose = async (dishId: string | null, sourceDishId: string) => {
    if (!token || busyDish !== null) return;
    setBusyDish(sourceDishId);
    setLeanError(false);
    try {
      const next = await postLean(token, dishId);
      setLeans(next);
      setMyChoice(dishId);
      saveLocalChoice(token, dishId);
    } catch {
      setLeanError(true);
    } finally {
      setBusyDish(null);
    }
  };

  const participantLabel =
    leans.participants === 0
      ? 'Soyez la première personne à choisir.'
      : `${leans.participants} ${leans.participants === 1 ? 'personne a' : 'personnes ont'} choisi.`;
  const reportHref = `mailto:contact@mishi.app?subject=${encodeURIComponent('Mishi — signaler un menu partagé')}&body=${encodeURIComponent(`Lien concerné : ${window.location.href}\n\nMotif du signalement : `)}`;

  return (
    <main data-shared className="min-h-screen bg-surface-canvas">
      <header className="border-b border-border px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-5">
          <a href="/" className="inline-flex items-center gap-3 font-display-small text-xl text-content-primary">
            <span className="h-3 w-3 rounded-full bg-accent" aria-hidden="true" />
            Mishi
          </a>
          <p className="font-sans text-sm text-content-secondary">{participantLabel}</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
        <section aria-labelledby="shared-menu-title" className="max-w-3xl">
          <p className="font-sans-semibold text-xs uppercase tracking-widest text-content-secondary">
            À table
          </p>
          <h1
            id="shared-menu-title"
            className="mt-3 font-display-hero text-4xl leading-tight text-content-primary sm:text-6xl">
            Le menu partagé avec vous.
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-base leading-7 text-content-secondary sm:text-lg">
            Découvrez les plats, puis indiquez celui qui vous tente. Les choix de la table se mettent à jour en direct.
          </p>
        </section>

        {leanError && (
          <p role="alert" className="mt-6 rounded-md border border-signal-error px-4 py-3 font-sans text-sm text-content-error">
            Votre choix n’a pas été enregistré. Attendez un instant puis réessayez.
          </p>
        )}

        {recommended && (
          <section aria-labelledby="mishi-pick-title" className="mt-12">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-accent" aria-hidden="true" />
              <h2 id="mishi-pick-title" className="font-sans-semibold text-sm uppercase tracking-widest text-content-primary">
                Le choix Mishi
              </h2>
            </div>
            <article className="overflow-hidden rounded-xl border border-border bg-surface-raised shadow-[0px_6px_20px_rgba(28,23,20,0.08)] md:grid md:grid-cols-[1.05fr_0.95fr]">
              <DishPicture dish={recommended} eager />
              <div className="flex flex-col justify-center">
                <DishContent dish={recommended} />
                <div className="border-t border-border px-5 pb-6 sm:px-6">
                  {menu.recommendation?.reason && (
                    <p className="pt-5 font-display-small text-lg leading-7 text-content-primary">
                      {menu.recommendation.reason}
                    </p>
                  )}
                  <ChoiceButton
                    dishId={recommended.id}
                    dishName={recommended.name}
                    count={counts.get(recommended.id) ?? 0}
                    selected={myChoice === recommended.id}
                    disabled={busyDish !== null}
                    pending={busyDish === recommended.id}
                    onChoose={choose}
                  />
                </div>
              </div>
            </article>
          </section>
        )}

        <section aria-labelledby="all-dishes-title" className="mt-14">
          <div className="flex items-end justify-between gap-5 border-b border-border pb-4">
            <h2 id="all-dishes-title" className="font-display-title text-3xl text-content-primary">
              {recommended ? 'Les autres plats' : 'Les plats'}
            </h2>
            <span className="font-sans text-sm tabular-nums text-content-secondary">
              {otherDishes.length} {otherDishes.length === 1 ? 'plat' : 'plats'}
            </span>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {otherDishes.map((dish) => (
              <article key={dish.id} className="overflow-hidden rounded-xl border border-border bg-surface-raised">
                <DishPicture dish={dish} />
                <DishContent dish={dish} />
                <div className="border-t border-border px-5 pb-6 sm:px-6">
                  <ChoiceButton
                    dishId={dish.id}
                    dishName={dish.name}
                    count={counts.get(dish.id) ?? 0}
                    selected={myChoice === dish.id}
                    disabled={busyDish !== null}
                    pending={busyDish === dish.id}
                    onChoose={choose}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t border-border py-8 font-sans text-sm text-content-secondary">
          <p>
            Les descriptions et informations alimentaires peuvent être incomplètes. En cas d’allergie, vérifiez toujours auprès du restaurant.
          </p>
          <nav aria-label="Liens du menu partagé" className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
            <a className="underline underline-offset-4" href={reportHref}>Signaler ce menu</a>
            <a className="underline underline-offset-4" href="/privacy">Confidentialité</a>
            <a className="underline underline-offset-4" href="/terms">Conditions</a>
            <a className="underline underline-offset-4" href="/">Découvrir Mishi</a>
          </nav>
        </footer>
      </div>
    </main>
  );
}
