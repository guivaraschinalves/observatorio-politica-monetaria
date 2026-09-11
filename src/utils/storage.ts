import { TextAnnotation } from '../types/annotation';

const STORAGE_KEY = 'ftm_monetary_annotations_v1';

export function loadAnnotationsFromStorage(): TextAnnotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load annotations from localStorage:', err);
    return [];
  }
}

export function saveAnnotationsToStorage(annotations: TextAnnotation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  } catch (err) {
    console.error('Failed to save annotations to localStorage:', err);
  }
}
