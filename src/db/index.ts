import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../../drizzle/migrations/migrations';

const expoDb = SQLite.openDatabaseSync('personal_funds_tracker.db');
export const db = drizzle(expoDb, { schema });

export async function runMigrations() {
  await migrate(db, migrations);
}
