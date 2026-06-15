// 관리자 카테고리 트리 — 출처: 원본 admin/admin-data.jsx CATEGORIES_TREE (값 보존)
// visible → isVisible(boolean). level 은 스키마 category_level(1-based)에 정렬:
// 목업 0-based 값을 +1 시프트 (최상위 0→1=대분류, 1→2=중분류). 트리 구조·다른 값은 보존.

import type { CategoryTreeNode } from './types'

export const CATEGORY_TREE: CategoryTreeNode[] = [
  {
    id: 'c-skin',
    name: '스킨케어',
    level: 1,
    productCount: 42,
    isVisible: true,
    children: [
      { id: 'c-skin-essence', name: '에센스 · 앰플', level: 2, productCount: 14, isVisible: true },
      { id: 'c-skin-serum', name: '세럼', level: 2, productCount: 11, isVisible: true },
      { id: 'c-skin-cream', name: '크림 · 모이스처', level: 2, productCount: 9, isVisible: true },
      { id: 'c-skin-toner', name: '토너 · 미스트', level: 2, productCount: 8, isVisible: true },
    ],
  },
  {
    id: 'c-clean',
    name: '클렌징',
    level: 1,
    productCount: 14,
    isVisible: true,
    children: [
      { id: 'c-clean-foam', name: '폼 · 젤', level: 2, productCount: 6, isVisible: true },
      { id: 'c-clean-oil', name: '오일 · 밤', level: 2, productCount: 5, isVisible: true },
      { id: 'c-clean-pad', name: '클렌징 패드', level: 2, productCount: 3, isVisible: false },
    ],
  },
  {
    id: 'c-spec',
    name: '스페셜케어',
    level: 1,
    productCount: 18,
    isVisible: true,
    children: [
      { id: 'c-spec-mask', name: '마스크 팩', level: 2, productCount: 9, isVisible: true },
      { id: 'c-spec-eye', name: '아이케어', level: 2, productCount: 5, isVisible: true },
      { id: 'c-spec-neck', name: '넥 · 데콜테', level: 2, productCount: 4, isVisible: true },
    ],
  },
  { id: 'c-set', name: '세트 · 키트', level: 1, productCount: 11, isVisible: true },
  { id: 'c-mens', name: '맨즈 라인', level: 1, productCount: 7, isVisible: true },
  { id: 'c-disc', name: '아카이브 · 단종', level: 1, productCount: 9, isVisible: false },
]
