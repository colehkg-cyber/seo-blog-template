// YouTube API 설정
// DB 설정을 우선 조회하고, 없으면 환경 변수 fallback

import { getSettingValue } from './settings'

export async function getYouTubeConfig() {
  const apiKey = (await getSettingValue('YOUTUBE_API_KEY')) || ''
  const channelId = (await getSettingValue('YOUTUBE_CHANNEL_ID')) || ''

  if (!apiKey) {
    console.error('YOUTUBE_API_KEY is not set in DB or environment variables!')
  }

  if (!channelId) {
    console.error('YOUTUBE_CHANNEL_ID is not set in DB or environment variables!')
  }

  return { apiKey, channelId }
}
