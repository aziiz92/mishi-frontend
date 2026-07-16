import { describe, expect, it } from 'vitest';

import { parseLeans, parseSharedMenu, SharedApiError } from './api';

describe('shared API response validation', () => {
  it('accepts the public ScanResults fields used by the page', () => {
    expect(
      parseSharedMenu({
        scan_id: 'scan-1',
        recommendation: { recommended_dish_id: 'dish-1', reason: 'Le choix le plus généreux.' },
        dishes: [
          {
            id: 'dish-1',
            name: 'Poulet yassa',
            price: '6 500 FCFA',
            image: { url: 'https://api.mishi.app/media/example', label: "Photo d'exemple" },
            tags: { dietary: ['halal'] },
          },
        ],
      }),
    ).toMatchObject({ dishes: [{ id: 'dish-1', name: 'Poulet yassa' }] });
  });

  it('rejects an empty or structurally invalid menu', () => {
    expect(() => parseSharedMenu({ scan_id: 'scan-1', dishes: [] })).toThrow(SharedApiError);
    expect(() => parseSharedMenu({ scan_id: 'scan-1', dishes: [{ id: 'dish-1' }] })).toThrow(
      SharedApiError,
    );
  });

  it('accepts valid aggregate leans and rejects impossible counts', () => {
    expect(parseLeans({ participants: 2, leans: [{ dish_id: 'dish-1', count: 2 }] })).toEqual({
      participants: 2,
      leans: [{ dish_id: 'dish-1', count: 2 }],
    });
    expect(() => parseLeans({ participants: -1, leans: [] })).toThrow(SharedApiError);
    expect(() => parseLeans({ participants: 1, leans: [{ dish_id: 'dish-1', count: 0 }] })).toThrow(
      SharedApiError,
    );
  });
});
