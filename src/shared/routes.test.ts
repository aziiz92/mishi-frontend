import { describe, expect, it } from 'vitest';

import { sharedRouteFromPath } from './routes';

const token = 'AbCdEfGhIjKlMnOpQrStUvWxYz_12345';

describe('sharedRouteFromPath', () => {
  it('matches a valid share token with or without a trailing slash', () => {
    expect(sharedRouteFromPath(`/s/${token}`)).toEqual({ token });
    expect(sharedRouteFromPath(`/s/${token}/`)).toEqual({ token });
  });

  it('keeps malformed share paths on the unavailable shared-menu surface', () => {
    expect(sharedRouteFromPath('/s')).toEqual({ token: null });
    expect(sharedRouteFromPath('/s/too-short')).toEqual({ token: null });
    expect(sharedRouteFromPath('/s/not%2Fa%2Ftoken')).toEqual({ token: null });
  });

  it('does not claim unrelated landing or legal routes', () => {
    expect(sharedRouteFromPath('/')).toBeNull();
    expect(sharedRouteFromPath('/privacy')).toBeNull();
    expect(sharedRouteFromPath('/something/s/token')).toBeNull();
  });
});
