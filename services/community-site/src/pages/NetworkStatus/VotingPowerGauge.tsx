import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import './votingPowerGauge.scss';

type VotingPowerGaugeProps = {
  totalVotes: number;
  activeVotes: number;
  thresholdPct?: number;
  isLoading?: boolean;
};

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 90;
const STROKE = 18;
const CIRC = 2 * Math.PI * RADIUS;

// Point on the ring for a fraction of a full turn, starting at 12 o'clock, clockwise.
const pointOnRing = (fraction: number, r: number) => {
  const angle = (fraction * 360 - 90) * (Math.PI / 180);
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
};

const VotingPowerGauge = ({
  totalVotes,
  activeVotes,
  thresholdPct = 0.625,
  isLoading = false,
}: VotingPowerGaugeProps) => {
  const total = totalVotes > 0 ? totalVotes : 0;
  const active = Math.min(activeVotes, total);
  const dead = Math.max(0, total - active);
  const activePct = total > 0 ? active / total : 0;
  const deadPct = total > 0 ? dead / total : 0;
  const margin = activePct - thresholdPct;

  // EBLA PBFT quorum: ceil(5/8 * total) === floor((total * 5 + 7) / 8).
  const quorumVotes = Math.floor((total * 5 + 7) / 8);

  let zone: 'safe' | 'warning' | 'blocked' = 'safe';
  if (total > 0) {
    if (activePct <= thresholdPct) {
      zone = 'blocked';
    } else if (margin <= 0.05) {
      zone = 'warning';
    }
  }

  // Animate the arcs out from zero on mount and whenever the data changes.
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    setDrawn(false);
    const id = setTimeout(() => setDrawn(true), 60);
    return () => clearTimeout(id);
  }, [activePct, deadPct]);

  const activeLen = drawn ? activePct * CIRC : 0;
  const deadLen = drawn ? deadPct * CIRC : 0;

  const tickInner = pointOnRing(thresholdPct, RADIUS - STROKE / 2 - 3);
  const tickOuter = pointOnRing(thresholdPct, RADIUS + STROKE / 2 + 3);
  const tickLabel = pointOnRing(thresholdPct, RADIUS + STROKE / 2 + 15);

  const pctText = total > 0 ? `${(activePct * 100).toFixed(1)}%` : '—';
  let marginText = 'awaiting on-chain data';
  if (total > 0) {
    marginText =
      zone === 'blocked'
        ? 'BELOW 5/8 — CANNOT FINALIZE'
        : `${(margin * 100).toFixed(1)}% above 5/8 quorum`;
  }

  return (
    <div className={clsx('vpGauge', zone)}>
      <div className="vpGauge-ring">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            <circle
              className="vpGauge-track"
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
            />
            <circle
              className="vpGauge-arc dead"
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="butt"
              style={{ strokeDasharray: `${deadLen} ${CIRC}`, strokeDashoffset: -activeLen }}
            />
            <circle
              className="vpGauge-arc active"
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="butt"
              style={{ strokeDasharray: `${activeLen} ${CIRC}`, strokeDashoffset: 0 }}
            />
          </g>
          <line
            className="vpGauge-tick"
            x1={tickInner.x}
            y1={tickInner.y}
            x2={tickOuter.x}
            y2={tickOuter.y}
          />
          <text className="vpGauge-tickLabel" x={tickLabel.x} y={tickLabel.y}>
            5/8
          </text>
        </svg>
        <div className="vpGauge-center">
          <div className="vpGauge-pct">{isLoading && total === 0 ? '…' : pctText}</div>
          <div className="vpGauge-pctLabel">active voting power</div>
          <div className={clsx('vpGauge-margin', zone)}>{marginText}</div>
        </div>
      </div>

      <div className="vpGauge-legend">
        <span className="vpGauge-legendItem">
          <i className="dotLegend active" /> Active {active.toLocaleString()}
        </span>
        <span className="vpGauge-legendItem">
          <i className="dotLegend dead" /> At-risk {dead.toLocaleString()}
        </span>
        <span className="vpGauge-legendItem">
          <i className="dotLegend quorum" /> Quorum needs {quorumVotes.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default VotingPowerGauge;
