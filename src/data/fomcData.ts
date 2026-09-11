import { MeetingData } from '../types/monetary';
import fomcMeetingsRaw from './fomc_meetings.json';

// Statement + minutes reais de cada reunião — ver scripts/fetch_fomc_meetings.py.
// Cobre as reuniões desde 2012 (reuniões sem minutes reconhecíveis no layout
// atual do site do Fed, ou sem range de juros resolvido no FRED, ficam de
// fora em vez de entrar com dado incompleto).
export const fomcMeetings: MeetingData[] = fomcMeetingsRaw as MeetingData[];
