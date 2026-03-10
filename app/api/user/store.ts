// Shared user store for authentication and profile management
// This is an in-memory store - in production, use a database

export interface User {
  id: string;
  email: string;
  password: string; // In production, hash this!
  name: string;
  studentType: string;
  major: string;
}

// In-memory user store
export const users: Map<string, User> = new Map();

// Helper to create a new user
export function createUser(email: string, password: string, name: string, studentType: string, major: string): User {
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    password, // In production, hash this!
    name,
    studentType,
    major
  };
  users.set(email, user);
  return user;
}

// Helper to find user by email
export function findUserByEmail(email: string): User | undefined {
  return users.get(email);
}

// Helper to find user by ID
export function findUserById(id: string): User | undefined {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return undefined;
}
