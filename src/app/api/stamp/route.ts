import { NextRequest, NextResponse } from 'next/server';

// Simulate stamp storage (in production, use Supabase)
let stamps: { [username: string]: { isStampedIn: boolean; stampId: string | null; history: any[] } } = {};

export async function POST(request: NextRequest) {
  try {
    const { username, type } = await request.json();
    
    if (!username || !type) {
      return NextResponse.json(
        { error: 'Username and type required' },
        { status: 400 }
      );
    }

    // Initialize user if not exists
    if (!stamps[username]) {
      stamps[username] = { isStampedIn: false, stampId: null, history: [] };
    }

    const stampId = `stamp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Update stamp status
    if (type === 'in') {
      stamps[username].isStampedIn = true;
      stamps[username].stampId = stampId;
    } else if (type === 'out') {
      stamps[username].isStampedIn = false;
      stamps[username].stampId = null;
    }

    // Add to history
    stamps[username].history.unshift({
      id: stampId,
      type,
      timestamp,
      date: timestamp.split('T')[0]
    });

    return NextResponse.json({ 
      success: true, 
      stampId,
      isStampedIn: stamps[username].isStampedIn
    });

  } catch (error) {
    console.error('Stamp error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
