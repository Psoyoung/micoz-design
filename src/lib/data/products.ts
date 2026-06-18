// 쇼핑몰 컬렉션(에디토리얼) — 출처: 원본 shop/data.jsx (값 보존)
// PRODUCTS·STOREFRONT_CATEGORIES 시드는 카탈로그 API(api/catalog) 로 대체되어 제거(Phase 6a).
// COLLECTIONS 는 API 없는 에디토리얼 정적 데이터(MobileHome 시그니처 컬렉션) — 의도된 정적으로 보존.

import type { Collection } from './types'

export const COLLECTIONS: Collection[] = [
  {
    id: 'c1',
    title: '엑소이브',
    sub: 'EXOIV',
    desc: '피부 본연의 빛을 깨우는 시그니처 라인',
    tag: 'MICOZ SIGNATURE · SKINCARE',
    body: '에센스 부스터부터 안티에이징 크림까지, 매일의 결을 정교하게 다듬어줍니다.',
    grad: 'linear-gradient(155deg, #f5efe6 0%, #ece2d4 100%)',
    img: '/image/main1.jpg',
  },
  {
    id: 'c2',
    title: '스피샷 9',
    sub: 'SPISHOT 9',
    desc: '집에서 완성하는 프리미엄 홈뷰티',
    tag: 'MICOZ DEVICE · HOME BEAUTY',
    body: '간편한 사용감과 정교한 기술이 만나, 일상 속 케어의 새로운 기준이 됩니다.',
    grad: 'linear-gradient(155deg, #f0f0f0 0%, #d8d8d8 100%)',
    img: '/image/main2.jpg',
  },
]
