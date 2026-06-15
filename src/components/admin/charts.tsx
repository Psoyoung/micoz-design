// 관리자 차트 (SVG 직접 구현, 외부 라이브러리 0)
// 출처: 원본 admin/admin-primitives.jsx BarRow + admin-views-1.jsx SalesAreaChart
// (Sparkline·Donut 은 _preview 전용이라 정리 단계에서 제거됨)
import type { ReactNode } from 'react'
import { wonM } from '../../lib/format'
import type { DailySales } from '../../lib/data'

export function BarRow({ label, value, max, format, color = '#3a2552', sub }: { label: ReactNode; value: number; max: number; format?: (v: number) => string; color?: string; sub?: ReactNode }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12.5, gap: 12 }}>
        <span style={{ color: 'var(--ad-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: 1 }}>{label}</span>
        <span style={{ fontFamily: 'var(--mono)', color: 'var(--ad-ink)', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>{format ? format(value) : value}</span>
      </div>
      <div style={{ position: 'relative', height: 4, background: 'var(--ad-line-soft)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: pct + '%', background: color }} />
      </div>
      {sub && <div style={{ fontSize: 10, color: 'var(--ad-muted)', marginTop: 4, fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>{sub}</div>}
    </div>
  )
}

export function SalesAreaChart({ data }: { data: DailySales[] }) {
  const w = 720
  const h = 240
  const pad = { l: 50, r: 16, t: 18, b: 28 }
  const iw = w - pad.l - pad.r
  const ih = h - pad.t - pad.b
  const max = Math.max(...data.map((d) => d.amount))
  const xs = (i: number) => pad.l + (i / (data.length - 1)) * iw
  const ys = (v: number) => pad.t + ih - (v / max) * ih
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(d.amount)}`).join(' ')
  const area = `${path} L ${xs(data.length - 1)} ${pad.t + ih} L ${xs(0)} ${pad.t + ih} Z`
  return (
    <div style={{ padding: '20px 22px 22px' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block' }} preserveAspectRatio="none">
        {/* y grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = pad.t + ih - f * ih
          return (
            <g key={i}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#ede7dc" strokeWidth="1" />
              <text x={pad.l - 8} y={y + 3} textAnchor="end" style={{ fontFamily: 'var(--mono)', fontSize: 9, fill: '#8a7ba0', letterSpacing: '0.04em' }}>
                {wonM(max * f)}
              </text>
            </g>
          )
        })}
        {/* area */}
        <defs>
          <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2552" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3a2552" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#salesArea)" />
        <path d={path} fill="none" stroke="#3a2552" strokeWidth="1.8" />
        {/* x ticks */}
        {data
          .filter((_, i) => i % 5 === 0 || i === data.length - 1)
          .map((d) => {
            const i = data.indexOf(d)
            return (
              <text key={i} x={xs(i)} y={h - 8} textAnchor="middle" style={{ fontFamily: 'var(--mono)', fontSize: 9, fill: '#8a7ba0', letterSpacing: '0.04em' }}>
                5/{String(d.day).padStart(2, '0')}
              </text>
            )
          })}
        {/* last point */}
        <circle cx={xs(data.length - 1)} cy={ys(data[data.length - 1].amount)} r="4" fill="#3a2552" />
        <circle cx={xs(data.length - 1)} cy={ys(data[data.length - 1].amount)} r="9" fill="#3a2552" fillOpacity="0.15" />
      </svg>
    </div>
  )
}
