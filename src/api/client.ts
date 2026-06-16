// axios 클라이언트 — 출처 계약: docs/micoz_api.md §0.
// 핵심: 응답 봉투(ApiResponse) 를 바디 `code` 로 분기한다.
//   - HTTP 200 이라도 code !== 'SUCCESS' 면 비즈니스 오류(명세 §0.4 함정) → ApiError throw.
//   - 401/403 은 Security 단에서 실제 HTTP status 를 설정(envelope 없거나 data 생략) → ApiError 로 정규화.
// 인증 헤더 주입(§0.5)만 여기서. refresh 로테이션·강제 로그아웃은 Phase 1b.
import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, ErrorCode } from './types'
import { getAccessToken } from './token'

// 타입드 에러 — code 로 분기, httpStatus 로 재시도 정책 결정.
// 'UNKNOWN' 은 네트워크 오류 등 봉투가 없는 경우의 폴백.
export type ApiErrorCode = ErrorCode | 'UNKNOWN'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly httpStatus: number
  constructor(code: ApiErrorCode, message: string, httpStatus: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.httpStatus = httpStatus
  }
}

export const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// 요청: accessToken 있으면 Bearer 주입 (§0.5)
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 응답: 봉투 언랩 + code 분기
client.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown> | undefined
    // 정상 봉투인데 SUCCESS 가 아니면(HTTP 200 비즈니스 오류) throw
    if (body && typeof body.code === 'string' && body.code !== 'SUCCESS') {
      throw new ApiError(body.code as ApiErrorCode, body.message ?? '요청을 처리하지 못했습니다.', response.status)
    }
    return response
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    // 4xx/5xx — Security(401/403) 포함. 봉투 code 가 있으면 그대로, 없으면 UNKNOWN 정규화.
    const status = error.response?.status ?? 0
    const body = error.response?.data
    if (body && typeof body.code === 'string') {
      return Promise.reject(new ApiError(body.code as ApiErrorCode, body.message ?? error.message, status))
    }
    return Promise.reject(new ApiError('UNKNOWN', error.message || '네트워크 오류가 발생했습니다.', status))
  },
)

// ─── 타입드 래퍼 (봉투의 data 를 언랩해 T 로 반환) ───
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await client.get<ApiResponse<T>>(url, config)
  return res.data.data as T
}
export async function apiPost<T>(url: string, payload?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await client.post<ApiResponse<T>>(url, payload, config)
  return res.data.data as T
}
export async function apiPatch<T>(url: string, payload?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await client.patch<ApiResponse<T>>(url, payload, config)
  return res.data.data as T
}
export async function apiPut<T>(url: string, payload?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await client.put<ApiResponse<T>>(url, payload, config)
  return res.data.data as T
}
export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await client.delete<ApiResponse<T>>(url, config)
  return res.data.data as T
}
