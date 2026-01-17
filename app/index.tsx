import { Redirect } from 'expo-router';
import { runMigrations } from '../src/db';
import { saveDefaultExchangeRates } from '../src/services/ExchangeRateService';

export default function App() {
  (async () => {
     await runMigrations();
     await saveDefaultExchangeRates();
    })();
  return <Redirect href="/HomeScreen" />;
}
