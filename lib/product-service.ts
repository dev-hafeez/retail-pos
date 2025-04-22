import db from "./db"

export interface Product {
  id: number
  barcode: string
  name: string
  price: number
  stock: number
  category: string
}

export const productService = {
  getAllProducts: (): Product[] => {
    return db.prepare("SELECT * FROM products ORDER BY name").all()
  },

  getProductById: (id: number): Product | undefined => {
    return db.prepare("SELECT * FROM products WHERE id = ?").get(id)
  },

  getProductByBarcode: (barcode: string): Product | undefined => {
    return db.prepare("SELECT * FROM products WHERE barcode = ?").get(barcode)
  },

  createProduct: (product: Omit<Product, "id">): Product => {
    const result = db
      .prepare(`
      INSERT INTO products (barcode, name, price, stock, category)
      VALUES (?, ?, ?, ?, ?)
    `)
      .run(product.barcode, product.name, product.price, product.stock, product.category)

    return {
      id: result.lastInsertRowid as number,
      ...product,
    }
  },

  updateProduct: (id: number, product: Partial<Omit<Product, "id">>): boolean => {
    const fields = Object.keys(product)
      .filter((key) => key !== "id")
      .map((key) => `${key} = ?`)
      .join(", ")

    if (!fields) return false

    const values = Object.values(product)

    const result = db
      .prepare(`
      UPDATE products
      SET ${fields}
      WHERE id = ?
    `)
      .run(...values, id)

    return result.changes > 0
  },

  deleteProduct: (id: number): boolean => {
    const result = db.prepare("DELETE FROM products WHERE id = ?").run(id)
    return result.changes > 0
  },

  updateStock: (id: number, quantity: number): boolean => {
    const result = db
      .prepare(`
      UPDATE products
      SET stock = stock + ?
      WHERE id = ?
    `)
      .run(quantity, id)

    return result.changes > 0
  },

  getLowStockProducts: (threshold = 10): Product[] => {
    return db
      .prepare(`
      SELECT * FROM products
      WHERE stock < ?
      ORDER BY stock ASC
    `)
      .all(threshold)
  },

  getProductsByCategory: (category: string): Product[] => {
    return db
      .prepare(`
      SELECT * FROM products
      WHERE category = ?
      ORDER BY name
    `)
      .all(category)
  },

  searchProducts: (query: string): Product[] => {
    const searchTerm = `%${query}%`
    return db
      .prepare(`
      SELECT * FROM products
      WHERE name LIKE ? OR barcode LIKE ?
      ORDER BY name
    `)
      .all(searchTerm, searchTerm)
  },
}
