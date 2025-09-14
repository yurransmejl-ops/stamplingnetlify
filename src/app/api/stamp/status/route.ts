import { NextRequest, NextResponse } from 'next/server';
import { getStampStatus } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username required' },
        { status: 400 }
      );
    }

    console.log(`📊 Checking stamp status for: ${username}`);
    
    const status = await getStampStatus(username);
    
    console.log(`✅ Status retrieved:`, status);

    return NextResponse.json({
      isStampedIn: status.isStampedIn,
      stampId: status.stampId,
      lastStamp: status.lastStamp
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
