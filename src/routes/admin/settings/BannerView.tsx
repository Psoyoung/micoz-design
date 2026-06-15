// 관리자 메인 배너 설정 — 출처: 원본 admin/admin-views-2.jsx SettingsMain/AddBannerModal(:1519)
// 인라인 히어로 슬라이드(:1525)를 colocate(단일 사용). lib/data 타입 Banner 사용.
// 필드 대응: 원본 slide {title,sub,link,active} → Banner {title,description,linkUrl,isDisplayed}.
//   type 은 'HERO' 고정, sortOrder 는 위치 기반, imageUrl 은 빈 값(원본 미리보기 파일명은 인덱스 기반 하드코딩).
// 주의(원본 대비): 원본 slide 의 cta(자세히 보기 등)는 Banner 타입에 대응 필드가 없고 화면에 렌더되지도 않아
//   슬라이드 데이터에 보존하지 않음(추가 모달 폼엔 원본대로 남겨두되 Banner 변환 시 제외). 그 외 동작·마크업 보존.
import { useState, useRef, type CSSProperties } from 'react'
import { type Banner } from '../../../lib/data'
import Card from '../../../components/admin/Card'
import AdminBtn from '../../../components/admin/AdminBtn'
import { AIcon } from '../../../components/admin/icons'
import { useModalDismiss } from '../../../lib/useModalDismiss'

const pageWrap: CSSProperties = { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }

const HERO_GRADS = [
  'linear-gradient(155deg, #2a1a3e 0%, #4d3470 45%, #9a7fb8 100%)',
  'linear-gradient(165deg, #18102a 0%, #3a2552 50%, #6b4d8f 100%)',
  'linear-gradient(140deg, #221638 0%, #4d3470 60%, #c4b0d8 100%)',
]

const INITIAL_SLIDES: Banner[] = [
  { id: 1, type: 'HERO', title: '깊은 밤, 보랏빛 정수', description: '비온 에센스 신상 컬렉션', linkUrl: '/collections/bion', imageUrl: '', sortOrder: 1, isDisplayed: true },
  { id: 2, type: 'HERO', title: '제린 세럼 30% OFF', description: '5월 한정 멤버스 프로모션', linkUrl: '/promo/jerin-may', imageUrl: '', sortOrder: 2, isDisplayed: true },
  { id: 3, type: 'HERO', title: '여름을 준비하는 클렌징', description: '여원 클렌저 리뉴얼 출시', linkUrl: '/products/yeowon-clean', imageUrl: '', sortOrder: 3, isDisplayed: false },
]

export default function BannerView() {
  const [slides, setSlides] = useState<Banner[]>(INITIAL_SLIDES)
  const [addOpen, setAddOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const move = (i: number, dir: number) => {
    setSlides((prev) => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }
  const remove = (i: number) => setSlides((prev) => prev.filter((_, idx) => idx !== i))
  const toggle = (i: number) => setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, isDisplayed: !s.isDisplayed } : s)))
  const update = (i: number, k: 'title' | 'description', v: string) => setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)))
  const handleAdded = (data: { title: string; sub: string; link: string }) => {
    const id = Date.now()
    setSlides((prev) => [...prev, { id, type: 'HERO', title: data.title, description: data.sub, linkUrl: data.link, imageUrl: '', sortOrder: prev.length + 1, isDisplayed: true }])
    setAddOpen(false)
    // 새 카드로 살짝 강조 스크롤 (원본 동작 보존)
    setTimeout(() => {
      const el = containerRef.current?.querySelector(`[data-slide-id="${id}"]`) as HTMLElement | null
      if (el) {
        el.style.transition = 'box-shadow .3s'
        el.style.boxShadow = '0 0 0 2px #3a2552'
        setTimeout(() => {
          el.style.boxShadow = ''
        }, 1200)
      }
    }, 50)
  }

  return (
    <div style={pageWrap}>
      <Card title="메인 히어로 배너" subtitle="HERO · 쇼핑몰 첫 화면 슬라이드" padding={0} action={<AdminBtn variant="primary" icon={AIcon.plus(13)} size="sm" onClick={() => setAddOpen(true)}>배너 추가</AdminBtn>}>
        <div ref={containerRef} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {slides.map((s, i) => (
            <div key={s.id} data-slide-id={s.id} style={{ display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: 18, alignItems: 'stretch', padding: 16, background: s.isDisplayed ? '#fff' : 'var(--ad-paper-2)', border: '1px solid var(--ad-line-strong)', opacity: s.isDisplayed ? 1 : 0.78 }}>
              {/* 미리보기 */}
              <div style={{ position: 'relative', background: HERO_GRADS[i % HERO_GRADS.length], color: '#f5f1ea', padding: '20px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 130, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 8, left: 10, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em', opacity: 0.7 }}>SLIDE · {String(i + 1).padStart(2, '0')}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, lineHeight: 1.3, marginBottom: 4 }}>{s.title || '제목 없음'}</div>
                <div style={{ fontSize: 11.5, opacity: 0.8, lineHeight: 1.4 }}>{s.description}</div>
              </div>

              {/* 폼 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <MiniLabel>제목</MiniLabel>
                  <MiniInput value={s.title} onChange={(v) => update(i, 'title', v)} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <MiniLabel>설명</MiniLabel>
                  <MiniInput value={s.description || ''} onChange={(v) => update(i, 'description', v)} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <MiniLabel>대표 이미지</MiniLabel>
                  <div style={{ padding: '8px 12px', border: '1px dashed var(--ad-line-strong)', background: 'var(--ad-paper-2)', fontSize: 12, color: 'var(--ad-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>hero-slide-{String(i + 1).padStart(2, '0')}.jpg · 2560×1080</span>
                    <AdminBtn size="sm">변경</AdminBtn>
                  </div>
                </div>
              </div>

              {/* 우측 컨트롤 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch', justifyContent: 'space-between', minWidth: 110 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} style={miniBtn(i === 0)} title="위로">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 14l6-6 6 6" /></svg>
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1} style={miniBtn(i === slides.length - 1)} title="아래로">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 10l6 6 6-6" /></svg>
                  </button>
                </div>
                <button type="button" onClick={() => toggle(i)} style={{ padding: '6px 10px', background: s.isDisplayed ? '#3a2552' : '#fff', color: s.isDisplayed ? '#f5f1ea' : 'var(--ad-ink)', border: `1px solid ${s.isDisplayed ? '#3a2552' : 'var(--ad-line-strong)'}`, cursor: 'pointer', fontSize: 11.5, fontFamily: 'var(--sans)' }}>{s.isDisplayed ? '노출중' : '숨김'}</button>
                <button type="button" onClick={() => remove(i)} style={{ padding: '6px 10px', background: '#fff', color: '#a8322c', border: '1px solid #d8b0aa', cursor: 'pointer', fontSize: 11.5, fontFamily: 'var(--sans)' }}>삭제</button>
              </div>
            </div>
          ))}
          {slides.length === 0 && (
            <div style={{ padding: '40px 20px', border: '1px dashed var(--ad-line-strong)', background: 'var(--ad-paper-2)', textAlign: 'center', color: 'var(--ad-muted)', fontSize: 13 }}>등록된 메인 배너가 없습니다. 우상단의 "배너 추가"를 눌러 시작하세요.</div>
          )}
        </div>
      </Card>

      <AddBannerModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAdded} />
    </div>
  )
}

// ─── 배너 추가 모달 ───
type BannerForm = { title: string; sub: string; cta: string; link: string }
type UploadImage = { name: string; size: number; url: string }
const fieldStyle: CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid var(--ad-line-strong)', background: '#fff', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ad-ink)', outline: 'none' }
const labelStyle: CSSProperties = { display: 'block', fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', marginBottom: 6, textTransform: 'uppercase' }

function AddBannerModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (data: BannerForm) => void }) {
  const [form, setForm] = useState<BannerForm>({ title: '', sub: '', cta: '자세히 보기', link: '/' })
  const [image, setImage] = useState<UploadImage | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  useModalDismiss(onClose, open)
  if (!open) return null

  const setField = (k: keyof BannerForm, v: string) => setForm((prev) => ({ ...prev, [k]: v }))
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImage({ name: f.name, size: f.size, url: URL.createObjectURL(f) })
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 10, 28, 0.55)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, animation: 'modalIn .18s ease' }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} style={{ background: '#fff', width: 'min(720px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(15, 10, 28, 0.35)', border: '1px solid var(--ad-line-strong)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 26px', borderBottom: '1px solid var(--ad-line)' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.18em', marginBottom: 4 }}>NEW BANNER</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500 }}>배너 추가</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, background: 'transparent', border: '1px solid var(--ad-line-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="닫기 (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: 26, overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 18px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={labelStyle}>제목 <span style={{ color: '#a05a5a' }}>*</span></div>
              <input style={fieldStyle} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="깊은 밤, 보랏빛 정수" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={labelStyle}>설명</div>
              <input style={fieldStyle} value={form.sub} onChange={(e) => setField('sub', e.target.value)} placeholder="비온 에센스 신상 컬렉션" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={labelStyle}>대표 이미지 <span style={{ color: '#a05a5a' }}>*</span></div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              {!image ? (
                <button type="button" onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '28px 16px', background: 'var(--ad-paper-2)', border: '1px dashed var(--ad-line-strong)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--ad-muted)' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="3" y="4" width="18" height="16" />
                    <path d="M3 16l5-5 4 4 3-3 6 6" />
                    <circle cx="9" cy="9" r="1.5" />
                  </svg>
                  <span style={{ fontSize: 13 }}>히어로 이미지 업로드</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>JPG · PNG · 권장 2560×1080</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, border: '1px solid var(--ad-line)', background: 'var(--ad-paper-2)' }}>
                  <img src={image.url} alt="" style={{ width: 140, height: 60, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--ad-line-strong)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, wordBreak: 'break-all' }}>{image.name}</div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--ad-muted)', marginTop: 3 }}>{(image.size / 1024).toFixed(1)} KB</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <AdminBtn size="sm" onClick={() => fileRef.current?.click()}>변경</AdminBtn>
                      <AdminBtn size="sm" variant="danger" onClick={() => { URL.revokeObjectURL(image.url); setImage(null) }}>제거</AdminBtn>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 26px', borderTop: '1px solid var(--ad-line)', background: 'var(--ad-paper-2)' }}>
          <AdminBtn onClick={onClose}>취소</AdminBtn>
          <button type="submit" style={{ padding: '8px 18px', background: '#3a2552', color: '#f5f1ea', border: '1px solid #3a2552', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12.5, letterSpacing: '0.02em' }}>배너 추가</button>
        </div>
      </form>
    </div>
  )
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10.5, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.12em', marginBottom: 4, textTransform: 'uppercase' }}>{children}</div>
}
function MiniInput({ value, onChange, mono, placeholder }: { value?: string; onChange?: (v: string) => void; mono?: boolean; placeholder?: string }) {
  return (
    <input
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', padding: '7px 10px', background: '#fff', border: '1px solid var(--ad-line-strong)', fontFamily: mono ? 'var(--mono)' : 'var(--sans)', fontSize: 12.5, color: 'var(--ad-ink)', outline: 'none' }}
    />
  )
}
const miniBtn = (disabled: boolean): CSSProperties => ({ height: 28, background: '#fff', border: '1px solid var(--ad-line-strong)', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ad-ink)' })
