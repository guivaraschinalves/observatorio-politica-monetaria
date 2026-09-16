import React, { useMemo, useState } from 'react';
import { Committee, CopomVoteRecord, FomcVoteRecord } from '../../types/monetary';
import { Gavel } from 'lucide-react';

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

function bps(v: number | null): string {
  if (v === null) return '—';
  if (v === 0) return 'mantém';
  return `${v > 0 ? '+' : ''}${v}bps`;
}

const FiltroSoDissidencias: React.FC<{ value: boolean; onChange: (v: boolean) => void; total: number; dissidencias: number }> = ({
  value,
  onChange,
  total,
  dissidencias,
}) => (
  <div className="flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5 text-xs">
    <button
      onClick={() => onChange(false)}
      className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
        !value ? 'bg-[var(--accent-wash)] text-[var(--brand)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
      }`}
    >
      Todas ({total})
    </button>
    <button
      onClick={() => onChange(true)}
      className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
        value ? 'bg-[var(--accent-wash)] text-[var(--brand)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
      }`}
    >
      Só com dissidência ({dissidencias})
    </button>
  </div>
);

const CopomDissentsList: React.FC<{ votes: CopomVoteRecord[] }> = ({ votes }) => {
  const [soDissidencias, setSoDissidencias] = useState(true);
  const filtradas = useMemo(() => (soDissidencias ? votes.filter((v) => !v.unanimous) : votes), [votes, soDissidencias]);
  const totalDissidencias = useMemo(() => votes.filter((v) => !v.unanimous).length, [votes]);
  const primeiraComNomes = useMemo(() => [...votes].reverse().find((v) => v.namedVotes)?.date, [votes]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FiltroSoDissidencias value={soDissidencias} onChange={setSoDissidencias} total={votes.length} dissidencias={totalDissidencias} />
        <p className="text-xs text-[var(--ink-muted)]">
          Votante nomeado a partir de {primeiraComNomes && formatDate(primeiraComNomes)}; antes disso, só o placar agregado.
        </p>
      </div>

      <div className="space-y-3">
        {filtradas.map((v) => (
          <div key={v.id} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-[var(--ink)]">{v.meetingNumber}</span>
                <span className="text-xs text-[var(--ink-muted)] font-mono">{formatDate(v.date)}</span>
                {v.rateDecision && (
                  <span className="text-xs bg-[var(--page-bg)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono text-[var(--ink)]">
                    {v.rateDecision}
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  v.unanimous
                    ? 'text-[var(--ink-muted)] border-[var(--border)]'
                    : 'text-[var(--brand)] border-[var(--brand)] bg-[var(--accent-wash)]'
                }`}
              >
                {v.placar}
              </span>
            </div>

            {!v.unanimous && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-2">
                {v.votes.map((vote, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-1 rounded-lg border ${
                      vote.diffFromDecisionBps ? 'border-[var(--brand)]/40 bg-[var(--accent-wash)] text-[var(--ink)]' : 'border-[var(--border)] text-[var(--ink-muted)]'
                    }`}
                  >
                    {vote.name ?? `${vote.count ?? '?'} membro(s)`}
                    {vote.diffFromDecisionBps ? ` — preferia ${bps(vote.preferredChangeBps)}` : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtradas.length === 0 && (
          <div className="bg-[var(--surface)] p-10 text-center rounded-xl border border-[var(--border)] text-[var(--ink-muted)] text-sm">
            Nenhuma reunião com dissidência nesse filtro.
          </div>
        )}
      </div>
    </div>
  );
};

const FomcDissentsList: React.FC<{ votes: FomcVoteRecord[] }> = ({ votes }) => {
  const [soDissidencias, setSoDissidencias] = useState(true);
  const filtradas = useMemo(() => (soDissidencias ? votes.filter((v) => !v.unanimous) : votes), [votes, soDissidencias]);
  const totalDissidencias = useMemo(() => votes.filter((v) => !v.unanimous).length, [votes]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FiltroSoDissidencias value={soDissidencias} onChange={setSoDissidencias} total={votes.length} dissidencias={totalDissidencias} />
        <p className="text-xs text-[var(--ink-muted)]">
          Histórico completo desde 1936 (Fed de St. Louis) — nomes de dissidentes nem sempre registrados nas décadas mais antigas.
        </p>
      </div>

      <div className="space-y-3">
        {filtradas.map((v) => (
          <div key={v.id} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-[var(--ink)]">{formatDate(v.date)}</span>
                {v.chair && <span className="text-xs text-[var(--ink-muted)]">Chair: {v.chair}</span>}
                <span className="text-xs bg-[var(--page-bg)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono text-[var(--ink)]">
                  {v.votesFor}x{v.votesAgainst}
                </span>
              </div>
              {!v.unanimous && (
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full border text-[var(--brand)] border-[var(--brand)] bg-[var(--accent-wash)]">
                  {v.governorsDissenting > 0 && `${v.governorsDissenting} governor(s)`}
                  {v.governorsDissenting > 0 && v.presidentsDissenting > 0 && ' + '}
                  {v.presidentsDissenting > 0 && `${v.presidentsDissenting} president(s)`}
                </span>
              )}
            </div>

            {!v.unanimous && (v.dissentersTighter.length > 0 || v.dissentersEasier.length > 0 || v.dissentersOther.length > 0) && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-2">
                {v.dissentersTighter.map((n) => (
                  <span key={n} className="text-xs px-2 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400">
                    {n} — a favor de aperto
                  </span>
                ))}
                {v.dissentersEasier.map((n) => (
                  <span key={n} className="text-xs px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    {n} — a favor de alívio
                  </span>
                ))}
                {v.dissentersOther.map((n) => (
                  <span key={n} className="text-xs px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--ink-muted)]">
                    {n} — motivo não classificado
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtradas.length === 0 && (
          <div className="bg-[var(--surface)] p-10 text-center rounded-xl border border-[var(--border)] text-[var(--ink-muted)] text-sm">
            Nenhuma reunião com dissidência nesse filtro.
          </div>
        )}
      </div>
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
      {committee === 'copom' ? <CopomDissentsList votes={copomVotes} /> : <FomcDissentsList votes={fomcVotes} />}
    </div>
  );
};
