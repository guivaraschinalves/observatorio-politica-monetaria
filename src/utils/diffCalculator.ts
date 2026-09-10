import * as Diff from 'diff';

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface ParagraphDiffResult {
  paragraphIndex: number;
  sectionTitle?: string;
  hasChanges: boolean;
  addedWordsCount: number;
  removedWordsCount: number;
  diffParts: DiffPart[];
  oldText: string;
  newText: string;
}

export interface StatementDiffComparison {
  meetingAId: string;
  meetingBId: string;
  totalAddedWords: number;
  totalRemovedWords: number;
  paragraphs: ParagraphDiffResult[];
}

export function computeStatementDiff(
  oldParagraphs: { text: string; section?: string }[],
  newParagraphs: { text: string; section?: string }[]
): StatementDiffComparison {
  const maxLength = Math.max(oldParagraphs.length, newParagraphs.length);
  const diffResults: ParagraphDiffResult[] = [];
  let totalAdded = 0;
  let totalRemoved = 0;

  for (let i = 0; i < maxLength; i++) {
    const oldP = oldParagraphs[i] ? oldParagraphs[i].text : '';
    const newP = newParagraphs[i] ? newParagraphs[i].text : '';
    const sectionTitle = newParagraphs[i]?.section || oldParagraphs[i]?.section || `Parágrafo ${i + 1}`;

    const parts = Diff.diffWordsWithSpace(oldP, newP);
    let pAdded = 0;
    let pRemoved = 0;

    parts.forEach(part => {
      const words = part.value.trim().split(/\s+/).filter(Boolean).length;
      if (part.added) pAdded += words;
      if (part.removed) pRemoved += words;
    });

    totalAdded += pAdded;
    totalRemoved += pRemoved;

    diffResults.push({
      paragraphIndex: i,
      sectionTitle,
      hasChanges: pAdded > 0 || pRemoved > 0,
      addedWordsCount: pAdded,
      removedWordsCount: pRemoved,
      diffParts: parts,
      oldText: oldP,
      newText: newP,
    });
  }

  return {
    meetingAId: '',
    meetingBId: '',
    totalAddedWords: totalAdded,
    totalRemovedWords: totalRemoved,
    paragraphs: diffResults,
  };
}
