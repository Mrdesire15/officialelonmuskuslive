import { PageDefinition } from '../types';

export const PAGES_CONFIG: PageDefinition[] = [
  {
    id: 'executive',
    index: 0,
    numberStr: '01',
    name: 'Executive Command & Brief',
    shortLabel: 'Executive Brief',
    commandTitle: 'CMD-01: Executive Brief',
    commandDesc: 'DOGE leadership, core bio, famous quotes & VIP greet access',
    primaryActionLabel: 'Reserve VIP Plaque Pass',
    iconName: 'sparkles'
  },
  {
    id: 'enterprises',
    index: 1,
    numberStr: '02',
    name: 'Global Enterprise Grid',
    shortLabel: 'Enterprises',
    commandTitle: 'CMD-02: Frontier Ventures',
    commandDesc: 'SpaceX, Tesla, xAI, Neuralink, The Boring Company & Starlink',
    primaryActionLabel: 'Inspect Frontier Ventures',
    iconName: 'rocket'
  },
  {
    id: 'flying-roadster',
    index: 2,
    numberStr: '03',
    name: 'Tesla Flying Roadster Flight Lab',
    shortLabel: 'Flying Roadster',
    commandTitle: 'CMD-03: Flying Car Flight Lab',
    commandDesc: 'SpaceX cold gas thrusters, <1s 0-60, hover mode & $10k pre-order',
    primaryActionLabel: 'Pre-Order Flying Car ($10k+)',
    iconName: 'wind'
  },
  {
    id: 'showroom',
    index: 3,
    numberStr: '04',
    name: 'Tesla Vehicle Fleet Showroom',
    shortLabel: 'Tesla Fleet',
    commandTitle: 'CMD-04: Tesla Fleet Store',
    commandDesc: 'Model S Plaid, Cybertruck Cyberbeast, Model X, 3 & Y direct ordering',
    primaryActionLabel: 'Order Tesla Vehicle',
    iconName: 'car'
  },
  {
    id: 'shares',
    index: 4,
    numberStr: '05',
    name: 'Tesla Direct Equity & Share Allocation Desk',
    shortLabel: 'Tesla Shares',
    commandTitle: 'CMD-05: Treasury Equity Desk',
    commandDesc: 'NASDAQ: TSLA direct treasury shares, institutional blocks & DRS registry',
    primaryActionLabel: 'Acquire Tesla Shares',
    iconName: 'trending-up'
  },
  {
    id: 'gallery',
    index: 5,
    numberStr: '06',
    name: 'Official Photo Archive',
    shortLabel: 'Photo Archive',
    commandTitle: 'CMD-06: Curated HD Gallery',
    commandDesc: 'Curated historic captures, DOGE address, keynote and custom captions',
    primaryActionLabel: 'Launch Fullscreen Gallery',
    iconName: 'camera'
  }
];
