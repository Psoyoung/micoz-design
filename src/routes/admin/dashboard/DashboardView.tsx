// 관리자 대시보드 — 출처: 원본 admin/admin-views-1.jsx DashboardView/ChannelInflow
// lib/data dashboard.ts(SALES_30D/TOP_PRODUCTS_30D). 금액은 wonCompact(관리자 '₩' 무공백).
import type { CSSProperties } from 'react'
import { SALES_30D, TOP_PRODUCTS_30D } from '../../../lib/data'
import { wonCompact } from '../../../lib/format'
import Stat from '../../../components/admin/Stat'
import Card from '../../../components/admin/Card'
import { BarRow, SalesAreaChart } from '../../../components/admin/charts'
import { FilterChip } from '../../../components/admin/filters'
import AdminBtn from '../../../components/admin/AdminBtn'
import { AIcon } from '../../../components/admin/icons'

const pageWrap: CSSProperties = { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }
const BAR_COLORS = ['#3a2552', '#6b4d8f', '#9a7fb8', '#b89968', '#c4b0d8']

export default function DashboardView() {
  const todayAmount = SALES_30D[SALES_30D.length - 1].amount

  return (
    <div style={pageWrap}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <Stat label="오늘 매출" value={wonCompact(todayAmount)} sub="2026-05-20 14:32 기준" accent="#3a2552" />
        <Stat label="오늘 주문" value="84건" sub="결제완료 78 · 대기 6" accent="#6b4d8f" />
        <Stat label="신규 회원" value="142명" sub="이번 주 누적" accent="#b89968" />
        <Stat label="평균 주문액" value="₩186,420" sub="최근 30일" accent="#9a7fb8" />
      </div>

      {/* 채널별 유입 + 베스트셀러 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="채널별 유입 현황" subtitle="TRAFFIC SOURCES · 7D" padding={0}>
          <ChannelInflow />
        </Card>

        <Card title="베스트셀러 (30일)" subtitle="TOP 5" padding={22}>
          {TOP_PRODUCTS_30D.map((p, i) => (
            <BarRow
              key={p.name}
              label={`${String(i + 1).padStart(2, '0')}. ${p.name}`}
              value={p.units}
              max={TOP_PRODUCTS_30D[0].units}
              format={(v) => v + '개 · ' + wonCompact(p.amount)}
              color={BAR_COLORS[i]}
            />
          ))}
        </Card>
      </div>

      {/* 매출 추이 (full width) */}
      <Card
        title="매출 추이"
        subtitle="LAST 30 DAYS · KRW"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            {['7일', '30일', '90일', '연간'].map((p, i) => (
              <FilterChip key={p} label={p} active={i === 1} />
            ))}
            <AdminBtn icon={AIcon.download(13)} size="sm">CSV</AdminBtn>
          </div>
        }
        padding={0}
      >
        <SalesAreaChart data={SALES_30D} />
      </Card>
    </div>
  )
}

// ─── 채널별 유입 현황 (colocate, 자체 목업) ───
const thStyle3: CSSProperties = { padding: '10px 14px', textAlign: 'left', fontWeight: 500, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ad-muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }
const tdStyle3: CSSProperties = { padding: '11px 14px', color: 'var(--ad-ink)', verticalAlign: 'middle' }

const CHANNELS = [
  { name: '자사몰 (직접 유입)', code: 'DIRECT', sessions: 18420, share: 32.4, conv: 4.8, color: '#3a2552' },
  { name: '네이버 검색', code: 'NAVER', sessions: 12180, share: 21.4, conv: 3.2, color: '#6b4d8f' },
  { name: '카카오톡 채널', code: 'KAKAO', sessions: 8940, share: 15.7, conv: 6.1, color: '#9a7fb8' },
  { name: '인스타그램', code: 'INSTA', sessions: 6820, share: 12.0, conv: 2.4, color: '#b89968' },
  { name: '구글 검색', code: 'GOOGLE', sessions: 4280, share: 7.5, conv: 2.8, color: '#c4b0d8' },
  { name: '제휴 매거진', code: 'REFERRAL', sessions: 3640, share: 6.4, conv: 3.6, color: '#d8c0e8' },
  { name: '기타', code: 'OTHER', sessions: 2540, share: 4.6, conv: 1.9, color: '#ede7dc' },
]

function ChannelInflow() {
  const total = CHANNELS.reduce((a, b) => a + b.sessions, 0)
  const maxConv = Math.max(...CHANNELS.map((c) => c.conv))
  return (
    <div>
      <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--ad-line)', display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10.5, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em' }}>TOTAL SESSIONS</div>
          <div style={{ fontFamily: 'var(--serif-en)', fontSize: 26, marginTop: 4, lineHeight: 1 }}>{total.toLocaleString()}</div>
        </div>
        <div style={{ fontSize: 11, color: '#3a8a5a', fontFamily: 'var(--mono)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>+12.4% vs 지난주</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10.5, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', textAlign: 'right' }}>
          AVG CONV
          <br />
          <span style={{ fontFamily: 'var(--serif-en)', fontSize: 17, color: 'var(--ad-ink)', letterSpacing: 0 }}>3.8%</span>
        </div>
      </div>

      {/* stacked bar */}
      <div style={{ padding: '16px 22px 8px' }}>
        <div style={{ display: 'flex', height: 8, overflow: 'hidden', borderRadius: 1 }}>
          {CHANNELS.map((c) => (
            <div key={c.code} style={{ flex: c.sessions, background: c.color }} title={`${c.name} ${c.share}%`} />
          ))}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--ad-line)' }}>
            <th style={{ ...thStyle3, paddingLeft: 22 }}>채널</th>
            <th style={{ ...thStyle3, textAlign: 'right' }}>세션</th>
            <th style={{ ...thStyle3, textAlign: 'right' }}>비중</th>
            <th style={{ ...thStyle3, textAlign: 'right', paddingRight: 22 }}>전환율</th>
          </tr>
        </thead>
        <tbody>
          {CHANNELS.map((c) => (
            <tr key={c.code} style={{ borderBottom: '1px solid var(--ad-line-soft)' }}>
              <td style={{ ...tdStyle3, paddingLeft: 22 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, background: c.color, borderRadius: 1, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ad-muted)', letterSpacing: '0.12em' }}>{c.code}</span>
                </span>
              </td>
              <td style={{ ...tdStyle3, textAlign: 'right', fontFamily: 'var(--mono)' }}>{c.sessions.toLocaleString()}</td>
              <td style={{ ...tdStyle3, textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--ad-muted)' }}>{c.share}%</td>
              <td style={{ ...tdStyle3, textAlign: 'right', paddingRight: 22 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 110, justifyContent: 'flex-end' }}>
                  <span style={{ position: 'relative', width: 56, height: 4, background: 'var(--ad-line-soft)', flexShrink: 0 }}>
                    <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: (c.conv / maxConv) * 100 + '%', background: c.color }} />
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, minWidth: 36, textAlign: 'right' }}>{c.conv}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
