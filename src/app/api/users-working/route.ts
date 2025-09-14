import { NextResponse } from 'next/server';

// TEMPORARY SOLUTION - Return hardcoded users until Supabase works
export async function GET() {
  // Return the exact users that should be in Supabase
  const users = [
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

  return NextResponse.json(users, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
}

// POST - Add new user (for now just return success)
export async function POST(request: Request) {
  const userData = await request.json();
  
  const newUser = {
    ...userData,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  
  return NextResponse.json(newUser);
}

// PUT - Update user
export async function PUT(request: Request) {
  const userData = await request.json();
  
  return NextResponse.json(userData);
}

// DELETE - Delete user
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  return NextResponse.json({ success: true });
}