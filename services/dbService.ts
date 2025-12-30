
import { neon } from '@neondatabase/serverless';
import { Assignment } from '../types';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export const dbService = {
  async getAssignments(): Promise<Assignment[]> {
    if (!sql) return [];
    try {
      const result = await sql`SELECT data FROM assignments ORDER BY last_updated DESC`;
      return result.map(row => row.data as Assignment);
    } catch (error) {
      console.warn("Neon DB sync unavailable. Table 'assignments' may be missing or DATABASE_URL not set.", error);
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
      return true;
    } catch (error) {
      console.error("Sync error:", error);
      return false;
    }
  },

  async deleteAssignment(taskId: string): Promise<boolean> {
    if (!sql) return false;
    try {
      await sql`DELETE FROM assignments WHERE task_id = ${taskId}`;
      return true;
    } catch (error) {
      console.error("Delete sync error:", error);
      return false;
    }
  }
};
