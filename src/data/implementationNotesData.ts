import fomcImplRaw from './fomc_implementation_notes.json';
import { RawStatement } from './allStatements';

// Nota de Implementação do FOMC — documento operacional separado, publicado
// junto com o comunicado desde 2016 (ver scripts/fetch_fomc_implementation_notes.py).
// Mesmo formato de RawStatement pra reaproveitar o StatementComparator sem
// mudança nenhuma nele.
export const fomcImplementationNotes: RawStatement[] = fomcImplRaw as RawStatement[];
