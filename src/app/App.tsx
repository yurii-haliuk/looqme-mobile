import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { ScenarioProvider } from './context/ScenarioContext';

export default function App() {
  return (
    <AuthProvider>
      <ScenarioProvider>
        <RouterProvider router={router} />
      </ScenarioProvider>
    </AuthProvider>
  );
}