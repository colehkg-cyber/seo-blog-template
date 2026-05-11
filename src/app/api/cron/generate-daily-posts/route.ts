export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify that this is a legitimate cron job request
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🤖 Hourly blog post generation started (1 post per run)...');
    const startTime = Date.now();

    // Import and execute the generation script
    // Note: We need to dynamically import since this is in the Edge runtime
    const { generateDailyPosts } = await import('@/../scripts/generate-daily-posts');

    const result = await generateDailyPosts();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ Hourly blog post generation completed in ${duration}s`);

    return NextResponse.json({
      success: true,
      message: `Generated ${result.success} posts successfully`,
      stats: {
        successful: result.success,
        failed: result.failed,
        dryRun: result.dryRun,
        durationSeconds: parseFloat(duration),
        errors: result.errors || []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in hourly post generation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate hourly post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Vercel cron sends GET requests - trigger generation
export async function GET(request: NextRequest) {
  return POST(request);
}

// Export runtime configuration
export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel Hobby plan max
