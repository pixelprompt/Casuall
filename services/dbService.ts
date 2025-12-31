
import { neon } from '@neondatabase/serverless';
import { Assignment } from '../types';

// The DATABASE_URL is injected by Vercel's Neon integration
const dbUrl = process.env.DATABASE_URL;
const sql = dbUrl ? neon(dbUrl) : null;

export const dbService = {
  isConfigured(): boolean {
    return !!sql;
  },

  async initTable(): Promise<boolean> {
    if (!sql) {
      console.warn("Neon DB: DATABASE_URL is missing. Please check Vercel Environment Variables.");
      return false;
    }
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS assignments (
          task_id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          last_updated TEXT NOT NULL
        )
      `;
      console.log("Neon DB: Uplink established. Assignments table verified.");
      return true;
    } catch (error) {
      console.error("Neon DB: Initialization failed. Check permissions or table constraints.", error);
      return false;
    }
  },

  async getAssignments(): Promise<Assignment[]> {
    if (!sql) return [];
    try {
      const result = await sql`SELECT data FROM assignments ORDER BY last_updated DESC`;
      return result.map(row => row.data as Assignment);
    } catch (error) {
      console.error("Neon DB: Failed to fetch records.", error);
      return [];
    }
  },

  async saveAssignment(assignment: Assignment): Promise<boolean> {
    if (!sql) return false;
    try {
      await sql`
        INSERT INTO assignments (task_id, data, last_updated)
        VALUES (${assignment.taskId}, ${JSON.stringify(assignment)}, ${assignment.lastUpdated})
        ON CONFLICT (task_id) 
        DO UPDATE SET data = EXCLUDED.data, last_updated = EXCLUDED.last_updated
      `;
      console.log(`Neon DB: Record ${assignment.taskId} synchronized.`);
      return true;
    } catch (error) {
      console.error("Neon DB: Save operation failed.", error);
      return false;
    }
  },

  async deleteAssignment(taskId: string): Promise<boolean> {
    if (!sql) return false;
    try {
      await sql`DELETE FROM assignments WHERE task_id = ${taskId}`;
      console.log(`Neon DB: Record ${taskId} purged from cloud.`);
      return true;
    } catch (error) {
      console.error("Neon DB: Delete operation failed.", error);
      return false;
    }
  }
};
