import Database from "better-sqlite3"
import fs from "fs"
import path from "path"

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, "retail-pos.db")
const db = new Database(dbPath)

// Enable foreign keys
db.pragma("foreign_keys = ON")

// Initialize database with tables if they don't exist
function initializeDatabase() {
  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL
    )
  `)

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      last_login TEXT,
      status TEXT NOT NULL DEFAULT 'active'
    )
  `)

  // Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT
    )
  `)

  // Invoices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      customer_id INTEGER,
      subtotal REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'paid',
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `)

  // Invoice items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `)

  // Inventory transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      notes TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `)

  // Check if we need to seed the database with initial data
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get()

  if (userCount.count === 0) {
    // Add default admin user
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run("Admin User", "admin@example.com", "$2a$10$JdJQQmNSA1QD.qCH0XpJiOvx0A.xPBSHMBmq4JRmCOOCKVzHJVS3S", "admin")

    // Add sample products
    const sampleProducts = [
      { barcode: "8901234567890", name: "T-Shirt", price: 19.99, stock: 50, category: "Clothing" },
      { barcode: "7890123456789", name: "Jeans", price: 39.99, stock: 30, category: "Clothing" },
      { barcode: "6789012345678", name: "Sneakers", price: 59.99, stock: 20, category: "Footwear" },
      { barcode: "5678901234567", name: "Backpack", price: 29.99, stock: 15, category: "Accessories" },
      { barcode: "4567890123456", name: "Water Bottle", price: 9.99, stock: 100, category: "Accessories" },
      { barcode: "3456789012345", name: "Sunglasses", price: 24.99, stock: 25, category: "Accessories" },
      { barcode: "2345678901234", name: "Hat", price: 14.99, stock: 40, category: "Clothing" },
      { barcode: "1234567890123", name: "Socks", price: 7.99, stock: 80, category: "Clothing" },
    ]

    const insertProduct = db.prepare(`
      INSERT INTO products (barcode, name, price, stock, category)
      VALUES (?, ?, ?, ?, ?)
    `)

    for (const product of sampleProducts) {
      insertProduct.run(product.barcode, product.name, product.price, product.stock, product.category)
    }

    // Add sample customers
    const sampleCustomers = [
      { name: "John Doe", email: "john@example.com", phone: "123-456-7890" },
      { name: "Jane Smith", email: "jane@example.com", phone: "234-567-8901" },
      { name: "Bob Johnson", email: "bob@example.com", phone: "345-678-9012" },
    ]

    const insertCustomer = db.prepare(`
      INSERT INTO customers (name, email, phone)
      VALUES (?, ?, ?)
    `)

    for (const customer of sampleCustomers) {
      insertCustomer.run(customer.name, customer.email, customer.phone)
    }
  }
}

// Initialize the database
initializeDatabase()

export default db
