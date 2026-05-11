'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface SettingInfo {
  masked?: string
  isConfigured: boolean
  source: string
}

const SETTING_LABELS: Record<string, { label: string; description: string }> = {
  YOUTUBE_API_KEY: { label: 'YouTube API Key', description: 'YouTube Data API v3 키' },
  YOUTUBE_CHANNEL_ID: { label: 'YouTube 채널 ID', description: '동기화할 YouTube 채널 ID' },
  GEMINI_API_KEY: { label: 'Gemini API Key', description: 'AI 콘텐츠 생성용' },
  CRON_SECRET: { label: 'Cron Secret', description: 'Cron 작업 인증용' },
  REDEPLOY_WEBHOOK_URL: { label: '재배포 Webhook URL', description: '자동 재배포용 (선택사항)' },
}

function StatusIcon({ source, isConfigured }: { source: string; isConfigured: boolean }) {
  if (!isConfigured) {
    return <span className="text-red-500 text-lg" title="미설정">&#x2716;</span>
  }
  if (source === 'env') {
    return <span className="text-blue-500 text-lg" title="환경변수에서 로드">&#x25CF;</span>
  }
  return <span className="text-green-500 text-lg" title="설정됨">&#x2714;</span>
}

export default function YouTubeSyncPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Settings state
  const [settings, setSettings] = useState<Record<string, SettingInfo>>({})
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({})
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const getAuthHeader = useCallback(() => {
    const password = sessionStorage.getItem('adminPassword') || ''
    return 'Bearer ' + password
  }, [])

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: getAuthHeader() },
      })
      if (!res.ok) throw new Error('Failed to load settings')
      const data = await res.json()
      setSettings(data.settings || {})
    } catch {
      // Settings API might not be available yet, silently fail
      console.warn('Could not load settings')
    } finally {
      setSettingsLoading(false)
    }
  }, [getAuthHeader])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSaveSettings = async () => {
    // Filter out empty values
    const toSave: Record<string, string> = {}
    for (const [key, value] of Object.entries(formValues)) {
      if (value.trim()) {
        toSave[key] = value.trim()
      }
    }

    if (Object.keys(toSave).length === 0) {
      setSaveStatus({ type: 'error', message: '저장할 값이 없습니다.' })
      return
    }

    setSaving(true)
    setSaveStatus(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify(toSave),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Save failed')
      }

      setSaveStatus({
        type: 'success',
        message: `${data.updated?.length || 0}개 설정이 저장되었습니다.`,
      })
      setFormValues({})
      await fetchSettings()
    } catch (err) {
      setSaveStatus({
        type: 'error',
        message: err instanceof Error ? err.message : '저장 실패',
      })
    } finally {
      setSaving(false)
    }
  }

  const testYouTubeSync = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/test-youtube-sync')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">YouTube 자동 동기화</h1>
              <Link
                href="/admin"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                &larr; 관리자 홈으로
              </Link>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 설명 섹션 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                YouTube 자동 포스팅 기능
              </h2>
              <p className="text-blue-700 mb-3">
                이 기능은 YouTube 채널의 새 영상을 자동으로 블로그 포스트로 변환합니다.
              </p>
              <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                <li>매일 정오(12:00)에 자동 실행</li>
                <li>최근 24시간 내 업로드된 영상 확인</li>
                <li>AI를 활용한 블로그 콘텐츠 생성</li>
                <li>중복 포스팅 자동 방지</li>
              </ul>
            </div>

            {/* 수동 실행 버튼 */}
            <div className="flex items-center gap-4">
              <button
                onClick={testYouTubeSync}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    동기화 중...
                  </>
                ) : (
                  '지금 동기화 실행'
                )}
              </button>

              <span className="text-sm text-gray-500">
                수동으로 YouTube 영상 동기화를 실행합니다.
              </span>
            </div>

            {/* 에러 표시 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-semibold">오류 발생:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* 결과 표시 */}
            {result && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  동기화 결과
                </h3>

                {/* 요약 정보 */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <p className="text-sm text-gray-500">전체 영상</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.result?.summary?.total || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <p className="text-sm text-gray-500">성공</p>
                    <p className="text-2xl font-bold text-green-600">
                      {result.result?.summary?.success || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <p className="text-sm text-gray-500">건너뜀</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {result.result?.summary?.skipped || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <p className="text-sm text-gray-500">오류</p>
                    <p className="text-2xl font-bold text-red-600">
                      {result.result?.summary?.error || 0}
                    </p>
                  </div>
                </div>

                {/* 상세 결과 */}
                {result.result?.results && result.result.results.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">상세 내역:</h4>
                    <div className="space-y-2">
                      {result.result.results.map((item: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded border ${
                            item.status === 'success'
                              ? 'bg-green-50 border-green-200'
                              : item.status === 'skipped'
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {item.title || `Video ID: ${item.videoId}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                상태: {item.status === 'success' ? '성공' :
                                      item.status === 'skipped' ? '건너뜀' : '오류'}
                                {item.reason && ` - ${item.reason}`}
                              </p>
                            </div>
                            {item.status === 'success' && item.slug && (
                              <Link
                                href={`/posts/${item.slug}`}
                                target="_blank"
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                              >
                                포스트 보기 &rarr;
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 타임스탬프 */}
                <p className="text-sm text-gray-500 mt-4">
                  실행 시간: {new Date(result.timestamp).toLocaleString('ko-KR')}
                </p>
              </div>
            )}

            {/* YouTube 연결 설정 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                YouTube 연결 설정
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                YouTube 자동 동기화에 필요한 API 키와 설정값을 관리합니다. DB에 저장되며, 미설정 시 환경변수를 사용합니다.
              </p>

              {settingsLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  설정 로드 중...
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(SETTING_LABELS).map(([key, { label, description }]) => {
                    const info = settings[key]
                    const isVisible = visibleFields[key] || false

                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-48 flex-shrink-0">
                          <label className="text-sm font-medium text-gray-700">{label}</label>
                          <p className="text-xs text-gray-400">{description}</p>
                        </div>
                        <div className="flex-1 relative">
                          <input
                            type={isVisible ? 'text' : 'password'}
                            placeholder={
                              info?.isConfigured
                                ? info.masked || '설정됨'
                                : '미설정'
                            }
                            value={formValues[key] || ''}
                            onChange={(e) =>
                              setFormValues((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleFields((prev) => ({ ...prev, [key]: !isVisible }))
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            title={isVisible ? '숨기기' : '보기'}
                          >
                            {isVisible ? (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <div className="w-8 flex-shrink-0 flex justify-center">
                          <StatusIcon
                            source={info?.source || 'none'}
                            isConfigured={info?.isConfigured || false}
                          />
                        </div>
                        <div className="w-16 flex-shrink-0">
                          {info?.isConfigured && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                info.source === 'db'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {info.source === 'db' ? 'DB' : 'ENV'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* 저장 상태 메시지 */}
                  {saveStatus && (
                    <div
                      className={`px-4 py-2 rounded text-sm ${
                        saveStatus.type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {saveStatus.message}
                    </div>
                  )}

                  {/* 저장 버튼 */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
