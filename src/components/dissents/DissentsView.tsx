import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Committee, CopomVoteRecord, FomcVoteRecord } from '../../types/monetary';
import { Gavel, X } from 'lucide-react';

interface DissentsViewProps {
  committee: Committee;
  copomVotes: CopomVoteRecord[];
  fomcVotes: FomcVoteRecord[];
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${Number(d)} ${meses[Number(m) - 1]}/${y}`;
}

// Paleta estável: cada presidente/chair pega uma cor, na ordem em que aparece
// no histórico (do mais antigo pro mais recente).
const PALETA = ['#2a78d6', '#c2410c', '#0891b2', '#7c3aed', '#b45309', '#0d9488', '#be123c', '#4d7c0f'];

function useCoresPorPresidente(nomes: (string | null)[]): Map<string, string> {
  return useMemo(() => {
    const mapa = new Map<string, string>();
    let i = 0;
    for (const nome of nomes) {
      if (nome && !mapa.has(nome)) {
        mapa.set(nome, PALETA[i % PALETA.length]);
        i++;
      }
    }
    return mapa;
  }, [nomes]);
}

interface Barra {
  id: string;
  label: string;
  ano: number;
  valor: number; // número real de votos contrários (não normalizado)
  cor: string;
  presidente: string | null;
}

const ALTURA_GRAFICO = 420; // px — "mais comprido" pedido foi altura, não largura
const LARGURA_BARRA = 4;
const GAP_BARRA = 3;
const PASSO = LARGURA_BARRA + GAP_BARRA;

const GraficoBarras: React.FC<{ barras: Barra[]; onClickBarra: (id: string) => void }> = ({ barras, onClickBarra }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [barras.length]);

  const presidentesNaOrdem = useMemo(() => {
    const vistos: string[] = [];
    for (const b of barras) {
      if (b.presidente && !vistos.includes(b.presidente)) vistos.push(b.presidente);
    }
    return vistos;
  }, [barras]);

  const maxValor = useMemo(() => Math.max(1, ...barras.map((b) => b.valor)), [barras]);

  // Eixo Y: 0, e mais 3 marcações redondas até o máximo real do conjunto.
  const marcacoesY = useMemo(() => {
    const passos = [1, 2, 5, 10, 20, 25, 50, 100];
    const passo = passos.find((p) => p * 4 >= maxValor) || passos[passos.length - 1];
    const valores: number[] = [];
    for (let v = 0; v <= maxValor + 0.001; v += passo) valores.push(v);
    if (valores[valores.length - 1] < maxValor) valores.push(valores[valores.length - 1] + passo);
    return valores;
  }, [maxValor]);
  const escalaMax = marcacoesY[marcacoesY.length - 1] || 1;

  // Eixo X: um traço por ano em que há reunião; texto só numa amostra pra
  // não empilhar números (mais espaçado quanto mais anos no histórico).
  const marcacoesX = useMemo(() => {
    const primeiraDoAno = new Map<number, number>();
    barras.forEach((b, idx) => {
      if (!primeiraDoAno.has(b.ano)) primeiraDoAno.set(b.ano, idx);
    });
    const anos = Array.from(primeiraDoAno.keys()).sort((a, b) => a - b);
    const passoRotulo = anos.length > 40 ? 10 : anos.length > 15 ? 5 : 1;
    return anos.map((ano, i) => ({
      ano,
      idx: primeiraDoAno.get(ano)!,
      comRotulo: i % passoRotulo === 0,
    }));
  }, [barras]);

  return (
    <div className="space-y-3">
      {presidentesNaOrdem.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--ink-muted)]">
          {presidentesNaOrdem.map((nome) => {
            const cor = barras.find((b) => b.presidente === nome)?.cor;
            return (
              <span key={nome} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: cor }} />
                {nome}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
        {/* Eixo Y */}
        <div className="relative shrink-0 w-8 text-right pr-2" style={{ height: ALTURA_GRAFICO }}>
          {marcacoesY.map((v) => (
            <div
              key={v}
              className="absolute right-2 -translate-y-1/2 text-[10px] font-mono text-[var(--ink-muted)]"
              style={{ bottom: `${(v / escalaMax) * ALTURA_GRAFICO}px` }}
            >
              {v}
            </div>
          ))}
          <div className="absolute -bottom-4 right-2 text-[9px] text-[var(--ink-muted)] whitespace-nowrap">votos</div>
        </div>

        <div ref={scrollRef} className="overflow-x-auto flex-1 border-l border-[var(--border)] pl-2">
          <div style={{ width: barras.length * PASSO }}>
            <div className="relative flex items-end" style={{ height: ALTURA_GRAFICO }}>
              {/* linhas-guia do eixo Y */}
              {marcacoesY.map((v) => (
                <div
                  key={v}
                  className="absolute left-0 right-0 border-t border-dashed border-[var(--border)]"
                  style={{ bottom: `${(v / escalaMax) * ALTURA_GRAFICO}px` }}
                />
              ))}
              {barras.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onClickBarra(b.id)}
                  title={`${b.label} — ${b.valor} voto(s) contrário(s)`}
                  className="shrink-0 rounded-t-sm transition-opacity hover:opacity-70 relative"
                  style={{
                    width: LARGURA_BARRA,
                    marginRight: GAP_BARRA,
                    height: `${Math.max((b.valor / escalaMax) * 100, 1.5)}%`,
                    background: b.cor,
                    opacity: b.valor > 0 ? 1 : 0.35,
                  }}
                />
              ))}
            </div>

            {/* Eixo X */}
            <div className="relative h-5 mt-1">
              {marcacoesX.map(({ ano, idx, comRotulo }) => (
                <div
                  key={ano}
                  className="absolute top-0 border-l border-[var(--border)]"
                  style={{ left: idx * PASSO, height: comRotulo ? 6 : 3 }}
                />
              ))}
              {marcacoesX.filter((m) => m.comRotulo).map(({ ano, idx }) => (
                <div
                  key={ano}
                  className="absolute top-1.5 text-[10px] font-mono text-[var(--ink-muted)] -translate-x-1/2"
                  style={{ left: idx * PASSO }}
                >
                  {ano}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-[var(--ink-muted)]">
        Cada barra é uma reunião, da mais antiga (esquerda) à mais recente (direita) — altura proporcional ao
        número de votos contrários à decisão. Clique numa barra pra ver os detalhes daquela reunião.
      </p>
    </div>
  );
};

function bps(v: number | null): { texto: string; classe: string } {
  if (v === null || v === undefined) {
    return { texto: '', classe: 'text-[var(--ink-muted)]' };
  }
  if (v === 0) {
    return { texto: '0bps', classe: 'text-[var(--ink-muted)]' };
  }
  return {
    texto: `${v > 0 ? '+' : ''}${v}bps`,
    classe: v > 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold',
  };
}

const CopomDetalhe: React.FC<{ v: CopomVoteRecord }> = ({ v }) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-sm font-bold text-[var(--ink)]">{v.meetingNumber}</span>
      <span className="text-xs text-[var(--ink-muted)] font-mono">{formatDate(v.date)}</span>
      {v.rateDecision && (
        <span className="text-xs bg-[var(--page-bg)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono text-[var(--ink)]">
          {v.rateDecision}
        </span>
      )}
      {v.chair && <span className="text-xs text-[var(--ink-muted)]">Presidente: {v.chair}</span>}
    </div>
    <span
      className={`inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${
        v.unanimous ? 'text-[var(--ink-muted)] border-[var(--border)]' : 'text-[var(--brand)] border-[var(--brand)] bg-[var(--accent-wash)]'
      }`}
    >
      {v.placar}
    </span>
    <div className="flex flex-wrap gap-2">
      {v.votes.map((vote, idx) => {
        const b = bps(vote.preferredChangeBps);
        return (
          <span key={idx} className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)]">
            {vote.name ?? `${vote.count ?? '?'} membro(s)`}
            {vote.preferredChangeBps !== null && <>: <span className={b.classe}>{b.texto}</span></>}
          </span>
        );
      })}
    </div>
  </div>
);

const FomcDetalhe: React.FC<{ v: FomcVoteRecord }> = ({ v }) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-sm font-bold text-[var(--ink)]">{formatDate(v.date)}</span>
      {v.chair && <span className="text-xs text-[var(--ink-muted)]">Chair: {v.chair}</span>}
      <span className="text-xs bg-[var(--page-bg)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono text-[var(--ink)]">
        {v.votesFor}x{v.votesAgainst}
      </span>
    </div>
    {v.dissenters.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {v.dissenters.map((d, idx) => {
          const b = bps(d.magnitudeBps);
          return (
            <span key={idx} className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)]">
              {d.name}
              {d.magnitudeBps !== null ? (
                <>: <span className={b.classe}>{b.texto}</span></>
              ) : (
                <span className="text-[var(--ink-muted)] italic"> — motivo não relacionado a um passo específico</span>
              )}
            </span>
          );
        })}
      </div>
    )}
  </div>
);

const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
    <div
      className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xl max-w-lg w-full p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-end mb-2 -mt-2 -mr-2">
        <button onClick={onClose} className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] rounded-lg hover:bg-[var(--page-bg)]">
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const CopomDissents: React.FC<{ votes: CopomVoteRecord[] }> = ({ votes }) => {
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const ordenadas = useMemo(() => [...votes].sort((a, b) => a.date.localeCompare(b.date)), [votes]);
  const cores = useCoresPorPresidente(useMemo(() => ordenadas.map((v) => v.chair), [ordenadas]));

  const barras: Barra[] = ordenadas.map((v) => ({
    id: v.id,
    label: `${v.meetingNumber} (${formatDate(v.date)}) — ${v.placar}`,
    ano: Number(v.date.slice(0, 4)),
    valor: v.votes.filter((x) => x.diffFromDecisionBps).length,
    cor: v.chair ? cores.get(v.chair) || 'var(--ink-muted)' : 'var(--ink-muted)',
    presidente: v.chair,
  }));

  const selecionado = votes.find((v) => v.id === selecionadoId) || null;

  return (
    <div className="space-y-4">
      <GraficoBarras barras={barras} onClickBarra={setSelecionadoId} />
      {selecionado && (
        <Modal onClose={() => setSelecionadoId(null)}>
          <CopomDetalhe v={selecionado} />
        </Modal>
      )}
    </div>
  );
};

const FomcDissents: React.FC<{ votes: FomcVoteRecord[] }> = ({ votes }) => {
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const ordenadas = useMemo(() => [...votes].sort((a, b) => a.date.localeCompare(b.date)), [votes]);
  const cores = useCoresPorPresidente(useMemo(() => ordenadas.map((v) => v.chair), [ordenadas]));

  const barras: Barra[] = ordenadas.map((v) => ({
    id: v.id,
    label: `${formatDate(v.date)} — ${v.votesFor}x${v.votesAgainst}`,
    ano: Number(v.date.slice(0, 4)),
    valor: v.votesAgainst,
    cor: v.chair ? cores.get(v.chair) || 'var(--ink-muted)' : 'var(--ink-muted)',
    presidente: v.chair,
  }));

  const selecionado = votes.find((v) => v.id === selecionadoId) || null;

  return (
    <div className="space-y-4">
      <GraficoBarras barras={barras} onClickBarra={setSelecionadoId} />
      {selecionado && (
        <Modal onClose={() => setSelecionadoId(null)}>
          <FomcDetalhe v={selecionado} />
        </Modal>
      )}
    </div>
  );
};

export const DissentsView: React.FC<DissentsViewProps> = ({ committee, copomVotes, fomcVotes }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[var(--brand)] uppercase tracking-wider">
        <Gavel className="w-4 h-4" />
        <span>{committee === 'copom' ? 'Votações do Copom — Bacen' : 'Votações do FOMC — Fed de St. Louis'}</span>
      </div>
      {committee === 'copom' ? <CopomDissents votes={copomVotes} /> : <FomcDissents votes={fomcVotes} />}
    </div>
  );
};
