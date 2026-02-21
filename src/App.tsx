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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-indigo-600 font-black animate-pulse tracking-tighter">
            CARREGANDO GUARDIÃO DIGITAL...
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública: Se já estiver logado, manda para o Dashboard automaticamente */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/" replace />} 
        />

        {/* Rota Protegida: Dashboard Principal */}
        <Route 
          path="/" 
          element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
        />
        
        {/* Rota de Admin: Apenas usuários com role 'admin' */}
        <Route 
          path="/admin" 
          element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} 
        />

        {/* Rota do Agente Sombra: Proteção por nível de plano */}
        <Route 
          path="/sombra" 
          element={
            user && ['premium', 'plus', 'ultimate'].includes(user.plan) 
              ? <SombraPage /> 
              : <Navigate to="/" replace />
          } 
        />

        {/* AJUSTE AQUI: Redireciona rota desconhecida de forma inteligente */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;