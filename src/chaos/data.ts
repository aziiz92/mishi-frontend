// Act 1 data — the menu labyrinth's panels. Dish names are the real ones
// (content/menu-lines.json, A7 composition); prices are deliberately
// generic and currency-free (DL59). 14 dishes across three panels — the
// held line's count is literal.

import data from '../../content/menu-panels.json';

export interface MenuItemData {
  id: string;
  name: string;
  description?: string;
  price: string;
}

export interface MenuPanelData {
  id: string;
  category: string;
  items: MenuItemData[];
}

export const CHAOS_PANELS: MenuPanelData[] = data.panels;
