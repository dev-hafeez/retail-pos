import db from "./db"

export interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
}

export const customerService = {
  getAllCustomers: (): Customer[] => {
    return db.prepare("SELECT * FROM customers ORDER BY name").all()
  },

  getCustomerById: (id: number): Customer | undefined => {
    return db.prepare("SELECT * FROM customers WHERE id = ?").get(id)
  },

  createCustomer: (customer: Omit<Customer, "id">): Customer => {
    const result = db
      .prepare(`
      INSERT INTO customers (name, email, phone)
      VALUES (?, ?, ?)
    `)
      .run(customer.name, customer.email, customer.phone)

    return {
      id: result.lastInsertRowid as number,
      ...customer,
    }
  },

  updateCustomer: (id: number, customer: Partial<Omit<Customer, "id">>): boolean => {
    const fields = Object.keys(customer)
      .filter((key) => key !== "id")
      .map((key) => `${key} = ?`)
      .join(", ")

    if (!fields) return false

    const values = Object.values(customer)

    const result = db
      .prepare(`
      UPDATE customers
      SET ${fields}
      WHERE id = ?
    `)
      .run(...values, id)

    return result.changes > 0
  },

  deleteCustomer: (id: number): boolean => {
    const result = db.prepare("DELETE FROM customers WHERE id = ?").run(id)
    return result.changes > 0
  },

  searchCustomers: (query: string): Customer[] => {
    const searchTerm = `%${query}%`
    return db
      .prepare(`
      SELECT * FROM customers
      WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
      ORDER BY name
    `)
      .all(searchTerm, searchTerm, searchTerm)
  },
}
