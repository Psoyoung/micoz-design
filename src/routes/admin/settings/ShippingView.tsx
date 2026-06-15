// 관리자 배송 설정 — 출처: 원본 admin/admin-views-2.jsx SettingsShipping(:1936)/SettingRow/SettingFooter
// 인라인 배송 정책 값을 colocate(단일 사용). lib/data 타입 ShippingPolicy 사용.
// 필드 대응: 기본 배송사→shippingName, 기본 배송비→shippingFee, 무료배송 기준→freeShippingMin,
//   제주·도서산간 추가→remoteExtraFee, 출고일 안내→shippingNotice. 금액은 toLocaleString 으로 원본 표기(3,000) 복원.
import { type CSSProperties, type ReactNode } from 'react'
import { type ShippingPolicy } from '../../../lib/data'
import Card from '../../../components/admin/Card'
import AdminBtn from '../../../components/admin/AdminBtn'
import { Input, Select, Textarea } from '../../../components/admin/FormFields'

const pageWrap: CSSProperties = { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }

const SHIPPING_POLICY: ShippingPolicy = {
  shippingName: 'CJ대한통운',
  shippingFee: 3000,
  freeShippingMin: 50000,
  remoteExtraFee: 3000,
  shippingNotice: '평일 오후 2시 이전 결제 건은 당일 출고됩니다. 주말 및 공휴일 결제 건은 다음 영업일에 출고됩니다.',
}
const COURIERS = ['CJ대한통운', '한진택배', '롯데택배', '우체국택배']

export default function ShippingView() {
  const p = SHIPPING_POLICY
  return (
    <div style={pageWrap}>
      <Card title="배송 설정" subtitle="SHIPPING" padding={22}>
        <SettingRow label="기본 배송사">
          <Select value={p.shippingName} options={COURIERS} />
        </SettingRow>
        <SettingRow label="기본 배송비">
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={p.shippingFee.toLocaleString()} mono short />
            <span style={{ alignSelf: 'center', color: 'var(--ad-muted)', fontSize: 12 }}>원</span>
          </div>
        </SettingRow>
        <SettingRow label="무료배송 기준" hint="해당 금액 이상 주문 시 배송비 0원">
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={p.freeShippingMin.toLocaleString()} mono short />
            <span style={{ alignSelf: 'center', color: 'var(--ad-muted)', fontSize: 12 }}>원 이상</span>
          </div>
        </SettingRow>
        <SettingRow label="제주 · 도서산간 추가">
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={p.remoteExtraFee.toLocaleString()} mono short />
            <span style={{ alignSelf: 'center', color: 'var(--ad-muted)', fontSize: 12 }}>원 추가</span>
          </div>
        </SettingRow>
        <SettingRow label="출고일 안내">
          <Textarea value={p.shippingNotice} />
        </SettingRow>
        <SettingFooter />
      </Card>
    </div>
  )
}

// ─── 설정 행 / 푸터 (colocate — 배송 설정에서만 사용) ───
function SettingRow({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, padding: '14px 0', borderBottom: '1px solid var(--ad-line-soft)', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ad-ink)' }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: 'var(--ad-muted)', marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

function SettingFooter() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 18, marginTop: 8, borderTop: '1px solid var(--ad-line)' }}>
      <AdminBtn>취소</AdminBtn>
      <AdminBtn variant="primary">변경 저장</AdminBtn>
    </div>
  )
}
