import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex items-center justify-center bg-amber-50">
          <div className="bg-white p-8 rounded-xl shadow border border-amber-200 text-center">
            <h1 className="text-2xl font-bold text-amber-900">Biscochito Feliz</h1>
            <p className="text-sm text-stone-600 mt-1">Frontend React + Vite + Tailwind activo en Docker</p>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
