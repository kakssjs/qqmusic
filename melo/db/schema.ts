// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const meloEvents=sqliteTable('melo_events',{
 id:text('id').primaryKey(),
 userId:text('user_id').notNull(),
 type:text('type').notNull(),
 payload:text('payload').notNull(),
 createdAt:text('created_at').notNull(),
});
