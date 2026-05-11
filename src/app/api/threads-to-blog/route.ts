export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { convertThreadToBlog } from '@/lib/threads-to-blog-service'
import { withErrorHandler, ApiError, createSuccessResponse } from '@/lib/error-handler'

/**
 * POST /api/threads-to-blog
 * Convert a Threads post to a blog post using AI
 *
 * Body: { threadPost: ThreadsPost, accountName: string, autoPublish?: boolean }
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  const { threadPost, accountName, autoPublish = false } = body

  if (!threadPost || !threadPost.id || !threadPost.text) {
    throw new ApiError(400, 'threadPost with id and text is required')
  }

  if (!accountName) {
    throw new ApiError(400, 'accountName is required')
  }

  const result = await convertThreadToBlog({
    threadPost,
    accountName,
    autoPublish,
  })

  return createSuccessResponse(result, new URL(request.url).pathname)
})
