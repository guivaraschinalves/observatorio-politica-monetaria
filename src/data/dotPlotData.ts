import { DotPlotRelease } from '../types/monetary';
import dotPlotRaw from './fomc_dotplot.json';

// Dados reais dos releases do Summary of Economic Projections (SEP) do FOMC
// — ver scripts/fetch_fomc_dotplot.py. Atualiza sozinho a cada trimestre
// (o Fed só publica um release novo em março/junho/setembro/dezembro).
export const fomcDotPlotReleases: DotPlotRelease[] = dotPlotRaw as DotPlotRelease[];
