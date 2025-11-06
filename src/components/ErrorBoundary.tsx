import { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-bold">
                Erro de Configuração
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>
                  As variáveis de ambiente do Supabase não estão configuradas.
                </p>
                <div className="mt-4 p-3 bg-slate-900 text-slate-100 rounded text-xs font-mono">
                  <p className="font-bold mb-2">Configure no Vercel:</p>
                  <p>VITE_SUPABASE_URL</p>
                  <p>VITE_SUPABASE_ANON_KEY</p>
                </div>
                <p className="text-xs mt-4">
                  Acesse: Vercel Dashboard → Settings → Environment Variables
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
