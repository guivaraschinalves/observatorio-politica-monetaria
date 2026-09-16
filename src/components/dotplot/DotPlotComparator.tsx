import React, { useMemo, useState } from 'react';
import { DotPlotRelease } from '../../types/monetary';
import { ArrowRight } from 'lucide-react';

interface DotPlotComparatorProps {
  releases: DotPlotRelease[];
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${Number(d)} ${meses[Number(m) - 1]}/${y}`;
}

function releaseLabel(r: DotPlotRelease): string {
  return formatDate(r.date);
}

export const DotPlotComparator: React.FC<DotPlotComparatorProps> = ({ releases }) => {
  const [idxB, setIdxB] = useState(0); // mais recente
  const [idxA, setIdxA] = useState(Math.min(1, releases.length - 1)); // anterior

  const releaseA = releases[idxA];
  const releaseB = releases[idxB];

  const anosComuns = useMemo(() => {
    if (!releaseA || !releaseB) return [];
    return releaseA.years.filter((y) => releaseB.years.includes(y));
  }, [releaseA, releaseB]);

  const escala = useMemo(() => {
    if (!releaseA || !releaseB) return { min: 0, max: 1 };
    const todos = [...releaseA.range, ...releaseB.range].flatMap((r) => [r.low, r.high]);
    const min = Math.min(...todos);
    const max = Math.max(...todos);
    const folga = (max - min) * 0.1 || 0.5;
    return { min: min - folga, max: max + folga };
  }, [releaseA, releaseB]);

  const pct = (v: number) => ((v - escala.min) / (escala.max - escala.min)) * 100;

  // Marcações do eixo: passo "redondo" (0.25/0.5/1/2 p.p.) mais próximo de
  // dividir a escala em uns 5 traços, pra não depender de passar o mouse
  // pra saber a que número cada posição da barra corresponde.
  const marcacoes = useMemo(() => {
    if (!releaseA || !releaseB) return [];
    const alvo = (escala.max - escala.min) / 5;
    const passos = [0.25, 0.5, 1, 2, 2.5, 5, 10];
    const passo = passos.find((p) => p >= alvo) || passos[passos.length - 1];
    const inicio = Math.ceil(escala.min / passo) * passo;
    const valores: number[] = [];
    for (let v = inicio; v <= escala.max; v += passo) {
      valores.push(Math.round(v * 100) / 100);
    }
    return valores;
  }, [escala, releaseA, releaseB]);

  if (releases.length === 0) {
    return <div className="p-8 text-center text-[var(--ink-muted)]">Nenhum dot plot disponível.</div>;
  }

  const Barra: React.FC<{ label: string; median: number; ct: { low: number; high: number }; range: { low: number; high: number }; cor: string }> = ({
    label,
    median,
    ct,
    range,
    cor,
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)]">
        <span>{label}</span>
        <span className="font-mono text-[var(--ink)] font-semibold">{median.toFixed(2)}%</span>
      </div>
      <div className="relative h-3 rounded-full bg-[var(--page-bg)] border border-[var(--border)]">
        <div
          className="absolute inset-y-0 rounded-full opacity-25 cursor-help"
          title={`Faixa completa: ${range.low.toFixed(2)}% – ${range.high.toFixed(2)}%`}
          style={{ left: `${pct(range.low)}%`, width: `${pct(range.high) - pct(range.low)}%`, background: cor }}
        />
        <div
          className="absolute inset-y-0 rounded-full opacity-60 cursor-help"
          title={`Tendência central: ${ct.low.toFixed(2)}% – ${ct.high.toFixed(2)}%`}
          style={{ left: `${pct(ct.low)}%`, width: `${pct(ct.high) - pct(ct.low)}%`, background: cor }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-2 ring-[var(--surface)] cursor-help"
          title={`Mediana: ${median.toFixed(2)}%`}
          style={{ left: `${pct(median)}%`, background: cor }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={idxA}
          onChange={(e) => setIdxA(Number(e.target.value))}
          className="bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] text-sm rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-[var(--brand)]"
        >
          {releases.map((r, i) => (
            <option key={r.id} value={i} disabled={i === idxB}>
              {releaseLabel(r)}
            </option>
          ))}
        </select>
        <ArrowRight className="w-4 h-4 text-[var(--ink-muted)]" />
        <select
          value={idxB}
          onChange={(e) => setIdxB(Number(e.target.value))}
          className="bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] text-sm rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-[var(--brand)]"
        >
          {releases.map((r, i) => (
            <option key={r.id} value={i} disabled={i === idxA}>
              {releaseLabel(r)}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3 ml-auto text-xs">
          <span className="flex items-center gap-1.5 text-[var(--ink-muted)]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--ink-muted)' }} />
            {releaseLabel(releaseA)}
          </span>
          <span className="flex items-center gap-1.5 text-[var(--ink-muted)]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--brand)' }} />
            {releaseLabel(releaseB)}
          </span>
        </div>
      </div>

      <p className="text-xs text-[var(--ink-muted)] leading-relaxed max-w-2xl">
        O Fed não publica a posição de cada participante no dot plot como número — só como ponto num
        gráfico. O que ele publica como texto, e o que está aqui, é a mediana, a tendência central
        (exclui os 3 mais altos e os 3 mais baixos) e a faixa completa das projeções — mesma
        informação do dot plot, resumida.
      </p>

      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 space-y-6">
        {anosComuns.length > 0 && (
          <div className="relative h-4 text-[10px] font-mono text-[var(--ink-muted)] -mb-1">
            {marcacoes.map((v) => (
              <span
                key={v}
                className="absolute -translate-x-1/2 border-l border-[var(--border)] pl-1"
                style={{ left: `${pct(v)}%` }}
              >
                {v.toFixed(2)}%
              </span>
            ))}
          </div>
        )}
        {anosComuns.length === 0 ? (
          <div className="text-sm text-[var(--ink-muted)]">
            Essas duas reuniões não têm nenhum ano de projeção em comum.
          </div>
        ) : (
          anosComuns.map((ano) => {
            const iA = releaseA.years.indexOf(ano);
            const iB = releaseB.years.indexOf(ano);
            const delta = releaseB.median[iB] - releaseA.median[iA];
            return (
              <div key={ano} className="space-y-2.5 pb-5 border-b border-[var(--border)] last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--ink)]">{ano}</h3>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      delta > 0.001 ? 'text-rose-600 dark:text-rose-400' : delta < -0.001 ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--ink-muted)]'
                    }`}
                  >
                    {delta > 0.001 ? '+' : ''}
                    {Math.abs(delta) < 0.001 ? 'sem mudança' : `${delta.toFixed(2)} p.p.`}
                  </span>
                </div>
                <Barra
                  label={releaseLabel(releaseA)}
                  median={releaseA.median[iA]}
                  ct={releaseA.centralTendency[iA]}
                  range={releaseA.range[iA]}
                  cor="var(--ink-muted)"
                />
                <Barra
                  label={releaseLabel(releaseB)}
                  median={releaseB.median[iB]}
                  ct={releaseB.centralTendency[iB]}
                  range={releaseB.range[iB]}
                  cor="var(--brand)"
                />
              </div>
            );
          })
        )}
      </div>

      <p className="text-[11px] text-[var(--ink-muted)]">
        Fonte:{' '}
        <a href={releaseA.sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-[var(--brand)]">
          SEP {releaseLabel(releaseA)}
        </a>
        {' · '}
        <a href={releaseB.sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-[var(--brand)]">
          SEP {releaseLabel(releaseB)}
        </a>
        {' — Federal Reserve. Faixa clara = intervalo completo; faixa forte = tendência central; ponto = mediana. Passe o mouse em qualquer trecho da barra pra ver o número exato.'}
      </p>
    </div>
  );
};
