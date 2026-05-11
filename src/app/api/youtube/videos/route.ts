export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server';
import { getChannelVideos } from '@/lib/youtube';
import { prisma } from '@/lib/prisma';
import { getSettingValue } from '@/lib/settings';

export async function GET(request: Request) {
  try {
    const apiKey = await getSettingValue('YOUTUBE_API_KEY')
    const channelId = await getSettingValue('YOUTUBE_CHANNEL_ID')

    console.log('YouTube API Debug:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      hasChannelId: !!channelId,
      channelId: channelId || 'NOT_SET',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

    if (!apiKey || !channelId) {
      return NextResponse.json(
        {
          error: 'YouTube API not configured',
          message: 'Please configure YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID in Admin Settings or Vercel Dashboard',
          debug: {
            apiKeyMissing: !apiKey,
            channelIdMissing: !channelId,
            environment: process.env.NODE_ENV || 'unknown'
          }
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const pageToken = searchParams.get('pageToken') || undefined;

    const { videos, nextPageToken } = await getChannelVideos(limit, pageToken);
    
    // Check which videos are already posted
    const videoIds = videos.map(v => v.id);
    console.log('Checking videos:', videoIds.length, 'videos');
    
    const existingPosts = await prisma.post.findMany({
      where: {
        youtubeVideoId: {
          in: videoIds
        }
      },
      select: {
        youtubeVideoId: true,
        id: true,
        slug: true,
        status: true
      }
    });
    
    console.log('Found existing posts:', existingPosts.length);
    
    // Create a map for quick lookup
    const postedVideosMap = new Map(
      existingPosts.map(post => [post.youtubeVideoId, post])
    );
    
    // Add posted status to videos
    const videosWithStatus = videos.map(video => ({
      ...video,
      isPosted: postedVideosMap.has(video.id),
      postDetails: postedVideosMap.get(video.id) || null
    }));
    
    return NextResponse.json({
      videos: videosWithStatus,
      nextPageToken
    });
  } catch (error: any) {
    console.error('Error in YouTube API:', error);
    console.error('Error stack:', error?.stack);
    
    // 더 상세한 에러 정보 반환
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      message: errorMessage,
      type: error?.constructor?.name || 'UnknownError',
      // Google API 에러의 경우 추가 정보
      ...(error?.response?.data && { apiError: error.response.data }),
      env: {
        note: 'Check admin settings or environment variables'
      }
    };
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch YouTube videos',
        details: errorDetails
      },
      { status: 500 }
    );
  }
}