import db from "./db"
import bcrypt from "bcryptjs"

export interface User {
  id: number
  name: string
  email: string
  role: string
  last_login: string | null
  status: string
}

export const userService = {
  getAllUsers: (): User[] => {
    return db
      .prepare(`
      SELECT id, name, email, role, last_login, status
      FROM users
      ORDER BY name
    `)
      .all()
  },

  getUserById: (id: number): User | undefined => {
    return db
      .prepare(`
      SELECT id, name, email, role, last_login, status
      FROM users
      WHERE id = ?
    `)
      .get(id)
  },

  getUserByEmail: (email: string): User | undefined => {
    return db
      .prepare(`
      SELECT id, name, email, role, last_login, status
      FROM users
      WHERE email = ?
    `)
      .get(email)
  },

  createUser: (user: { name: string; email: string; password: string; role: string }): User => {
    const passwordHash = bcrypt.hashSync(user.password, 10)

    const result = db
      .prepare(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, 'active')
    `)
      .run(user.name, user.email, passwordHash, user.role)

    return {
      id: result.lastInsertRowid as number,
      name: user.name,
      email: user.email,
      role: user.role,
      last_login: null,
      status: "active",
    }
  },

  updateUser: (id: number, user: Partial<Omit<User, "id">>): boolean => {
    const fields = Object.keys(user)
      .filter((key) => key !== "id" && key !== "password_hash")
      .map((key) => `${key} = ?`)
      .join(", ")

    if (!fields) return false

    const values = Object.values(user)

    const result = db
      .prepare(`
      UPDATE users
      SET ${fields}
      WHERE id = ?
    `)
      .run(...values, id)

    return result.changes > 0
  },

  updatePassword: (id: number, password: string): boolean => {
    const passwordHash = bcrypt.hashSync(password, 10)

    const result = db
      .prepare(`
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
    `)
      .run(passwordHash, id)

    return result.changes > 0
  },

  deleteUser: (id: number): boolean => {
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(id)
    return result.changes > 0
  },

  verifyCredentials: (email: string, password: string): User | null => {
    const user = db
      .prepare(`
      SELECT id, name, email, password_hash, role, last_login, status
      FROM users
      WHERE email = ?
    `)
      .get(email)

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return null
    }

    // Update last login time
    db.prepare(`
      UPDATE users
      SET last_login = datetime('now')
      WHERE id = ?
    `).run(user.id)

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword as User
  },
}
