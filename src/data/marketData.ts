import { MarketOverview } from '../types/monetary';
import copomMarketRaw from './copom_market_overview.json';
import fomcMarketRaw from './fomc_market_overview.json';

// Dados reais extraídos da curva de juros futuros de DI1 (B3) — ver
// scripts/fetch_copom_probabilities.py. Atualiza sozinho todo dia.
export const copomMarketOverview: MarketOverview = copomMarketRaw as MarketOverview;

// Dados reais do Market Probability Tracker do Fed de Atlanta — ver
// scripts/fetch_fomc_probabilities.py. Atualiza sozinho todo dia (mesmo
// workflow que atualiza os comunicados).
export const fomcMarketOverview: MarketOverview = fomcMarketRaw as MarketOverview;
