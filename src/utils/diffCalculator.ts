import * as Diff from 'diff';

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface ParagraphDiffResult {
  paragraphIndex: number;
  hasChanges: boolean;
  addedWordsCount: number;
  removedWordsCount: number;
  diffParts: DiffPart[];
  oldText: string;
  newText: string;
  oldPartsHighlight: DiffPart[];
  newPartsHighlight: DiffPart[];
}

export interface StatementDiffComparison {
  totalAddedWords: number;
  totalRemovedWords: number;
  paragraphs: ParagraphDiffResult[];
}

export function computeStatementDiff(
  oldParagraphs: string[],
  newParagraphs: string[]
): StatementDiffComparison {
  const maxLength = Math.max(oldParagraphs.length, newParagraphs.length);
  const diffResults: ParagraphDiffResult[] = [];
  let totalAdded = 0;
  let totalRemoved = 0;

  for (let i = 0; i < maxLength; i++) {
    const oldP = oldParagraphs[i] || '';
    const newP = newParagraphs[i] || '';

    const parts = Diff.diffWordsWithSpace(oldP, newP);
    let pAdded = 0;
    let pRemoved = 0;

    parts.forEach((part) => {
      const words = part.value.trim().split(/\s+/).filter(Boolean).length;
      if (part.added) pAdded += words;
      if (part.removed) pRemoved += words;
    });

    totalAdded += pAdded;
    totalRemoved += pRemoved;

    // For the left (old) side: highlight removed words
    // For the right (new) side: highlight added words
    const oldPartsHighlight: DiffPart[] = parts.filter((p) => !p.added);
    const newPartsHighlight: DiffPart[] = parts.filter((p) => !p.removed);

    diffResults.push({
      paragraphIndex: i,
      hasChanges: pAdded > 0 || pRemoved > 0,
      addedWordsCount: pAdded,
      removedWordsCount: pRemoved,
      diffParts: parts,
      oldText: oldP,
      newText: newP,
      oldPartsHighlight,
      newPartsHighlight,
    });
  }

  return {
    totalAddedWords: totalAdded,
    totalRemovedWords: totalRemoved,
    paragraphs: diffResults,
  };
}
