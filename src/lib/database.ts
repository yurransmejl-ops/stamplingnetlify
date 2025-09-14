import { Pool } from 'pg';

// Create a connection pool to Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database schema
export async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Create users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create stamps table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS stamps (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        type VARCHAR(10) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (username) REFERENCES users(username)
      )
    `);

    // Insert default admin user if not exists
    await client.query(`
      INSERT INTO users (username, password, name, role) 
      VALUES ('admin', 'admin123', 'Administratör', 'admin')
      ON CONFLICT (username) DO NOTHING
    `);

    // Insert default employee if not exists
    await client.query(`
      INSERT INTO users (username, password, name, role) 
      VALUES ('yar', 'password123', 'Yar Nuri', 'employee')
      ON CONFLICT (username) DO NOTHING
    `);

    client.release();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Database query functions
export async function getUsers() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
}

export async function createUser(userData: any) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [userData.username, userData.password, userData.name, userData.role || 'employee']
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateUser(id: string, userData: any) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE users SET username = $1, password = $2, name = $3, role = $4 WHERE id = $5 RETURNING *',
      [userData.username, userData.password, userData.name, userData.role, id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteUser(id: string) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    return { success: true };
  } finally {
    client.release();
  }
}

export async function getUserByCredentials(username: string, password: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Stamp functions
export async function createStamp(username: string, type: 'in' | 'out') {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO stamps (username, type) VALUES ($1, $2) RETURNING *',
      [username, type]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getStampStatus(username: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM stamps WHERE username = $1 ORDER BY timestamp DESC LIMIT 1',
      [username]
    );
    const lastStamp = result.rows[0];
    return {
      isStampedIn: lastStamp ? lastStamp.type === 'in' : false,
      stampId: lastStamp ? lastStamp.id : null,
      lastStamp
    };
  } finally {
    client.release();
  }
}

export default pool;
