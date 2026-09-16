import { CopomVoteRecord, FomcVoteRecord } from '../types/monetary';
import copomDissentsRaw from './copom_dissents.json';
import fomcDissentsRaw from './fomc_dissents.json';

// Histórico completo de votações — ver scripts/fetch_copom_dissents.py
// (planilha oficial do Bacen, desde a 21ª reunião/1998) e
// scripts/fetch_fomc_dissents.py (planilha oficial do Fed de St. Louis,
// desde 1936). Atualiza sozinho todo dia.
export const copomVoteHistory: CopomVoteRecord[] = copomDissentsRaw as CopomVoteRecord[];
export const fomcVoteHistory: FomcVoteRecord[] = fomcDissentsRaw as FomcVoteRecord[];
