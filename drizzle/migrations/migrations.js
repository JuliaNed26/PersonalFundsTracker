// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_living_whistler.sql';
import m0001 from './0001_quick_sebastian_shaw.sql';
import m0002 from './0002_fresh_sunspot.sql';
import m0003 from './0003_added_exchange_rates_table.sql';
import m0004 from './0004_expenses_table_update.sql';
import m0005 from './0005_add_note_to_income_transactions.sql';
import m0006 from './0006_relations_between_income_transactions.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005,
m0006
    }
  }
  