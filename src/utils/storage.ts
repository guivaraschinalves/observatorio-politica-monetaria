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

export function exportAnnotationsToMarkdown(
  docTitle: string,
  annotations: TextAnnotation[]
): string {
  const lines: string[] = [
    `# Caderno de Anotações & Grifos: ${docTitle}`,
    `Data da exportação: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
    `Total de marcações: ${annotations.length}`,
    '',
    '---',
    ''
  ];

  if (annotations.length === 0) {
    lines.push('_Nenhuma anotação registrada neste documento._');
    return lines.join('\n');
  }

  annotations.forEach((ann, idx) => {
    const toneBadge = ann.tone ? ` [Tom: ${ann.tone.toUpperCase()}]` : '';
    const typeLabel = ann.type === 'highlight' 
      ? `🟡 Grifo (${ann.color || 'amarelo'})`
      : ann.type === 'strikethrough'
      ? '<s>Riscado</s>'
      : '📝 Nota';

    lines.push(`### ${idx + 1}. ${typeLabel}${toneBadge}`);
    lines.push(`> "${ann.selectedText}"`);
    lines.push('');
    if (ann.note) {
      lines.push(`**Anotação do Analista:**`);
      lines.push(`${ann.note}`);
      lines.push('');
    }
    lines.push(`_Criado em: ${new Date(ann.createdAt).toLocaleString('pt-BR')}_`);
    lines.push('');
  });

  return lines.join('\n');
}
