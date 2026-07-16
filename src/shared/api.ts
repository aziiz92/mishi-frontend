export interface DishImage {
  url?: string | null;
  label: string;
  attribution?: string | null;
}

export interface DishTags {
  dietary?: string[] | null;
}

export interface SharedDish {
  id: string;
  name: string;
  section?: string | null;
  price?: string | null;
  simple_description?: string | null;
  image?: DishImage | null;
  tags?: DishTags | null;
}

export interface SharedMenu {
  scan_id: string;
  recommendation?: {
    recommended_dish_id?: string | null;
    reason?: string | null;
  } | null;
  dishes: SharedDish[];
}

export interface Leans {
  participants: number;
  leans: Array<{ dish_id: string; count: number }>;
}

export class SharedApiError extends Error {
  readonly kind: 'not_found' | 'rate_limited' | 'network' | 'invalid_response' | 'server';
  readonly status?: number;

  constructor(
    kind: 'not_found' | 'rate_limited' | 'network' | 'invalid_response' | 'server',
    status?: number,
  ) {
    super(kind);
    this.name = 'SharedApiError';
    this.kind = kind;
    this.status = status;
  }
}

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
export const API_URL = (configuredApiUrl || 'https://api.mishi.app').replace(/\/+$/, '');

if (import.meta.env.PROD && (!API_URL.startsWith('https://') || /localhost|127\.0\.0\.1/.test(API_URL))) {
  throw new Error('A production build requires a public HTTPS VITE_API_URL.');
}

const DEVICE_ID_KEY = 'mishi.web.device_id';
const DEVICE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let fallbackDeviceId: string | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === 'string';
}

function parseImage(value: unknown): DishImage | null | undefined {
  if (value === undefined || value === null) return value;
  if (!isRecord(value) || typeof value.label !== 'string') throw new SharedApiError('invalid_response');
  if (!isNullableString(value.url) || !isNullableString(value.attribution)) {
    throw new SharedApiError('invalid_response');
  }
  return { url: value.url, label: value.label, attribution: value.attribution };
}

function parseTags(value: unknown): DishTags | null | undefined {
  if (value === undefined || value === null) return value;
  if (!isRecord(value)) throw new SharedApiError('invalid_response');
  const dietary = value.dietary;
  if (
    dietary !== undefined &&
    dietary !== null &&
    (!Array.isArray(dietary) || dietary.some((tag) => typeof tag !== 'string'))
  ) {
    throw new SharedApiError('invalid_response');
  }
  return { dietary: dietary as string[] | null | undefined };
}

function parseDish(value: unknown): SharedDish {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') {
    throw new SharedApiError('invalid_response');
  }
  if (
    !isNullableString(value.section) ||
    !isNullableString(value.price) ||
    !isNullableString(value.simple_description)
  ) {
    throw new SharedApiError('invalid_response');
  }
  return {
    id: value.id,
    name: value.name,
    section: value.section,
    price: value.price,
    simple_description: value.simple_description,
    image: parseImage(value.image),
    tags: parseTags(value.tags),
  };
}

export function parseSharedMenu(value: unknown): SharedMenu {
  if (!isRecord(value) || typeof value.scan_id !== 'string' || !Array.isArray(value.dishes)) {
    throw new SharedApiError('invalid_response');
  }

  let recommendation: SharedMenu['recommendation'];
  if (value.recommendation === null || value.recommendation === undefined) {
    recommendation = value.recommendation;
  } else if (
    isRecord(value.recommendation) &&
    isNullableString(value.recommendation.recommended_dish_id) &&
    isNullableString(value.recommendation.reason)
  ) {
    recommendation = {
      recommended_dish_id: value.recommendation.recommended_dish_id,
      reason: value.recommendation.reason,
    };
  } else {
    throw new SharedApiError('invalid_response');
  }

  const dishes = value.dishes.map(parseDish);
  if (dishes.length === 0) throw new SharedApiError('invalid_response');
  return { scan_id: value.scan_id, recommendation, dishes };
}

export function parseLeans(value: unknown): Leans {
  if (
    !isRecord(value) ||
    !Number.isInteger(value.participants) ||
    (value.participants as number) < 0 ||
    !Array.isArray(value.leans)
  ) {
    throw new SharedApiError('invalid_response');
  }

  const leans = value.leans.map((lean) => {
    if (
      !isRecord(lean) ||
      typeof lean.dish_id !== 'string' ||
      !Number.isInteger(lean.count) ||
      (lean.count as number) < 1
    ) {
      throw new SharedApiError('invalid_response');
    }
    return { dish_id: lean.dish_id, count: lean.count as number };
  });

  return { participants: value.participants as number, leans };
}

async function requestJson<T>(
  path: string,
  parse: (value: unknown) => T,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new SharedApiError('network');
  }

  if (!response.ok) {
    if (response.status === 404) throw new SharedApiError('not_found', 404);
    if (response.status === 429) throw new SharedApiError('rate_limited', 429);
    throw new SharedApiError('server', response.status);
  }

  try {
    return parse(await response.json());
  } catch (error) {
    if (error instanceof SharedApiError) throw error;
    throw new SharedApiError('invalid_response');
  }
}

function createDeviceId(): string {
  if (typeof globalThis.crypto.randomUUID === 'function') return globalThis.crypto.randomUUID();

  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function getDeviceId(): string {
  if (fallbackDeviceId) return fallbackDeviceId;
  try {
    const stored = window.localStorage.getItem(DEVICE_ID_KEY);
    if (stored && DEVICE_ID_PATTERN.test(stored)) {
      fallbackDeviceId = stored;
      return stored;
    }
    const created = createDeviceId();
    window.localStorage.setItem(DEVICE_ID_KEY, created);
    fallbackDeviceId = created;
    return created;
  } catch {
    fallbackDeviceId = createDeviceId();
    return fallbackDeviceId;
  }
}

export function getSharedMenu(token: string, signal?: AbortSignal): Promise<SharedMenu> {
  return requestJson(`/shared/${encodeURIComponent(token)}`, parseSharedMenu, {
    headers: { 'Accept-Language': 'fr' },
    signal,
  });
}

export function getLeans(token: string, signal?: AbortSignal): Promise<Leans> {
  return requestJson(`/shared/${encodeURIComponent(token)}/leans`, parseLeans, {
    headers: { 'Accept-Language': 'fr' },
    signal,
  });
}

export function postLean(token: string, dishId: string | null): Promise<Leans> {
  return requestJson(`/shared/${encodeURIComponent(token)}/lean`, parseLeans, {
    method: 'POST',
    headers: {
      'Accept-Language': 'fr',
      'Content-Type': 'application/json',
      'X-Device-Id': getDeviceId(),
    },
    body: JSON.stringify({ dish_id: dishId }),
  });
}
