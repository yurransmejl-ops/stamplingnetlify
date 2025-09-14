import { NextResponse } from 'next/server';

// In-memory database - persists during server session
let users = [
  {
    id: "admin",
    username: "admin", 
    password: "admin123",
    name: "Administratör",
    role: "admin",
    created_at: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "yar",
    username: "yar",
    password: "password123", 
    name: "Yar Nuri",
    role: "employee",
    created_at: "2024-01-02T00:00:00.000Z"
  }
];

export async function GET() {
  console.log('📋 GET /api/users-working - returning users:', users);
  return NextResponse.json(users, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
}

// POST - Add new user
export async function POST(request: Request) {
  try {
    const userData = await request.json();
    console.log('➕ POST /api/users-working - adding user:', userData);
    
    // Check if username already exists
    const existingUser = users.find(u => u.username === userData.username);
    if (existingUser) {
      console.log('❌ Username already exists:', userData.username);
      return NextResponse.json(
        { error: 'Användarnamnet finns redan' }, 
        { status: 400 }
      );
    }
    
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    // Add to in-memory database
    users.push(newUser);
    console.log('✅ User added successfully. Total users:', users.length);
    
    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error adding user:', error);
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
    
    const userIndex = users.findIndex(u => u.id === userData.id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Användaren hittades inte' }, 
        { status: 404 }
      );
    }
    
    // Update user in in-memory database
    users[userIndex] = { ...users[userIndex], ...userData };
    console.log('✅ User updated successfully');
    
    return NextResponse.json(users[userIndex]);
  } catch (error) {
    console.error('Error updating user:', error);
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
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Användaren hittades inte' }, 
        { status: 404 }
      );
    }
    
    // Remove user from in-memory database
    const deletedUser = users.splice(userIndex, 1)[0];
    console.log('✅ User deleted successfully:', deletedUser.username);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid borttagning av användare' }, 
      { status: 500 }
    );
  }
}