import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config({ path: '../../.env' });

interface AdminData {
  email: string;
  password: string;
  username: string;
  address: string;
  role: 'admin' | 'standard';
}

async function createAdmin() {
  const adminData: AdminData = {
    email: 'yeshu@admin.com',
    password: 'admin123',
    username: 'yeshuAdmin',
    address: 'System Address',
    role: 'admin',
  };

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });



  try {

    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');
    connection.release();

    const [rows] = await pool.query(
      'SELECT id FROM User WHERE email = ? LIMIT 1',
      [adminData.email]
    );

    if ((rows as any[]).length > 0) {
      console.error('Admin with this email already exists!');
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    const now = new Date();

    const [result] = await pool.execute(
      `INSERT INTO User 
   (email, password, username, isActive, tokenVersion, address, role, createdAt, updatedAt) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminData.email,
        hashedPassword,
        adminData.username,
        true,
        0,
        adminData.address,
        adminData.role,
        now,
        now,
      ]
    );


    console.log('Admin user created successfully!');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);

    // `result` type depends on mysql2, use this to get inserted id:
    const insertId = (result as any).insertId;
    console.log(`Admin ID: ${insertId}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

createAdmin();
