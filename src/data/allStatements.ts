import copomRaw from './copom_comunicados_all.json';
import fomcRaw from './fomc_statements_all.json';

export interface RawStatement {
  id: string;
  meetingNumber: string;
  number?: number;
  date: string;
  title: string;
  paragraphs: string[];
  fullText: string;
}

export const allCopomStatements: RawStatement[] = copomRaw as RawStatement[];
export const allFomcStatements: RawStatement[] = fomcRaw as RawStatement[];
