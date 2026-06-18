// 내 정보 수정 / 비밀번호 변경 API — 출처 계약: docs/micoz_api.md §2.2·§2.3 + Swagger 교차확인. 인증 필요.
// UserInfoResponse 의 birthDate/zipCode/address 등은 Swagger 에 실재(명세 "(추정)" 해소)하나 값이 없으면 응답에서 생략(nullable).
import { useMutation } from '@tanstack/react-query'
import { apiPatch, apiPut, ApiError } from './client'
import { catalogErrorMessage } from './catalog'
import type { UserInfoResponse } from './auth'

/* ─── DTO (Swagger 그대로) ─────────────────────────────── */
export interface UpdateUserRequest {
  userName?: string
  email?: string
  phone?: string
  birthDate?: string
  zipCode?: string
  address?: string
  addressDetail?: string
}
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string // 8~64
}

/* ─── 에러 문구 ───────────────────────────────────────── */
export function profileErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === 'AUTH_INVALID_CREDENTIALS') return '현재 비밀번호가 일치하지 않습니다.'
    if (err.code === 'COMMON_VALIDATION_ERROR') return err.message
  }
  return catalogErrorMessage(err)
}

/* ─── API 함수 ────────────────────────────────────────── */
function updateProfileApi(body: UpdateUserRequest): Promise<UserInfoResponse> {
  return apiPatch<UserInfoResponse>('/me', body)
}
function changePasswordApi(body: ChangePasswordRequest): Promise<void> {
  return apiPut<void>('/me/password', body)
}

/* ─── 뮤테이션 훅 ─────────────────────────────────────── */
export function useUpdateProfile() {
  return useMutation({ mutationFn: (body: UpdateUserRequest) => updateProfileApi(body) })
}
// 성공 시 서버가 사용자 전체 refresh 를 revoke(§2.3) → 호출부에서 재로그인 유도.
export function useChangePassword() {
  return useMutation({ mutationFn: (body: ChangePasswordRequest) => changePasswordApi(body) })
}
