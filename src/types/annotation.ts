export type AnnotationType = 'highlight' | 'strikethrough' | 'note';
export type HighlightColor = 'yellow' | 'green' | 'red' | 'blue';
export type AnnotationTone = 'hawkish' | 'dovish' | 'neutral';

export interface TextAnnotation {
  id: string;
  documentId: string; // ex: 'copom-2026-03-statement'
  paragraphId: string;
  selectedText: string;
  startOffset?: number;
  endOffset?: number;
  type: AnnotationType;
  color?: HighlightColor;
  tone?: AnnotationTone;
  note?: string;
  createdAt: string;
}
