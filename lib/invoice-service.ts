import db from "./db"
import { productService } from "./product-service"

export interface InvoiceItem {
  id?: number
  invoice_id: string
  product_id: number
  quantity: number
  price: number
  product_name?: string
}

export interface Invoice {
  id: string
  date: string
  customer_id: number | null
  customer_name?: string
  subtotal: number
  discount_amount: number
  total: number
  payment_method: string
  status: string
  items?: InvoiceItem[]
}

export const invoiceService = {
  getAllInvoices: (): Invoice[] => {
    const invoices = db
      .prepare(`
      SELECT i.*, c.name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.date DESC
    `)
      .all()

    return invoices
  },

  getInvoiceById: (id: string): Invoice | undefined => {
    const invoice = db
      .prepare(`
      SELECT i.*, c.name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `)
      .get(id)

    if (!invoice) return undefined

    // Get invoice items
    const items = db
      .prepare(`
      SELECT ii.*, p.name as product_name
      FROM invoice_items ii
      JOIN products p ON ii.product_id = p.id
      WHERE ii.invoice_id = ?
    `)
      .all(id)

    return {
      ...invoice,
      items,
    }
  },

  createInvoice: (invoice: Omit<Invoice, "id"> & { id?: string }, items: Omit<InvoiceItem, "id" | "invoice_id">[]) => {
    // Generate invoice ID if not provided
    const invoiceId = invoice.id || `INV-${Date.now().toString().slice(-6)}`

    // Start transaction
    db.prepare("BEGIN TRANSACTION").run()

    try {
      // Insert invoice
      db.prepare(`
        INSERT INTO invoices (id, date, customer_id, subtotal, discount_amount, total, payment_method, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        invoiceId,
        invoice.date || new Date().toISOString(),
        invoice.customer_id,
        invoice.subtotal,
        invoice.discount_amount,
        invoice.total,
        invoice.payment_method,
        invoice.status || "paid",
      )

      // Insert invoice items
      const insertItem = db.prepare(`
        INSERT INTO invoice_items (invoice_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `)

      for (const item of items) {
        insertItem.run(invoiceId, item.product_id, item.quantity, item.price)

        // Update product stock
        productService.updateStock(item.product_id, -item.quantity)
      }

      // Commit transaction
      db.prepare("COMMIT").run()

      return invoiceId
    } catch (error) {
      // Rollback transaction on error
      db.prepare("ROLLBACK").run()
      throw error
    }
  },

  updateInvoiceStatus: (id: string, status: string): boolean => {
    const result = db
      .prepare(`
      UPDATE invoices
      SET status = ?
      WHERE id = ?
    `)
      .run(status, id)

    return result.changes > 0
  },

  getInvoicesByDateRange: (startDate: string, endDate: string): Invoice[] => {
    return db
      .prepare(`
      SELECT i.*, c.name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.date BETWEEN ? AND ?
      ORDER BY i.date DESC
    `)
      .all(startDate, endDate)
  },

  getInvoicesByCustomer: (customerId: number): Invoice[] => {
    return db
      .prepare(`
      SELECT i.*, c.name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.customer_id = ?
      ORDER BY i.date DESC
    `)
      .all(customerId)
  },

  getSalesByProduct: (startDate: string, endDate: string) => {
    return db
      .prepare(`
      SELECT 
        p.id,
        p.name,
        p.category,
        SUM(ii.quantity) as quantity,
        SUM(ii.quantity * ii.price) as sales,
        SUM(ii.quantity * ii.price) * 0.4 as profit
      FROM invoice_items ii
      JOIN products p ON ii.product_id = p.id
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.date BETWEEN ? AND ? AND i.status = 'paid'
      GROUP BY p.id
      ORDER BY sales DESC
    `)
      .all(startDate, endDate)
  },

  getSalesByDay: (startDate: string, endDate: string) => {
    return db
      .prepare(`
      SELECT 
        date(i.date) as date,
        SUM(i.total) as sales,
        COUNT(i.id) as transactions,
        SUM(i.total) * 0.4 as profit
      FROM invoices i
      WHERE i.date BETWEEN ? AND ? AND i.status = 'paid'
      GROUP BY date(i.date)
      ORDER BY date(i.date)
    `)
      .all(startDate, endDate)
  },

  getSalesByCashier: (startDate: string, endDate: string) => {
    // This is a placeholder - in a real system, you'd track which user created each invoice
    return db
      .prepare(`
      SELECT 
        1 as id,
        'John Smith' as name,
        COUNT(i.id) as transactions,
        SUM(i.total) as sales,
        SUM(i.total) * 0.4 as profit
      FROM invoices i
      WHERE i.date BETWEEN ? AND ? AND i.status = 'paid'
    `)
      .all(startDate, endDate)
  },
}
