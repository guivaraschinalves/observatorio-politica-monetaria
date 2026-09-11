import { MeetingData } from '../types/monetary';
import copomMeetingsRaw from './copom_meetings.json';

// Comunicado + ata reais de cada reunião — ver scripts/fetch_copom_meetings.py.
// Cobre as reuniões desde 2020 (as atas mais antigas usam um formato de HTML
// que o parser não reconhece, ou não têm o texto integral disponível pela
// API do Bacen — ficam de fora em vez de entrar com dado incompleto).
export const copomMeetings: MeetingData[] = copomMeetingsRaw as MeetingData[];
