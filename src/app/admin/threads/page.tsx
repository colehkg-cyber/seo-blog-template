'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ThreadsPost {
  id: string
  text?: string
  media_type: string
  media_url?: string
  permalink: string
  username: string
  timestamp: string
  isPosted?: boolean
  postDetails?: {
    id: string
    slug: string
    status: string
  } | null
}

interface ThreadsAccount {
  name: string
  displayName: string
  tokenKey: string
  isConfigured: boolean
}

type PostedFilter = 'all' | 'posted' | 'not-posted'

export default function ThreadsManagerPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<ThreadsAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [posts, setPosts] = useState<ThreadsPost[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [postedFilter, setPostedFilter] = useState<PostedFilter>('all')

  // Single post creation
  const [selectedPost, setSelectedPost] = useState<ThreadsPost | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Bulk selection
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [isBulkCreating, setIsBulkCreating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/threads/accounts')
      if (!response.ok) throw new Error('Failed to fetch accounts')
      const data = await response.json()
      setAccounts(data.accounts || [])
      if (data.accounts?.length > 0 && !selectedAccount) {
        setSelectedAccount(data.accounts[0].name)
      }
    } catch (err) {
      console.error('Error fetching accounts:', err)
    }
  }

  // Fetch posts when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchPosts()
    }
  }, [selectedAccount])

  const fetchPosts = async (cursor?: string) => {
    if (!selectedAccount) return

    if (!cursor) {
      setLoading(true)
      setPosts([])
    } else {
      setLoadingMore(true)
    }
    setError('')

    try {
      const params = new URLSearchParams({
        account: selectedAccount,
        limit: '25',
      })
      if (cursor) params.set('after', cursor)

      const response = await fetch(`/api/threads/posts?${params.toString()}`)
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to fetch posts')
      }

      const data = await response.json()

      if (cursor) {
        setPosts(prev => [...prev, ...(data.posts || [])])
      } else {
        setPosts(data.posts || [])
      }
      setNextCursor(data.nextCursor)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Threads posts')
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const createBlogFromThread = async (post: ThreadsPost) => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/threads-to-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadPost: post,
          accountName: selectedAccount,
          autoPublish: false,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create blog post')
      }

      // Update UI
      setPosts(prev =>
        prev.map(p => (p.id === post.id ? { ...p, isPosted: true } : p))
      )
      router.refresh()
    } catch (err) {
      alert(`포스트 생성 실패:\n${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsCreating(false)
      setSelectedPost(null)
    }
  }

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    const eligible = filteredPosts.filter(p => !p.isPosted && p.text && p.text.length >= 50)
    setSelectedPosts(new Set(eligible.map(p => p.id)))
  }

  const clearSelection = () => {
    setSelectedPosts(new Set())
  }

  const createBulkPosts = async () => {
    const postsToCreate = posts.filter(p => selectedPosts.has(p.id))
    if (postsToCreate.length === 0) return

    setIsBulkCreating(true)
    setBulkProgress({ current: 0, total: postsToCreate.length })

    const results = { success: 0, failed: 0, errors: [] as string[] }

    for (let i = 0; i < postsToCreate.length; i++) {
      const post = postsToCreate[i]
      setBulkProgress({ current: i + 1, total: postsToCreate.length })

      try {
        const response = await fetch('/api/threads-to-blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadPost: post,
            accountName: selectedAccount,
            autoPublish: false,
          }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || 'Failed')
        }

        results.success++
        setPosts(prev =>
          prev.map(p => (p.id === post.id ? { ...p, isPosted: true } : p))
        )
        setSelectedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(post.id)
          return newSet
        })
      } catch (error) {
        results.failed++
        results.errors.push(
          `${(post.text || '').substring(0, 30)}...: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }

      // Delay between requests
      if (i < postsToCreate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    setIsBulkCreating(false)
    setBulkProgress({ current: 0, total: 0 })

    let message = `완료!\n성공: ${results.success}개\n실패: ${results.failed}개`
    if (results.errors.length > 0) {
      message += `\n\n실패한 항목:\n${results.errors.slice(0, 5).join('\n')}`
    }
    alert(message)
    router.refresh()
  }

  const getMediaTypeBadge = (mediaType: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      TEXT_POST: { label: 'TEXT', color: 'bg-gray-200 text-gray-700' },
      IMAGE: { label: 'IMAGE', color: 'bg-blue-100 text-blue-700' },
      VIDEO: { label: 'VIDEO', color: 'bg-purple-100 text-purple-700' },
      CAROUSEL_ALBUM: { label: 'CAROUSEL', color: 'bg-orange-100 text-orange-700' },
    }
    const badge = badges[mediaType] || { label: mediaType, color: 'bg-gray-200 text-gray-700' }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  // Apply filters
  const filteredPosts = posts.filter(post => {
    if (postedFilter === 'posted' && !post.isPosted) return false
    if (postedFilter === 'not-posted' && post.isPosted) return false
    return true
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Threads 글 관리</h1>
        <div className="flex items-center gap-3">
          <a
            href="/admin/threads-sync"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            설정/동기화
          </a>
          <button
            onClick={() => fetchPosts()}
            disabled={loading || !selectedAccount}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '로딩중...' : '새로고침'}
          </button>
        </div>
      </div>

      {/* Account selector + Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">계정 선택</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {accounts.length === 0 && (
                <option value="">계정 없음 - 설정에서 토큰을 등록하세요</option>
              )}
              {accounts.map(account => (
                <option key={account.name} value={account.name}>
                  {account.displayName} {!account.isConfigured ? '(미설정)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">포스트 상태</label>
            <select
              value={postedFilter}
              onChange={(e) => setPostedFilter(e.target.value as PostedFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="posted">포스트 작성됨</option>
              <option value="not-posted">포스트 미작성</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          총 {posts.length}개 글 중 {filteredPosts.length}개 표시 중
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Bulk Actions */}
      {filteredPosts.filter(p => !p.isPosted).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
              >
                전체 선택 ({filteredPosts.filter(p => !p.isPosted && p.text && p.text.length >= 50).length}개)
              </button>
              {selectedPosts.size > 0 && (
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                >
                  선택 해제
                </button>
              )}
              <span className="text-sm text-gray-600">{selectedPosts.size}개 선택됨</span>
            </div>

            {selectedPosts.size > 0 && (
              <button
                onClick={createBulkPosts}
                disabled={isBulkCreating}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {isBulkCreating
                  ? `생성 중... (${bulkProgress.current}/${bulkProgress.total})`
                  : `선택한 항목 포스트 생성 (${selectedPosts.size}개)`}
              </button>
            )}
          </div>
        </div>
      )}

      {loading && !posts.length ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-md p-5 relative"
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  {!post.isPosted && post.text && post.text.length >= 50 && (
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedPosts.has(post.id)}
                        onChange={() => togglePostSelection(post.id)}
                        className="w-5 h-5 cursor-pointer accent-green-600"
                      />
                    </div>
                  )}

                  {/* Media preview */}
                  {post.media_url && post.media_type !== 'TEXT_POST' && (
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded overflow-hidden">
                      {post.media_type === 'VIDEO' ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
                          VIDEO
                        </div>
                      ) : (
                        <img
                          src={post.media_url}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getMediaTypeBadge(post.media_type)}
                      <span className="text-xs text-gray-500">
                        {new Date(post.timestamp).toLocaleString('ko-KR')}
                      </span>
                      <span className="text-xs text-gray-400">@{post.username}</span>
                      {post.isPosted && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                          포스트 작성됨
                        </span>
                      )}
                      {post.text && post.text.length < 50 && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                          50자 미만
                        </span>
                      )}
                    </div>

                    <p className="text-gray-800 text-sm whitespace-pre-wrap line-clamp-4">
                      {post.text || '(텍스트 없음)'}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      {!post.isPosted ? (
                        <button
                          onClick={() => setSelectedPost(post)}
                          disabled={!post.text || post.text.length < 50}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          포스트 생성
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (post.postDetails?.id) {
                              router.push(`/admin/edit/${post.postDetails.id}`)
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          포스트 편집
                        </button>
                      )}
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                      >
                        원본 보기
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              {posts.length === 0
                ? '글이 없습니다. 계정을 선택하고 새로고침해주세요.'
                : '필터 조건에 맞는 글이 없습니다.'}
            </div>
          )}

          {/* Load More */}
          {nextCursor && (
            <div className="text-center mt-8">
              <button
                onClick={() => fetchPosts(nextCursor)}
                disabled={loadingMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    로딩중...
                  </>
                ) : (
                  '더 보기'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Post Confirmation Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4">포스트 생성 확인</h2>
            <p className="mb-2 text-sm text-gray-600">이 Threads 글로 블로그 포스트를 생성하시겠습니까?</p>
            <div className="bg-gray-50 p-3 rounded mb-4 max-h-40 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{selectedPost.text}</p>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              AI가 짧은 글을 풀 블로그 포스트로 확장합니다. DRAFT 상태로 생성됩니다.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={isCreating}
              >
                취소
              </button>
              <button
                onClick={() => createBlogFromThread(selectedPost)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={isCreating}
              >
                {isCreating ? '생성 중...' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
