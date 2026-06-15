// 관리자 카테고리 관리 — 출처: 원본 admin/admin-views-1.jsx CategoriesView + 폼 헬퍼
// lib/data CATEGORY_TREE(CategoryTreeNode). depth→level-1(0-based), visible→isVisible 매핑.
// 우측 편집 카드는 원본대로 정적(선택과 무관한 고정 값) 보존.
import { Fragment, useState, type CSSProperties } from 'react'
import { CATEGORY_TREE, type CategoryTreeNode } from '../../../lib/data'
import Card from '../../../components/admin/Card'
import AdminBtn from '../../../components/admin/AdminBtn'
import { AIcon } from '../../../components/admin/icons'
import { FormField, Input, Select, Toggle } from '../../../components/admin/FormFields'

const pageWrap: CSSProperties = { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }
const rowAction2: CSSProperties = { width: 24, height: 24, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ad-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }

export default function CategoriesView() {
  const [sel, setSel] = useState('c-skin-essence')
  return (
    <div style={pageWrap}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
        {/* Tree */}
        <Card title="카테고리 트리" subtitle="DRAG TO REORDER · 2 LEVELS" padding={0} action={<AdminBtn icon={AIcon.plus(13)} size="sm" variant="primary">대분류 추가</AdminBtn>}>
          <div style={{ padding: '8px 0' }}>
            {CATEGORY_TREE.map((c, i) => (
              <Fragment key={c.id}>
                <CatRow cat={c} sel={sel === c.id} onSel={() => setSel(c.id)} idx={i + 1} />
                {c.children?.map((cc, j) => (
                  <CatRow key={cc.id} cat={cc} sel={sel === cc.id} onSel={() => setSel(cc.id)} idx={`${i + 1}.${j + 1}`} />
                ))}
              </Fragment>
            ))}
          </div>
        </Card>

        {/* Editor */}
        <Card title="카테고리 편집" subtitle="EDIT · 에센스 · 앰플" padding={22}>
          <FormField label="카테고리명">
            <Input value="에센스 · 앰플" />
          </FormField>
          <FormField label="URL 슬러그">
            <Input value="essence-ampoule" mono />
          </FormField>
          <FormField label="상위 카테고리">
            <Select value="스킨케어" options={['스킨케어', '클렌징', '스페셜케어', '세트 · 키트', '맨즈 라인']} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="정렬 순서">
              <Input value="01" mono short />
            </FormField>
            <FormField label="노출">
              <Toggle on label="쇼핑몰에 공개" />
            </FormField>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--ad-line)', marginTop: 16 }}>
            <AdminBtn variant="danger" icon={AIcon.trash(13)}>삭제</AdminBtn>
            <div style={{ display: 'flex', gap: 8 }}>
              <AdminBtn>취소</AdminBtn>
              <AdminBtn variant="primary">변경 저장</AdminBtn>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function CatRow({ cat, sel, onSel, idx }: { cat: CategoryTreeNode; sel: boolean; onSel: () => void; idx: number | string }) {
  const depth = cat.level - 1 // lib/data 는 1-based level → 0-based depth
  return (
    <div
      onClick={onSel}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 22px', paddingLeft: 22 + depth * 24, borderBottom: '1px solid var(--ad-line-soft)', background: sel ? '#f8f4fb' : 'transparent', borderLeft: `2px solid ${sel ? '#3a2552' : 'transparent'}`, cursor: 'pointer' }}
    >
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ad-muted)', letterSpacing: '0.08em', width: 28 }}>{idx}</span>
      <span style={{ fontSize: 13.5, fontWeight: depth === 0 ? 500 : 400, color: cat.isVisible ? 'var(--ad-ink)' : 'var(--ad-muted)', flex: 1, textDecoration: cat.isVisible ? 'none' : 'line-through' }}>{cat.name}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ad-muted)', letterSpacing: '0.04em' }}>{cat.productCount}개</span>
      {!cat.isVisible && <span style={{ fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 6px', background: '#f1eef5', color: '#6b5d72', letterSpacing: '0.1em' }}>HIDDEN</span>}
      <button style={rowAction2}>{AIcon.edit(13)}</button>
    </div>
  )
}

// 폼 헬퍼(FormField/Input/Select/Toggle)는 components/admin/FormFields 로 승격(배송 설정에서도 사용).
