import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AdminPanel from './pages/Admin';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/login/Login';

// Componente temporário para o Agente Sombra até criarmos a página específica
const SombraPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Agente Sombra</h1>
    <p>Varredura de extrato em busca de gastos ocultos...</p>
  </div>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-indigo-600 font-bold animate-pulse">
          Carregando Guardião Digital...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública: Se já estiver logado, manda para o Dashboard */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/" />} 
        />

        {/* Rota Protegida: Dashboard Principal */}
        <Route 
          path="/" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        
        {/* Rota de Admin: Apenas usuários com role 'admin' */}
        <Route 
          path="/admin" 
          element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} 
        />

        {/* Rota do Agente Sombra: Proteção por nível de plano */}
        <Route 
          path="/sombra" 
          element={
            user && ['premium', 'plus', 'ultimate'].includes(user.plan) 
              ? <SombraPage /> 
              : <Navigate to="/" />
          } 
        />

        {/* Redireciona qualquer rota desconhecida para o Dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;