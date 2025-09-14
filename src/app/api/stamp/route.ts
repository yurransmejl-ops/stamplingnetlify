import { NextRequest, NextResponse } from 'next/server';
import { createStamp, getStampStatus } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { username, type } = await request.json();
    
    if (!username || !type) {
      return NextResponse.json(
        { error: 'Username and type required' },
        { status: 400 }
      );
    }

    console.log(`📝 Creating stamp: ${username} - ${type}`);
    
    // Create stamp in database
    const stamp = await createStamp(username, type);
    
    // Get updated status
    const status = await getStampStatus(username);
    
    console.log(`✅ Stamp created successfully:`, stamp);

    return NextResponse.json({ 
      success: true, 
      stampId: stamp.id,
      isStampedIn: status.isStampedIn
    });

  } catch (error) {
    console.error('Stamp error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
