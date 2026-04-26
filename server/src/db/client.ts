// PostgreSQL removed — project uses MongoDB (Mongoose) exclusively.
// Stubs exported for files that haven't been migrated yet.
import mongoose from "mongoose";

export const pool = {
  query: async () => ({ rows: [] }),
  connect: async () => ({ query: async (_sql?: string) => ({ rows: [] }), release: () => {} }),
  end: async () => {},
};

export async function query<T = unknown>(_text: string, _params?: unknown[]): Promise<T[]> {
  return [];
}

export async function queryOne<T = unknown>(_text: string, _params?: unknown[]): Promise<T | null> {
  return null;
}

export async function withTransaction<T>(fn: (client: unknown) => Promise<T>): Promise<T> {
  return fn({});
}

export { mongoose };
