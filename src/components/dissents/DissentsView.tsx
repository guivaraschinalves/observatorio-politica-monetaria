import React, { useEffect, useMemo, useState } from 'react';
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

// Slider de duas pontas (nativo, dois <input type="range"> empilhados) pra
// escolher a janela [início, fim] do histórico mostrada no gráfico acima.
const SliderFaixa: React.FC<{
  max: number;
  valor: [number, number];
  onChange: (v: [number, number]) => void;
  rotulo: (idx: number) => string;
}> = ({ max, valor, onChange, rotulo }) => {
  const [inicio, fim] = valor;
  const trackStyle: React.CSSProperties = {
    WebkitAppearance: 'none',
    appearance: 'none',
    background: 'transparent',
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    margin: 0,
  };
  return (
    <div className="space-y-1.5">
      <div className="relative h-5 flex items-center">
        <div className="absolute left-0 right-0 h-1 rounded-full bg-[var(--border)]" />
        <div
          className="absolute h-1 rounded-full bg-[var(--brand)]"
          style={{
            left: `${max > 0 ? (inicio / max) * 100 : 0}%`,
            right: `${max > 0 ? 100 - (fim / max) * 100 : 0}%`,
          }}
        />
        <input
          type="range"
          min={0}
          max={max}
          value={inicio}
          onChange={(e) => onChange([Math.min(Number(e.target.value), fim), fim])}
          className="dissent-range"
          style={trackStyle}
        />
        <input
          type="range"
          min={0}
          max={max}
          value={fim}
          onChange={(e) => onChange([inicio, Math.max(Number(e.target.value), inicio)])}
          className="dissent-range"
          style={trackStyle}
        />
      </div>
      <div className="flex justify-between text-[11px] font-mono text-[var(--ink-muted)]">
        <span>{rotulo(inicio)}</span>
        <span>{rotulo(fim)}</span>
      </div>
    </div>
  );
};

const GraficoBarras: React.FC<{ barras: Barra[]; onClickBarra: (id: string) => void }> = ({ barras, onClickBarra }) => {
  const ultimoIndice = Math.max(0, barras.length - 1);
  const [janela, setJanela] = useState<[number, number]>([0, ultimoIndice]);

  // Reseta a janela pro histórico inteiro quando troca de comitê (o
  // componente todo é remontado nesse caso, mas o length também muda se o
  // dado for recarregado).
  useEffect(() => {
    setJanela([0, Math.max(0, barras.length - 1)]);
  }, [barras.length]);

  const visiveis = useMemo(() => barras.slice(janela[0], janela[1] + 1), [barras, janela]);

  const presidentesNaOrdem = useMemo(() => {
    const vistos: string[] = [];
    for (const b of barras) {
      if (b.presidente && !vistos.includes(b.presidente)) vistos.push(b.presidente);
    }
    return vistos;
  }, [barras]);

  const maxValor = useMemo(() => Math.max(1, ...visiveis.map((b) => b.valor)), [visiveis]);

  // Eixo Y: 0, e mais marcações redondas até o máximo real da janela visível
  // — reescala sozinho quando o usuário dá zoom num período.
  const marcacoesY = useMemo(() => {
    const passos = [1, 2, 5, 10, 20, 25, 50, 100, 200];
    const passo = passos.find((p) => p * 4 >= maxValor) || passos[passos.length - 1];
    const valores: number[] = [];
    for (let v = 0; v <= maxValor + 0.001; v += passo) valores.push(v);
    if (valores[valores.length - 1] < maxValor) valores.push(valores[valores.length - 1] + passo);
    return valores;
  }, [maxValor]);
  const escalaMax = marcacoesY[marcacoesY.length - 1] || 1;

  // Eixo X: um traço por ano em que há reunião dentro da janela visível,
  // posicionado em % da largura (o layout das barras é responsivo via flex).
  const marcacoesX = useMemo(() => {
    const primeiraDoAno = new Map<number, number>();
    visiveis.forEach((b, idx) => {
      if (!primeiraDoAno.has(b.ano)) primeiraDoAno.set(b.ano, idx);
    });
    const anos = Array.from(primeiraDoAno.keys()).sort((a, b) => a - b);
    const passoRotulo = anos.length > 40 ? 10 : anos.length > 15 ? 5 : 1;
    return anos.map((ano, i) => ({
      ano,
      idx: primeiraDoAno.get(ano)!,
      comRotulo: i % passoRotulo === 0,
    }));
  }, [visiveis]);

  // Gap entre barras encolhe quando há muitas na janela, senão elas somem
  // (860 reuniões numa tela de ~1000px não sobra espaço pra gap fixo).
  const gapPx = visiveis.length > 150 ? 0 : visiveis.length > 60 ? 1 : 3;

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

      <div className="flex items-start bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 pt-7">
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

        <div className="flex-1 min-w-0 border-l border-[var(--border)] pl-2">
          <div className="relative flex items-end w-full" style={{ height: ALTURA_GRAFICO, gap: gapPx }}>
            {/* linhas-guia do eixo Y */}
            {marcacoesY.map((v) => (
              <div
                key={v}
                className="absolute left-0 right-0 border-t border-dashed border-[var(--border)]"
                style={{ bottom: `${(v / escalaMax) * ALTURA_GRAFICO}px` }}
              />
            ))}
            {visiveis.map((b) => (
              <button
                key={b.id}
                onClick={() => onClickBarra(b.id)}
                title={`${b.label} — ${b.valor} voto(s) contrário(s)`}
                className="flex-1 min-w-0 rounded-t-sm transition-opacity hover:opacity-70 relative"
                style={{
                  height: `${Math.max((b.valor / escalaMax) * 100, 1.5)}%`,
                  background: b.cor,
                  opacity: b.valor > 0 ? 1 : 0.35,
                }}
              />
            ))}
          </div>

          {/* Eixo X */}
          <div className="relative h-5 mt-1 w-full">
            {marcacoesX.map(({ ano, idx, comRotulo }) => (
              <div
                key={ano}
                className="absolute top-0 border-l border-[var(--border)]"
                style={{ left: `${(idx / visiveis.length) * 100}%`, height: comRotulo ? 6 : 3 }}
              />
            ))}
            {marcacoesX.filter((m) => m.comRotulo).map(({ ano, idx }) => (
              <div
                key={ano}
                className="absolute top-1.5 text-[10px] font-mono text-[var(--ink-muted)] -translate-x-1/2"
                style={{ left: `${(idx / visiveis.length) * 100}%` }}
              >
                {ano}
              </div>
            ))}
          </div>
        </div>
      </div>

      {barras.length > 1 && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--ink-muted)]">
              Mostrando {visiveis.length} de {barras.length} reuniões — arraste as pontas pra dar zoom no período.
            </span>
            {(janela[0] !== 0 || janela[1] !== ultimoIndice) && (
              <button
                onClick={() => setJanela([0, ultimoIndice])}
                className="text-[11px] font-semibold text-[var(--brand)] hover:underline shrink-0 ml-2"
              >
                Ver tudo
              </button>
            )}
          </div>
          <SliderFaixa max={ultimoIndice} valor={janela} onChange={setJanela} rotulo={(idx) => String(barras[idx]?.ano ?? '')} />
        </div>
      )}

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
