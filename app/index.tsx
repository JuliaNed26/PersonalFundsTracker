import { Redirect } from 'expo-router';
import { runMigrations } from '../src/db';

export default function App() {
  (async () => await runMigrations())();
  return <Redirect href="/HomeScreen" />;
}
