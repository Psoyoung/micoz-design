// 관리자 상품관리 — 출처: 원본 admin/admin-views-2.jsx ProductsView/ProductFormModal/ProductThumb
// lib/data ADMIN_PRODUCTS(AdminProductRow)·CATEGORY_TREE. status 코드는 PRODUCT_STATUS_LABEL 로 표기.
// 매핑: category→categoryName, stock→stockQty, updated→updatedDate. 금액 wonCompact.
// 주의: 원본 ADMIN_PRODUCTS 엔 badges 필드가 없어 '상품 표시' 열은 항상 '—', 배지 필터 선택 시 0건(원본과 동일).
// 주의: 원본의 ProductPreviewView 는 정의되지 않은 깨진 참조였음 → 미리보기 토글 버튼은 보존하되 패널은 렌더하지 않음.
import { useState, useEffect, useRef, type CSSProperties, type ChangeEvent } from 'react'
import { ADMIN_PRODUCTS, CATEGORY_TREE, PRODUCT_STATUS_LABEL, type AdminProductRow, type ProductStatus } from '../../../lib/data'
import { wonCompact } from '../../../lib/format'
import Card from '../../../components/admin/Card'
import { FilterBar } from '../../../components/admin/filters'
import AdminDropdown from '../../../components/admin/AdminDropdown'
import AdminBtn from '../../../components/admin/AdminBtn'
import DataTable, { type Column } from '../../../components/admin/DataTable'
import Pagination from '../../../components/admin/Pagination'
import { StatusChip } from '../../../components/admin/chips'
import { AIcon } from '../../../components/admin/icons'
import ProductThumb from '../../../components/admin/ProductThumb'
import { useModalDismiss } from '../../../lib/useModalDismiss'

const pageWrap: CSSProperties = { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }
const TAB_TO_STATUS: Record<string, ProductStatus> = { selling: 'ON_SALE', low: 'LOW_STOCK', out: 'SOLD_OUT', stop: 'STOPPED' }

const filterLabel: CSSProperties = { display: 'block', fontSize: 10.5, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', marginBottom: 6, textTransform: 'uppercase' }
const dateInput: CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid var(--ad-line-strong)', background: '#fff', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ad-ink)', outline: 'none', height: 32 }

export default function ProductsView() {
  const TREE = CATEGORY_TREE
  const [tab, setTab] = useState('all')
  const [cat1, setCat1] = useState('all')
  const [cat2, setCat2] = useState('all')
  const [badge, setBadge] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editRow, setEditRow] = useState<AdminProductRow | null>(null)

  const sub1 = TREE.find((c) => c.id === cat1)
  const allowedCat2 = sub1?.children || []

  useEffect(() => {
    setCat2('all')
  }, [cat1])

  const cat2Match = (p: AdminProductRow) => {
    if (cat2 === 'all') return true
    const target = allowedCat2.find((c) => c.id === cat2)
    if (!target) return true
    return !!p.categoryName && (p.categoryName === target.name || target.name.includes(p.categoryName))
  }
  const cat1Match = (p: AdminProductRow) => {
    if (cat1 === 'all') return true
    if (!sub1) return true
    if (sub1.name === p.categoryName) return true
    if (sub1.children?.some((c) => c.name === p.categoryName || c.name.includes(p.categoryName))) return true
    return false
  }

  const filteredRows = ADMIN_PRODUCTS.filter((p) => {
    if (tab !== 'all' && p.status !== TAB_TO_STATUS[tab]) return false
    if (!cat1Match(p)) return false
    if (!cat2Match(p)) return false
    if (badge !== 'all') {
      const bs: string[] = [] // AdminProductRow 에 badges 없음(원본 데이터도 없음)
      if (!bs.includes(badge)) return false
    }
    if (dateFrom && p.updatedDate < dateFrom) return false
    if (dateTo && p.updatedDate > dateTo) return false
    const q = query.trim().toLowerCase()
    if (q) {
      if (!(p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))) return false
    }
    return true
  })

  const STATUS_OPTS = [
    { k: 'all', l: '전체 상태' },
    { k: 'selling', l: '판매중' },
    { k: 'low', l: '재고부족' },
    { k: 'out', l: '품절' },
    { k: 'stop', l: '판매중지' },
  ]
  const CAT1_OPTS = [{ k: 'all', l: '전체 1차 카테고리' }, ...TREE.map((c) => ({ k: c.id, l: c.name }))]
  const CAT2_OPTS = [{ k: 'all', l: cat1 === 'all' ? '1차 카테고리를 먼저 선택' : '전체 2차 카테고리' }, ...allowedCat2.map((c) => ({ k: c.id, l: c.name }))]
  const BADGE_OPTS = [
    { k: 'all', l: '전체 상품 표시' },
    { k: 'BEST', l: 'BEST' },
    { k: 'HIT', l: 'HIT' },
    { k: 'NEW', l: 'NEW' },
    { k: '한정', l: '한정' },
    { k: 'SALE', l: 'SALE' },
  ]

  const reset = () => {
    setTab('all')
    setCat1('all')
    setCat2('all')
    setBadge('all')
    setDateFrom('')
    setDateTo('')
    setQuery('')
  }

  const columns: Column<AdminProductRow>[] = [
    { key: 'sku', label: '상품코드', mono: true, nowrap: true, render: (v) => <span style={{ color: '#3a2552' }}>{v as string}</span> },
    {
      key: 'name',
      label: '상품명',
      render: (v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ProductThumb line={r.line} />
          <div style={{ fontWeight: 500, fontSize: 13 }}>{v as string}</div>
        </div>
      ),
    },
    { key: 'categoryName', label: '카테고리', muted: true },
    { key: 'price', label: '판매가', align: 'right', mono: true, render: (v) => wonCompact(v as number) },
    {
      key: 'stockQty',
      label: '재고',
      align: 'right',
      mono: true,
      render: (v) => {
        const n = v as number
        return <span style={{ color: n === 0 ? '#c14d4d' : n < 80 ? '#c08a3a' : 'var(--ad-ink)', fontWeight: n < 80 ? 500 : 400 }}>{n.toLocaleString()}개</span>
      },
    },
    // 원본 '상품 표시' 열 — ADMIN_PRODUCTS 에 badges 없음 → 항상 '—'
    { key: 'sales30', label: '상품 표시', render: () => <span style={{ color: 'var(--ad-muted)' }}>—</span> },
    { key: 'status', label: '상태', render: (v) => <StatusChip status={PRODUCT_STATUS_LABEL[v as ProductStatus]} /> },
    { key: 'updatedDate', label: '등록일', mono: true, muted: true, nowrap: true },
  ]

  return (
    <div style={pageWrap}>
      {/* 검색 카드 */}
      <Card title="상품 검색" subtitle="SEARCH · FILTER" padding={20}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={filterLabel}>검색어 (상품명 · 상품코드)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#fff', border: '1px solid var(--ad-line-strong)', height: 34 }}>
              <span style={{ color: 'var(--ad-muted)', display: 'flex' }}>{AIcon.search(14)}</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="상품명 또는 상품코드를 입력하세요" style={{ border: 'none', outline: 'none', flex: 1, background: 'transparent', fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--ad-ink)', minWidth: 0 }} />
              {query && (
                <button onClick={() => setQuery('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ad-muted)', display: 'flex', padding: 0 }} title="검색어 지우기">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div>
            <div style={filterLabel}>판매 상태</div>
            <AdminDropdown value={tab} onChange={setTab} options={STATUS_OPTS} width="100%" />
          </div>
          <div>
            <div style={filterLabel}>1차 카테고리</div>
            <AdminDropdown value={cat1} onChange={setCat1} options={CAT1_OPTS} width="100%" />
          </div>
          <div>
            <div style={filterLabel}>2차 카테고리</div>
            <AdminDropdown value={cat2} onChange={setCat2} options={CAT2_OPTS} width="100%" />
          </div>

          <div>
            <div style={filterLabel}>상품 표시</div>
            <AdminDropdown value={badge} onChange={setBadge} options={BADGE_OPTS} width="100%" />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={filterLabel}>등록일자</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={dateInput} />
              <span style={{ color: 'var(--ad-muted)' }}>—</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={dateInput} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ad-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ad-muted)', letterSpacing: '0.04em' }}>
            검색 결과 {filteredRows.length.toLocaleString()}건 / 전체 {ADMIN_PRODUCTS.length.toLocaleString()}건
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <AdminBtn onClick={reset}>초기화</AdminBtn>
          </div>
        </div>
      </Card>

      {/* 결과 테이블 */}
      <Card padding={0}>
        <FilterBar
          action={
            <>
              <AdminBtn icon={AIcon.download(13)} size="sm">CSV</AdminBtn>
              <AdminBtn icon={AIcon.plus(13)} size="sm" variant="primary" onClick={() => setAddOpen(true)}>상품 등록</AdminBtn>
            </>
          }
        >
          <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--ad-ink)', fontWeight: 500 }}>상품 목록</div>
        </FilterBar>

        <DataTable columns={columns} rows={filteredRows} rowKey="sku" onRowEdit={(r) => setEditRow(r)} />
        <Pagination page={1} total={filteredRows.length || 83} pageSize={20} onChange={() => {}} />
      </Card>

      <ProductFormModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ProductFormModal open={!!editRow} onClose={() => setEditRow(null)} initial={editRow ?? undefined} />
    </div>
  )
}

// ProductThumb 는 components/admin/ProductThumb 로 승격(주문 상세에서도 사용).

// ─── 상품 등록/수정 모달 ───
type FormOption = { name: string; price: string; stock: string; sort: number | string }
type ProductForm = {
  sku: string
  name: string
  cat1: string
  cat2: string
  price: string
  status: string
  badges: string[]
  shortDesc: string
  description: string
  ingredient: string
  usage: string
  options: FormOption[]
}
type UploadImage = { name: string; size: number; url: string }

const PF_STATUS = ['판매중', '재고부족', '품절', '판매중지']
const PF_BADGES = [
  { k: 'BEST', bg: '#3a2552', fg: '#f5edf7' },
  { k: 'HIT', bg: '#b89968', fg: '#fff' },
  { k: 'NEW', bg: '#3a8a5a', fg: '#fff' },
  { k: '한정', bg: '#a85050', fg: '#fff' },
  { k: 'SALE', bg: '#c08a3a', fg: '#fff' },
]
const fieldStyle: CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid var(--ad-line-strong)', background: '#fff', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ad-ink)', outline: 'none' }
const monoField: CSSProperties = { ...fieldStyle, fontFamily: 'var(--mono)' }
const labelStyle: CSSProperties = { display: 'block', fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', marginBottom: 6, textTransform: 'uppercase' }
const sectionHead: CSSProperties = { fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', marginBottom: 14, textTransform: 'uppercase', paddingBottom: 8, borderBottom: '1px solid var(--ad-line)' }

function ProductFormModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: AdminProductRow }) {
  const TREE = CATEGORY_TREE
  const isEdit = !!initial

  const buildInitialForm = (): ProductForm => {
    if (initial) {
      let cat1 = TREE[0]?.id || ''
      let cat2 = ''
      for (const p of TREE) {
        const match = p.children?.find((c) => c.name === initial.categoryName || c.name.includes(initial.categoryName))
        if (match) {
          cat1 = p.id
          cat2 = match.id
          break
        }
        if (p.name === initial.categoryName) {
          cat1 = p.id
          break
        }
      }
      return {
        sku: initial.sku || '',
        name: initial.name || '',
        cat1,
        cat2,
        price: initial.price?.toString() || '',
        status: PRODUCT_STATUS_LABEL[initial.status],
        badges: [],
        shortDesc: '',
        description: '',
        ingredient: '',
        usage: '',
        options: initial.options
          ? initial.options.map((o) => ({ name: o.name, price: String(o.price), stock: String(o.stockQty), sort: o.sortOrder }))
          : [{ name: '기본', price: initial.price?.toString() || '', stock: initial.stockQty?.toString() || '', sort: 0 }],
      }
    }
    return {
      sku: '',
      name: '',
      cat1: TREE[0]?.id || '',
      cat2: TREE[0]?.children?.[0]?.id || '',
      price: '',
      status: '판매중',
      badges: [],
      shortDesc: '',
      description: '',
      ingredient: '',
      usage: '',
      options: [{ name: '', price: '', stock: '', sort: 0 }],
    }
  }

  const [form, setForm] = useState<ProductForm>(buildInitialForm)
  const [mainImage, setMainImage] = useState<UploadImage | null>(null)
  const [detailImages, setDetailImages] = useState<UploadImage[]>([])
  const [previewOn, setPreviewOn] = useState(false)
  const mainInputRef = useRef<HTMLInputElement>(null)
  const detailInputRef = useRef<HTMLInputElement>(null)

  // 모달이 (다른 행으로) 열릴 때마다 폼 초기화
  useEffect(() => {
    if (open) {
      setForm(buildInitialForm())
      setMainImage(null)
      setDetailImages([])
      setPreviewOn(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.sku])

  useModalDismiss(onClose, open)
  if (!open) return null

  const setField = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) => setForm((prev) => ({ ...prev, [k]: v }))
  const setCat1 = (id: string) => {
    const p = TREE.find((c) => c.id === id)
    setForm((prev) => ({ ...prev, cat1: id, cat2: p?.children?.[0]?.id || '' }))
  }
  const addOption = () => setForm((prev) => ({ ...prev, options: [...prev.options, { name: '', price: '', stock: '', sort: prev.options.length }] }))
  const removeOption = (i: number) => setForm((prev) => (prev.options.length <= 1 ? prev : { ...prev, options: prev.options.filter((_, idx) => idx !== i) }))
  const updateOption = (i: number, key: keyof FormOption, val: string) => setForm((prev) => ({ ...prev, options: prev.options.map((o, idx) => (idx === i ? { ...o, [key]: val } : o)) }))
  const currentParent = TREE.find((c) => c.id === form.cat1)
  const subCats = currentParent?.children || []

  const handleMain = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setMainImage({ name: f.name, size: f.size, url: URL.createObjectURL(f) })
  }
  const handleDetail = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setDetailImages((prev) => [...prev, ...files.map((f) => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }))])
    e.target.value = ''
  }
  const removeDetail = (i: number) => setDetailImages((prev) => prev.filter((_, idx) => idx !== i))

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 10, 28, 0.55)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, animation: 'modalIn .18s ease' }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onClose() }} style={{ background: '#fff', width: 'min(880px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(15, 10, 28, 0.35)', border: '1px solid var(--ad-line-strong)' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 26px', borderBottom: '1px solid var(--ad-line)', flexShrink: 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.18em', marginBottom: 4 }}>{isEdit ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, color: 'var(--ad-ink)' }}>{isEdit ? '상품 수정' : '상품 등록'}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, background: 'transparent', border: '1px solid var(--ad-line-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ad-ink)', flexShrink: 0 }} title="닫기 (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div style={{ padding: 26, overflowY: 'auto', flex: 1, position: 'relative' }}>
          {/* (원본 ProductPreviewView 는 미정의 — 미리보기 패널 렌더 생략) */}

          <div style={sectionHead}>기본 정보</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 18px', marginBottom: 24 }}>
            <div>
              <div style={labelStyle}>상품코드 <span style={{ color: '#a05a5a' }}>*</span></div>
              <input style={monoField} placeholder="BIE-ES-050" value={form.sku} onChange={(e) => setField('sku', e.target.value.toUpperCase())} required />
            </div>
            <div>
              <div style={labelStyle}>상품명 <span style={{ color: '#a05a5a' }}>*</span></div>
              <input style={fieldStyle} placeholder="비온 에센스 50ml" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
            </div>
            <div>
              <div style={labelStyle}>1차 카테고리 <span style={{ color: '#a05a5a' }}>*</span></div>
              <AdminDropdown value={form.cat1} onChange={setCat1} options={TREE.map((c) => ({ k: c.id, l: c.name }))} width="100%" />
            </div>
            <div>
              <div style={labelStyle}>2차 카테고리</div>
              <AdminDropdown
                value={form.cat2 || '__none'}
                onChange={(v) => setField('cat2', v === '__none' ? '' : v)}
                options={subCats.length === 0 ? [{ k: '__none', l: '하위 카테고리 없음' }] : subCats.map((c) => ({ k: c.id, l: c.name }))}
                width="100%"
              />
            </div>
            <div>
              <div style={labelStyle}>판매가 (₩) <span style={{ color: '#a05a5a' }}>*</span></div>
              <input type="number" min="0" step="1000" style={monoField} placeholder="138000" value={form.price} onChange={(e) => setField('price', e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={labelStyle}>판매 상태</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {PF_STATUS.map((s) => {
                  const active = form.status === s
                  return (
                    <button key={s} type="button" onClick={() => setField('status', s)} style={{ padding: '8px 14px', background: active ? '#3a2552' : '#fff', color: active ? '#f5f1ea' : 'var(--ad-ink)', border: `1px solid ${active ? '#3a2552' : 'var(--ad-line-strong)'}`, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12 }}>
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={labelStyle}>상품 표시</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PF_BADGES.map((b) => {
                  const active = form.badges.includes(b.k)
                  return (
                    <button
                      key={b.k}
                      type="button"
                      onClick={() => setField('badges', active ? form.badges.filter((x) => x !== b.k) : [...form.badges, b.k])}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px 8px 10px', background: '#fff', color: 'var(--ad-ink)', border: `1px solid ${active ? '#3a2552' : 'var(--ad-line-strong)'}`, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12 }}
                    >
                      <span style={{ width: 14, height: 14, background: active ? '#3a2552' : 'transparent', border: `1.5px solid ${active ? '#3a2552' : 'var(--ad-line-strong)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {active && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        )}
                      </span>
                      <span style={{ padding: '2px 8px', background: b.bg, color: b.fg, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', fontFamily: 'var(--sans)' }}>{b.k}</span>
                    </button>
                  )
                })}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ad-muted)', letterSpacing: '0.02em' }}>상품 카드 위에 노출되는 라벨입니다. 복수 선택 가능합니다.</div>
            </div>
          </div>

          {/* 옵션 */}
          <div style={sectionHead}>옵션 · 용량별 가격/재고</div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 110px 80px 40px', gap: 10, marginBottom: 8 }}>
              {['옵션명', '판매 단가 (₩)', '재고 (개)', '정렬', ''].map((h, idx) => (
                <div key={idx} style={labelStyle}>{h}</div>
              ))}
            </div>
            {form.options.map((opt, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 110px 80px 40px', gap: 10, marginBottom: 8, alignItems: 'center' }}>
                <input style={fieldStyle} placeholder="50ml" value={opt.name} onChange={(e) => updateOption(i, 'name', e.target.value)} />
                <input type="number" min="0" step="1000" style={monoField} placeholder="138000" value={opt.price} onChange={(e) => updateOption(i, 'price', e.target.value)} />
                <input type="number" min="0" style={monoField} placeholder="0" value={opt.stock} onChange={(e) => updateOption(i, 'stock', e.target.value)} />
                <input type="number" min="0" style={monoField} placeholder="0" value={opt.sort} onChange={(e) => updateOption(i, 'sort', e.target.value)} />
                <button type="button" onClick={() => removeOption(i)} disabled={form.options.length <= 1} title="옵션 삭제" style={{ width: 34, height: 34, background: '#fff', color: form.options.length <= 1 ? 'var(--ad-line-strong)' : '#a8322c', border: '1px solid var(--ad-line-strong)', cursor: form.options.length <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            ))}
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <AdminBtn size="sm" icon={AIcon.plus(13)} onClick={addOption}>옵션 추가</AdminBtn>
              <span style={{ fontSize: 11, color: 'var(--ad-muted)', letterSpacing: '0.02em' }}>옵션이 1개인 상품도 기본 옵션 1건으로 저장됩니다. 위 “판매가”는 대표가(base_price)입니다.</span>
            </div>
          </div>

          {/* 메인 사진 */}
          <div style={sectionHead}>메인 사진</div>
          <div style={{ marginBottom: 24 }}>
            <input ref={mainInputRef} type="file" accept="image/*" onChange={handleMain} style={{ display: 'none' }} />
            {!mainImage ? (
              <button type="button" onClick={() => mainInputRef.current?.click()} style={{ width: '100%', padding: '32px 16px', background: 'var(--ad-paper-2)', border: '1px dashed var(--ad-line-strong)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--ad-muted)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="3" y="4" width="18" height="16" />
                  <path d="M3 16l5-5 4 4 3-3 6 6" />
                  <circle cx="9" cy="9" r="1.5" />
                </svg>
                <span style={{ fontSize: 13 }}>대표 이미지 업로드</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>JPG · PNG · 권장 1200×1500</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, border: '1px solid var(--ad-line)', background: 'var(--ad-paper-2)' }}>
                <img src={mainImage.url} alt="" style={{ width: 96, height: 120, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--ad-line-strong)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, wordBreak: 'break-all' }}>{mainImage.name}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--ad-muted)', marginTop: 4 }}>{(mainImage.size / 1024).toFixed(1)} KB</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <AdminBtn size="sm" onClick={() => mainInputRef.current?.click()}>변경</AdminBtn>
                    <AdminBtn size="sm" variant="danger" onClick={() => { URL.revokeObjectURL(mainImage.url); setMainImage(null) }}>제거</AdminBtn>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 상세 페이지 */}
          <div style={sectionHead}>상세 페이지</div>
          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>짧은 설명 (리스트·카드용)</div>
            <input style={fieldStyle} placeholder="리스트·카드에 노출되는 한 줄 설명" value={form.shortDesc} onChange={(e) => setField('shortDesc', e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>상품 설명 (상세 본문)</div>
            <textarea style={{ ...fieldStyle, minHeight: 110, resize: 'vertical', lineHeight: 1.55 }} placeholder="상세 페이지 본문 내용을 작성하세요." value={form.description} onChange={(e) => setField('description', e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>성분</div>
            <textarea style={{ ...fieldStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.55 }} placeholder="전성분 정보를 작성하세요. (예: 정제수, 부틸렌글라이콜, 글리세린 …)" value={form.ingredient} onChange={(e) => setField('ingredient', e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>사용법</div>
            <textarea style={{ ...fieldStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.55 }} placeholder="사용 순서·방법을 작성하세요." value={form.usage} onChange={(e) => setField('usage', e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>상세 이미지 ({detailImages.length}장)</div>
            <input ref={detailInputRef} type="file" accept="image/*" multiple onChange={handleDetail} style={{ display: 'none' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {detailImages.map((img, i) => (
                <div key={i} style={{ position: 'relative', width: 96, height: 120, border: '1px solid var(--ad-line-strong)' }}>
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeDetail(i)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, background: 'rgba(15,10,28,0.78)', color: '#f5f1ea', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="제거">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, background: 'rgba(15,10,28,0.78)', color: '#f5f1ea', padding: '2px 6px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.04em' }}>{i + 1}</div>
                </div>
              ))}
              <button type="button" onClick={() => detailInputRef.current?.click()} style={{ width: 96, height: 120, background: 'var(--ad-paper-2)', border: '1px dashed var(--ad-line-strong)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--ad-muted)', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                추가
              </button>
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '16px 26px', borderTop: '1px solid var(--ad-line)', background: 'var(--ad-paper-2)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setPreviewOn((p) => !p)} style={{ padding: '8px 14px', background: previewOn ? '#3a2552' : '#fff', color: previewOn ? '#f5f1ea' : 'var(--ad-ink)', border: `1px solid ${previewOn ? '#3a2552' : 'var(--ad-line-strong)'}`, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12.5, letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {previewOn ? '편집으로' : '미리보기'}
            </button>
            {isEdit && (
              <button
                type="button"
                className="ad-del-btn"
                onClick={() => {
                  if (window.confirm(`"${form.name || form.sku}" 상품을 정말 삭제하시겠습니까?`)) onClose()
                }}
                style={{ padding: '8px 18px', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12.5, letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
                </svg>
                상품 삭제
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <AdminBtn onClick={onClose}>취소</AdminBtn>
            <button type="submit" style={{ padding: '8px 18px', background: '#3a2552', color: '#f5f1ea', border: '1px solid #3a2552', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12.5, letterSpacing: '0.02em' }}>{isEdit ? '수정 저장' : '상품 등록'}</button>
          </div>
        </div>
      </form>
    </div>
  )
}
