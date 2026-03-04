import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo Error Boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-center max-w-md w-full border border-slate-100 dark:border-slate-800">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Sistema Comprometido</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              Um erro crítico foi detectado e interceptado para proteger seus dados.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-lg"
            >
              Reiniciar Sistema
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;