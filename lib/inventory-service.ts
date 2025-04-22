import db from "./db"
import { productService } from "./product-service"

export interface InventoryTransaction {
  id?: number
  date: string
  type: "stock-in" | "stock-out"
  product_id: number
  product_name?: string
  quantity: number
  notes: string | null
}

export const inventoryService = {
  getAllTransactions: (): InventoryTransaction[] => {
    return db
      .prepare(`
      SELECT t.*, p.name as product_name
      FROM inventory_transactions t
      JOIN products p ON t.product_id = p.id
      ORDER BY t.date DESC
    `)
      .all()
  },

  getTransactionById: (id: number): InventoryTransaction | undefined => {
    return db
      .prepare(`
      SELECT t.*, p.name as product_name
      FROM inventory_transactions t
      JOIN products p ON t.product_id = p.id
      WHERE t.id = ?
    `)
      .get(id)
  },

  createTransaction: (transaction: Omit<InventoryTransaction, "id">): InventoryTransaction => {
    // Start transaction
    db.prepare("BEGIN TRANSACTION").run()

    try {
      // Insert inventory transaction
      const result = db
        .prepare(`
        INSERT INTO inventory_transactions (date, type, product_id, quantity, notes)
        VALUES (?, ?, ?, ?, ?)
      `)
        .run(
          transaction.date || new Date().toISOString(),
          transaction.type,
          transaction.product_id,
          transaction.quantity,
          transaction.notes,
        )

      // Update product stock
      const stockChange = transaction.type === "stock-in" ? transaction.quantity : -transaction.quantity
      productService.updateStock(transaction.product_id, stockChange)

      // Commit transaction
      db.prepare("COMMIT").run()

      return {
        id: result.lastInsertRowid as number,
        ...transaction,
      }
    } catch (error) {
      // Rollback transaction on error
      db.prepare("ROLLBACK").run()
      throw error
    }
  },

  getTransactionsByProduct: (productId: number): InventoryTransaction[] => {
    return db
      .prepare(`
      SELECT t.*, p.name as product_name
      FROM inventory_transactions t
      JOIN products p ON t.product_id = p.id
      WHERE t.product_id = ?
      ORDER BY t.date DESC
    `)
      .all(productId)
  },

  getTransactionsByDateRange: (startDate: string, endDate: string): InventoryTransaction[] => {
    return db
      .prepare(`
      SELECT t.*, p.name as product_name
      FROM inventory_transactions t
      JOIN products p ON t.product_id = p.id
      WHERE t.date BETWEEN ? AND ?
      ORDER BY t.date DESC
    `)
      .all(startDate, endDate)
  },

  getTransactionsByType: (type: "stock-in" | "stock-out"): InventoryTransaction[] => {
    return db
      .prepare(`
      SELECT t.*, p.name as product_name
      FROM inventory_transactions t
      JOIN products p ON t.product_id = p.id
      WHERE t.type = ?
      ORDER BY t.date DESC
    `)
      .all(type)
  },
}
