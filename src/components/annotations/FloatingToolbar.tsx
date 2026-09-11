import React, { useState } from 'react';
import { HighlightColor, AnnotationType } from '../../types/annotation';
import { Strikethrough, MessageSquare, X, Check } from 'lucide-react';

interface FloatingToolbarProps {
  position: { top: number; left: number };
  selectedText: string;
  onApply: (type: AnnotationType, color?: HighlightColor, note?: string) => void;
  onClose: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  position,
  selectedText,
  onApply,
  onClose,
}) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleQuickHighlight = (color: HighlightColor) => {
    onApply('highlight', color);
  };

  const handleStrikethrough = () => {
    onApply('strikethrough');
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    onApply('note', 'yellow', noteText);
    setShowNoteInput(false);
    setNoteText('');
  };

  return (
    <div
      style={{ top: `${Math.max(10, position.top - 50)}px`, left: `${Math.max(10, position.left)}px` }}
      className="fixed z-50 transform -translate-x-1/2 bg-gray-900 text-white rounded-xl shadow-2xl px-2.5 py-1.5 flex flex-col gap-2 border border-gray-700 animate-in fade-in zoom-in-95 duration-150"
    >
      {!showNoteInput ? (
        <div className="flex items-center space-x-1.5 text-xs">
          {/* Colors for highlight */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-700">
            <button
              onClick={() => handleQuickHighlight('yellow')}
              title="Grifar Amarelo"
              className="w-5 h-5 rounded-full bg-yellow-400 hover:scale-110 transition-transform ring-1 ring-white/40"
            />
            <button
              onClick={() => handleQuickHighlight('green')}
              title="Grifar Verde"
              className="w-5 h-5 rounded-full bg-emerald-500 hover:scale-110 transition-transform ring-1 ring-white/40"
            />
            <button
              onClick={() => handleQuickHighlight('red')}
              title="Grifar Vermelho"
              className="w-5 h-5 rounded-full bg-rose-500 hover:scale-110 transition-transform ring-1 ring-white/40"
            />
            <button
              onClick={() => handleQuickHighlight('blue')}
              title="Grifar Azul"
              className="w-5 h-5 rounded-full bg-sky-500 hover:scale-110 transition-transform ring-1 ring-white/40"
            />
          </div>

          {/* Strikethrough action */}
          <button
            onClick={handleStrikethrough}
            title="Riscar texto (Strikethrough)"
            className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-800 text-gray-200 transition-colors"
          >
            <Strikethrough className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Riscar</span>
          </button>

          {/* Add Note action */}
          <button
            onClick={() => setShowNoteInput(true)}
            title="Adicionar Nota / Comentário"
            className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-800 text-blue-300 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Comentar</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Note input sub-panel */
        <div className="w-72 p-1">
          <div className="text-[11px] text-gray-300 mb-1 truncate italic">
            "{selectedText}"
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Digite sua reflexão de análise ou tese..."
            rows={2}
            autoFocus
            className="w-full bg-gray-800 text-white text-xs rounded-lg p-2 border border-gray-700 focus:outline-hidden focus:border-blue-500 resize-none placeholder-gray-500"
          />
          <div className="flex items-center justify-end mt-1.5">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setShowNoteInput(false)}
                className="px-2 py-1 text-[11px] text-gray-400 hover:text-white"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold"
              >
                <Check className="w-3 h-3" />
                Salvar Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
