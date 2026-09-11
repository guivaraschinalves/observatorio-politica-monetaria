import React, { useState, useRef } from 'react';
import { useAnnotations } from '../../context/AnnotationContext';
import { FloatingToolbar } from './FloatingToolbar';
import { HighlightColor, AnnotationType } from '../../types/annotation';
import { MessageSquare, Trash2 } from 'lucide-react';

interface TextAnnotatorWrapperProps {
  documentId: string;
  paragraphId: string;
  text: string;
  className?: string;
}

export const TextAnnotatorWrapper: React.FC<TextAnnotatorWrapperProps> = ({
  documentId,
  paragraphId,
  text,
  className = '',
}) => {
  const { getParagraphAnnotations, addAnnotation, removeAnnotation } = useAnnotations();
  const annotations = getParagraphAnnotations(documentId, paragraphId);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectionRange, setSelectionRange] = useState<{
    text: string;
    position: { top: number; left: number };
  } | null>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const selectedStr = selection.toString().trim();
    if (selectedStr.length < 3) {
      setSelectionRange(null);
      return;
    }

    // Verify selection is within this paragraph
    if (containerRef.current && containerRef.current.contains(selection.anchorNode)) {
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setSelectionRange({
        text: selectedStr,
        position: {
          top: rect.top + window.scrollY,
          left: rect.left + rect.width / 2 + window.scrollX,
        },
      });
    }
  };

  const handleApplyAnnotation = (
    type: AnnotationType,
    color?: HighlightColor,
    note?: string
  ) => {
    if (!selectionRange) return;
    addAnnotation({
      documentId,
      paragraphId,
      selectedText: selectionRange.text,
      type,
      color,
      note,
    });
    setSelectionRange(null);
    window.getSelection()?.removeAllRanges();
  };

  // Render highlighted text segments if any annotations match
  const renderAnnotatedText = () => {
    if (annotations.length === 0) {
      return text;
    }

    // Sort annotations
    let renderedElements: React.ReactNode[] = [text];

    // For each annotation, replace occurrences in the text
    annotations.forEach((ann) => {
      const newElements: React.ReactNode[] = [];

      renderedElements.forEach((el, elIdx) => {
        if (typeof el !== 'string') {
          newElements.push(el);
          return;
        }

        const idx = el.indexOf(ann.selectedText);
        if (idx === -1) {
          newElements.push(el);
          return;
        }

        const before = el.substring(0, idx);
        const match = el.substring(idx, idx + ann.selectedText.length);
        const after = el.substring(idx + ann.selectedText.length);

        if (before) newElements.push(before);

        // Styling based on annotation type
        let styleClass = '';
        if (ann.type === 'strikethrough') {
          styleClass = 'line-through text-gray-400 bg-gray-100 px-0.5 rounded';
        } else if (ann.type === 'highlight') {
          switch (ann.color) {
            case 'green':
              styleClass = 'bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded border-b-2 border-emerald-400';
              break;
            case 'red':
              styleClass = 'bg-rose-100 text-rose-950 px-1 py-0.5 rounded border-b-2 border-rose-400';
              break;
            case 'blue':
              styleClass = 'bg-sky-100 text-sky-950 px-1 py-0.5 rounded border-b-2 border-sky-400';
              break;
            default:
              styleClass = 'bg-yellow-100 text-yellow-950 px-1 py-0.5 rounded border-b-2 border-yellow-400';
              break;
          }
        } else {
          styleClass = 'bg-indigo-50 text-indigo-950 px-1 py-0.5 rounded border-b-2 border-indigo-300';
        }

        newElements.push(
          <span
            key={`ann-${ann.id}-${elIdx}`}
            className={`group/mark relative inline cursor-pointer transition-colors ${styleClass}`}
          >
            {match}
            {/* Hover tooltip with delete & note details */}
            <span className="invisible group-hover/mark:visible absolute -top-8 left-0 z-30 bg-gray-900 text-white text-[11px] px-2 py-1 rounded shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              {ann.note ? (
                <span className="max-w-xs truncate font-normal text-blue-200">"{ann.note}"</span>
              ) : (
                <span>{ann.type === 'strikethrough' ? 'Riscado' : 'Grifado'}</span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAnnotation(ann.id);
                }}
                title="Remover marcação"
                className="text-gray-400 hover:text-rose-400 ml-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          </span>
        );

        if (after) newElements.push(after);
      });

      renderedElements = newElements;
    });

    return renderedElements;
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className={`relative select-text ${className}`}
    >
      <div className="leading-relaxed">{renderAnnotatedText()}</div>

      {/* If this paragraph has notes, show a subtle note badge on side */}
      {annotations.filter((a) => a.note).length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200 space-y-1.5">
          {annotations
            .filter((a) => a.note)
            .map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between bg-amber-50/70 border border-amber-200 text-amber-900 rounded-lg p-2 text-xs"
              >
                <div className="flex items-start gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800 mr-1">Sua Anotação:</span>
                    <span className="text-gray-700">{a.note}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeAnnotation(a.id)}
                  className="text-gray-400 hover:text-rose-600 p-0.5 ml-2"
                  title="Excluir nota"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Floating Toolbar when selecting text */}
      {selectionRange && (
        <FloatingToolbar
          position={selectionRange.position}
          selectedText={selectionRange.text}
          onApply={handleApplyAnnotation}
          onClose={() => setSelectionRange(null)}
        />
      )}
    </div>
  );
};
