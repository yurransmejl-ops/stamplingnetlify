import { NextResponse } from 'next/server';
import { getUsers, initDatabase } from '@/lib/database';

export async function GET() {
  try {
    // Initialize database on first request
    await initDatabase();
    
    const users = await getUsers();
    console.log('📋 GET /api/users-working - returning users from Neon:', users);
    
    return NextResponse.json(users, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Add new user
export async function POST(request: Request) {
  try {
    const userData = await request.json();
    console.log('➕ POST /api/users-working - adding user:', userData);
    
    const { createUser } = await import('@/lib/database');
    const newUser = await createUser(userData);
    console.log('✅ User added successfully to Neon:', newUser);
    
    return NextResponse.json(newUser);
  } catch (error: any) {
    console.error('Error adding user:', error);
    
    // Handle unique constraint violation (duplicate username)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Användarnamnet finns redan' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ett fel uppstod vid skapande av användare' }, 
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: Request) {
  try {
    const userData = await request.json();
    console.log('✏️ PUT /api/users-working - updating user:', userData);
    
    const { updateUser } = await import('@/lib/database');
    const updatedUser = await updateUser(userData.id, userData);
    console.log('✅ User updated successfully in Neon:', updatedUser);
    
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Användarnamnet finns redan' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ett fel uppstod vid uppdatering av användare' }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('🗑️ DELETE /api/users-working - deleting user ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Användar-ID krävs' }, 
        { status: 400 }
      );
    }
    
    const { deleteUser } = await import('@/lib/database');
    await deleteUser(id);
    console.log('✅ User deleted successfully from Neon');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid borttagning av användare' }, 
      { status: 500 }
    );
  }
}