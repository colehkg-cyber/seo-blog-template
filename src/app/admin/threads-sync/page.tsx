'use client'

import { useState, useEffect } from 'react'

interface ThreadsAccount {
  name: string
  displayName: string
  tokenKey: string
  isConfigured: boolean
}

export default function ThreadsSyncPage() {
  const [accounts, setAccounts] = useState<ThreadsAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // New token form
  const [newAccountSuffix, setNewAccountSuffix] = useState('')
  const [newToken, setNewToken] = useState('')
  const [saving, setSaving] = useState(false)

  // Refresh state
  const [refreshing, setRefreshing] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/threads/accounts')
      if (!response.ok) throw new Error('Failed to fetch accounts')
      const data = await response.json()
      setAccounts(data.accounts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const saveToken = async () => {
    if (!newAccountSuffix.trim() || !newToken.trim()) {
      setError('계정 이름과 토큰을 모두 입력해주세요')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/threads/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          accountSuffix: newAccountSuffix.trim().toUpperCase().replace(/\s+/g, '_'),
          token: newToken.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save token')
      }

      setSuccess('토큰이 저장되었습니다')
      setNewAccountSuffix('')
      setNewToken('')
      fetchAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save token')
    } finally {
      setSaving(false)
    }
  }

  const refreshToken = async (accountSuffix: string) => {
    setRefreshing(accountSuffix)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/threads/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refresh',
          accountSuffix,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to refresh token')
      }

      const data = await response.json()
      const expiresInDays = Math.floor((data.expiresIn || 0) / 86400)
      setSuccess(`토큰 갱신 완료! 만료까지 ${expiresInDays}일`)
      fetchAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh token')
    } finally {
      setRefreshing(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Threads 설정 / 동기화</h1>
        <a
          href="/admin/threads"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          글 관리로 이동
        </a>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded mb-6">
          {success}
          <button onClick={() => setSuccess('')} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Registered Accounts */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">등록된 계정</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : accounts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">등록된 계정이 없습니다. 아래에서 토큰을 등록하세요.</p>
          ) : (
            <div className="space-y-3">
              {accounts.map(account => (
                <div
                  key={account.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{account.displayName}</span>
                    <span className="text-xs text-gray-500 ml-2">({account.tokenKey})</span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                        account.isConfigured
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {account.isConfigured ? '활성' : '미설정'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => refreshToken(account.name)}
                      disabled={refreshing === account.name || !account.isConfigured}
                      className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 disabled:opacity-50"
                    >
                      {refreshing === account.name ? '갱신 중...' : '토큰 갱신'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add New Account Token */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">새 토큰 등록</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              계정 이름 (영문, 예: PARTNERS_DANA)
            </label>
            <input
              type="text"
              value={newAccountSuffix}
              onChange={e => setNewAccountSuffix(e.target.value)}
              placeholder="PARTNERS_DANA"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              THREADS_TOKEN_ 뒤에 붙는 이름입니다. 자동으로 대문자로 변환됩니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Token
            </label>
            <input
              type="password"
              value={newToken}
              onChange={e => setNewToken(e.target.value)}
              placeholder="THAAW29b..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Threads API에서 발급받은 Long-lived access token을 입력하세요. 토큰은 60일마다 갱신이 필요합니다.
            </p>
          </div>

          <button
            onClick={saveToken}
            disabled={saving || !newAccountSuffix.trim() || !newToken.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '토큰 저장'}
          </button>
        </div>
      </div>

      {/* Guide */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Threads API 토큰 발급 가이드</h2>
        </div>
        <div className="p-4 text-sm text-gray-600 space-y-2">
          <p>1. <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Meta for Developers</a>에서 앱을 생성합니다.</p>
          <p>2. Threads API 사용 권한을 추가합니다.</p>
          <p>3. Authorization Code를 발급받고 Short-lived token으로 교환합니다.</p>
          <p>4. Short-lived token을 Long-lived token으로 교환합니다.</p>
          <p>5. Long-lived token을 위 폼에 입력하여 저장합니다.</p>
          <p className="text-yellow-600 font-medium mt-4">
            * Long-lived token은 60일마다 만료됩니다. 만료 전에 &quot;토큰 갱신&quot; 버튼을 클릭하세요.
          </p>
        </div>
      </div>
    </div>
  )
}
