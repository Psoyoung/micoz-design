// 장바구니 — 게스트(localStorage) + 서버 이중 모드.
// CartProvider 는 게스트 스토어(localStorage) + 드로어 상태를 유지(삭제 금지 — 게스트/병합용).
// useCart() 한 인터페이스: 비로그인=게스트 로컬, 로그인=서버 카트(React Query). UI 는 모드 무관.
// 로그인해도 로컬 카트는 localStorage 에 보존(병합은 Phase 3b). 손실 금지.
import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { CartItem, ProductSummary, ProductOption } from '../lib/data'
import { useAuth, setCartMergeHandler } from '../auth/AuthContext'
import { useServerCart, addCartApi } from '../api/cart'
import { useToast } from './ToastContext'

const STORAGE_KEY = 'micoz.cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartItem[]) : []
  } catch {
    return []
  }
}

// 내부 컨텍스트 — 게스트 스토어 + 드로어 상태
type GuestCartValue = {
  items: CartItem[]
  add: (product: ProductSummary, option: ProductOption, qty?: number) => void
  remove: (cartId: string) => void
  updateQty: (cartId: string, qty: number) => void
  clear: () => void
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<GuestCartValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const qc = useQueryClient()
  const { show } = useToast()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* 저장 실패는 무시 */
    }
  }, [items])

  // [로그인 카트 병합] AuthContext.login 이 호출하는 핸들러 등록.
  // 게스트 로컬 항목을 POST /cart 로 순차 리플레이(서버가 수량 합산) → 로컬 clear + ['cart'] 무효화.
  // 품절/옵션필수/미존재 등 항목별 실패는 건너뛰고 수집 → 병합 후 안내. (stale closure 회피용 ref)
  const itemsRef = useRef(items)
  itemsRef.current = items
  useEffect(() => {
    const merge = async () => {
      const guest = itemsRef.current
      if (guest.length === 0) return
      let skipped = 0
      for (const it of guest) {
        try {
          await addCartApi({
            productSeq: it.product.id,
            optionSeq: it.option.id > 0 ? it.option.id : undefined,
            quantity: it.quantity,
          })
        } catch {
          // 항목별 실패(PRODUCT_SOLD_OUT/CART_OPTION_REQUIRED/미존재 등)는 건너뛰고 계속 — 병합은 best-effort.
          skipped += 1
        }
      }
      setItems([]) // 로컬 게스트 카트 비움(localStorage 는 effect 로 동기화)
      void qc.invalidateQueries({ queryKey: ['cart'] })
      if (skipped > 0) show('일부 상품은 담기지 못했습니다 (재고/옵션). 장바구니에서 확인해주세요.')
    }
    setCartMergeHandler(merge)
    return () => setCartMergeHandler(null)
  }, [qc, show])

  const add = useCallback((product: ProductSummary, option: ProductOption, qty: number = 1) => {
    const cartId = `${product.id}-${option.id}`
    setItems((prev) => {
      const exist = prev.find((i) => i.cartId === cartId)
      if (exist) return prev.map((i) => (i.cartId === cartId ? { ...i, quantity: i.quantity + qty } : i))
      return [...prev, { cartId, product, option, quantity: qty }]
    })
  }, [])
  const remove = useCallback((cartId: string) => setItems((prev) => prev.filter((i) => i.cartId !== cartId)), [])
  const updateQty = useCallback((cartId: string, qty: number) => setItems((prev) => prev.map((i) => (i.cartId === cartId ? { ...i, quantity: qty } : i))), [])
  const clear = useCallback(() => setItems([]), [])
  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, drawerOpen, openDrawer, closeDrawer }}>
      {children}
    </CartContext.Provider>
  )
}

// 공개 이중모드 인터페이스 — add/updateQty/remove 는 Promise 반환(서버 모드 에러 await/catch 용).
export interface UseCart {
  items: CartItem[]
  add: (product: ProductSummary, option: ProductOption, qty?: number) => Promise<void>
  // 빠른 담기(카드) — 옵션 미지정. 서버 모드: 옵션 필수면 CART_OPTION_REQUIRED throw(호출부가 상세로 유도).
  quickAdd: (product: ProductSummary, qty?: number) => Promise<void>
  remove: (cartId: string) => Promise<void>
  updateQty: (cartId: string, qty: number) => Promise<void>
  clear: () => Promise<void>
  count: number
  total: number
  mode: 'guest' | 'server'
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch?: () => void
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): UseCart {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart 는 CartProvider 내부에서만 사용할 수 있습니다.')
  const { isAuthenticated } = useAuth()
  const server = useServerCart(isAuthenticated) // 훅은 항상 호출(쿼리는 enabled 로 게이트)

  const drawer = { drawerOpen: ctx.drawerOpen, openDrawer: ctx.openDrawer, closeDrawer: ctx.closeDrawer }
  const totals = (items: CartItem[]) => ({
    count: items.reduce((s, i) => s + i.quantity, 0),
    total: items.reduce((s, i) => s + i.option.price * i.quantity, 0),
  })

  if (isAuthenticated) {
    const items = server.items
    return {
      items,
      add: async (p, o, q = 1) => { await server.add(p, o, q) },
      quickAdd: async (p, q = 1) => { await server.quickAdd(p, q) },
      remove: async (id) => { await server.remove(id) },
      updateQty: async (id, q) => { await server.updateQty(id, q) },
      clear: server.clear,
      ...totals(items),
      mode: 'server',
      isLoading: server.isLoading,
      isError: server.isError,
      error: server.error,
      refetch: () => void server.refetch(),
      ...drawer,
    }
  }
  const items = ctx.items
  return {
    items,
    add: async (p, o, q = 1) => { ctx.add(p, o, q) },
    // 게스트 빠른 담기 — 로컬 스토어는 cartId 용 옵션이 필요해 기본 옵션(basePrice)으로 담음(로컬 전용, 격리).
    quickAdd: async (p, q = 1) => { ctx.add(p, { id: 0, name: '기본', price: p.basePrice }, q) },
    remove: async (id) => { ctx.remove(id) },
    updateQty: async (id, q) => { ctx.updateQty(id, q) },
    clear: async () => { ctx.clear() },
    ...totals(items),
    mode: 'guest',
    isLoading: false,
    isError: false,
    error: null,
    ...drawer,
  }
}
