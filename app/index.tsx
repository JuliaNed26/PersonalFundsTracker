import { runMigrations } from '../src/db';
import HomeScreen from '../src/screens/HomeScreen/HomeScreen';

export default function App() {
  (async () => await runMigrations())();
  return <HomeScreen></HomeScreen>;
}
