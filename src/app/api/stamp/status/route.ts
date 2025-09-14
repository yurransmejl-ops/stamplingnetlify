import { NextRequest, NextResponse } from 'next/server';

// Same stamp storage as main stamp endpoint
let stamps: { [username: string]: { isStampedIn: boolean; stampId: string | null; history: any[] } } = {};

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username required' },
        { status: 400 }
      );
    }

    // Initialize user if not exists
    if (!stamps[username]) {
      stamps[username] = { isStampedIn: false, stampId: null, history: [] };
    }

    return NextResponse.json({
      isStampedIn: stamps[username].isStampedIn,
      stampId: stamps[username].stampId,
      history: stamps[username].history.slice(0, 10) // Last 10 entries
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
