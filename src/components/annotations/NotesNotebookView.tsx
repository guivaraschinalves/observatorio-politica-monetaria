import React, { useState } from 'react';
import { useAnnotations } from '../../context/AnnotationContext';
import { exportAnnotationsToMarkdown } from '../../utils/storage';
import { Edit3, Download, Copy, Trash2, Check, MessageSquare } from 'lucide-react';

export const NotesNotebookView: React.FC = () => {
  const { annotations, removeAnnotation, updateAnnotationNote, clearDocAnnotations } = useAnnotations();
  const [copied, setCopied] = useState(false);
  const [filterDoc, setFilterDoc] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState<string>('');

  // Extract unique document IDs
  const docIds = Array.from(new Set(annotations.map((a) => a.documentId)));

  const filtered = filterDoc === 'all'
    ? annotations
    : annotations.filter((a) => a.documentId === filterDoc);

  const handleCopyMarkdown = () => {
    const md = exportAnnotationsToMarkdown('Compilado de Anotações do Observatório', filtered);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = exportAnnotationsToMarkdown('Compilado de Anotações do Observatório', filtered);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anotacoes-politica-monetaria-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const startEditNote = (id: string, currentNote: string = '') => {
    setEditingId(id);
    setEditNoteText(currentNote);
  };

  const saveEditNote = (id: string) => {
    updateAnnotationNote(id, editNoteText);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[var(--brand)] uppercase tracking-wider">
            <Edit3 className="w-4 h-4" />
            <span>Área de Trabalho do Analista</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-[var(--ink)] mt-1">
            Caderno de Anotações, Grifos & Riscos
          </h2>
          <p className="text-xs text-[var(--ink-muted)] mt-1 font-serif">
            Todos os trechos grifados ou riscados nos comunicados e atas ficam salvos no seu navegador.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterDoc !== 'all' && (
            <button
              onClick={() => clearDocAnnotations(filterDoc)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-semibold transition-colors border border-rose-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Este Doc</span>
            </button>
          )}
          <button
            onClick={handleCopyMarkdown}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--page-bg)] hover:bg-[var(--border)] text-[var(--ink)] rounded-lg text-xs font-semibold transition-colors border border-[var(--border)] disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado em Markdown!' : 'Copiar Markdown'}</span>
          </button>
          <button
            onClick={handleDownloadMarkdown}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--brand)] hover:opacity-90 text-white rounded-lg text-xs font-semibold transition-opacity shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Relatório .md</span>
          </button>
        </div>
      </div>

      {/* Filter by Document */}
      {docIds.length > 0 && (
        <div className="flex items-center gap-3 bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] text-xs">
          <span className="font-mono font-semibold text-[var(--ink-muted)] uppercase">Filtrar por Documento:</span>
          <select
            value={filterDoc}
            onChange={(e) => setFilterDoc(e.target.value)}
            className="bg-[var(--page-bg)] border border-[var(--border)] text-[var(--ink)] rounded-lg px-2.5 py-1 font-medium focus:outline-hidden"
          >
            <option value="all">Todos os documentos ({annotations.length})</option>
            {docIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Annotations List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-[var(--surface)] p-12 text-center rounded-xl border border-[var(--border)] text-[var(--ink-muted)] space-y-3">
            <div className="text-3xl">📝</div>
            <h3 className="text-base font-bold font-serif text-[var(--ink)]">
              Nenhuma anotação ou grifo registrado ainda
            </h3>
            <p className="text-xs text-[var(--ink-secondary)] max-w-md mx-auto font-serif">
              Navegue até o <strong>Comparador de Comunicados</strong> ou <strong>Leitor de Atas</strong>, selecione qualquer frase ou parágrafo com o mouse e clique para grifar, riscar ou adicionar sua nota de análise.
            </p>
          </div>
        ) : (
          filtered.map((ann) => (
            <div
              key={ann.id}
              className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs p-5 space-y-3 hover:border-[var(--brand)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      ann.type === 'strikethrough'
                        ? 'bg-[var(--border)] text-[var(--ink-secondary)]'
                        : ann.color === 'green'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : ann.color === 'red'
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                        : ann.color === 'blue'
                        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-400'
                        : 'bg-yellow-500/15 text-yellow-800 dark:text-yellow-300'
                    }`}
                  >
                    {ann.type === 'strikethrough' ? '<s>Riscado</s>' : `Grifo (${ann.color || 'amarelo'})`}
                  </span>

                  {ann.tone && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        ann.tone === 'hawkish'
                          ? 'bg-rose-700 text-white'
                          : 'bg-emerald-700 text-white'
                      }`}
                    >
                      {ann.tone}
                    </span>
                  )}

                  <span className="text-xs text-[var(--ink-muted)] font-mono">
                    Doc: {ann.documentId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--ink-muted)] font-mono">
                    {new Date(ann.createdAt).toLocaleDateString('pt-BR')} às {new Date(ann.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => removeAnnotation(ann.id)}
                    className="p-1 text-[var(--ink-muted)] hover:text-rose-600 rounded transition-colors"
                    title="Excluir marcação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quoted Text */}
              <blockquote className={`p-3 rounded-lg border-l-4 font-serif text-sm leading-relaxed ${
                ann.type === 'strikethrough'
                  ? 'bg-[var(--page-bg)] border-[var(--border)] text-[var(--ink-muted)] line-through'
                  : 'bg-[var(--page-bg)] border-amber-400 text-[var(--ink)]'
              }`}>
                "{ann.selectedText}"
              </blockquote>

              {/* Note / Commentary */}
              {editingId === ann.id ? (
                <div className="space-y-2 pt-1">
                  <textarea
                    value={editNoteText}
                    onChange={(e) => setEditNoteText(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] focus:outline-hidden focus:ring-1 focus:ring-[var(--brand)] font-serif"
                    placeholder="Escreva sua análise sobre este trecho..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveEditNote(ann.id)}
                      className="px-3 py-1 bg-[var(--brand)] text-white text-xs font-semibold rounded-md hover:opacity-90"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between bg-[var(--page-bg)] p-3 rounded-lg border border-[var(--border)] text-xs">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--ink)] mr-1">Anotação do Analista:</span>
                      <span className="text-[var(--ink-secondary)] font-serif">
                        {ann.note || <em className="text-[var(--ink-muted)]">Nenhum comentário textual.</em>}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => startEditNote(ann.id, ann.note)}
                    className="text-xs text-[var(--brand)] hover:underline font-medium ml-3 shrink-0"
                  >
                    {ann.note ? 'Editar' : '+ Comentar'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
