import { SpeechItem } from '../types/monetary';
import fomcSpeechesRaw from './fomc_speeches.json';

// Discursos reais do FOMC, extraídos do feed oficial do Federal Reserve — ver
// scripts/fetch_fomc_speeches.py. Atualiza sozinho todo dia.
//
// O lado do Copom não tem discursos ainda: o conjunto anterior era conteúdo
// fictício (citações e transcrições inventadas atribuídas a pessoas reais),
// removido por não ser dado real. Falta achar uma fonte do Bacen equivalente
// ao feed do Fed antes de repovoar esse lado.
export const speechesData: SpeechItem[] = fomcSpeechesRaw as SpeechItem[];
