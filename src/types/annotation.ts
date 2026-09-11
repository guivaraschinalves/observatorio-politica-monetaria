export type AnnotationType = 'highlight' | 'strikethrough' | 'note';
export type HighlightColor = 'yellow' | 'green' | 'red' | 'blue';

export interface TextAnnotation {
  id: string;
  documentId: string; // ex: 'copom-2026-03-statement'
  paragraphId: string;
  selectedText: string;
  startOffset?: number;
  endOffset?: number;
  type: AnnotationType;
  color?: HighlightColor;
  note?: string;
  createdAt: string;
}
