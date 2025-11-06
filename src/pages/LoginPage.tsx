import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2, Mail, Lock, User, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Sign up state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  
  // Reset password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Email ou senha incorretos' 
        : 'Erro ao fazer login. Tente novamente.');
      setIsLoading(false);
    } else {
      navigate('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await signUp(signUpEmail, signUpPassword, signUpFullName);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSignUpSuccess(true);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await resetPassword(resetEmail);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setResetSuccess(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#164194]/10 to-[#52AE32]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#52AE32]/10 to-[#E84910]/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-2 border-slate-200/60 dark:border-slate-700/60">
        <CardHeader className="space-y-4 text-center pb-6">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img 
              src="/images/sesi-senai-logo.png" 
              alt="SESI SENAI" 
              className="h-12 w-auto object-contain"
            />
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold gradient-sesi-text">
              Status Report FIEA
            </CardTitle>
            <CardDescription className="text-sm mt-2">
              Manutenção da Certificação ONA 2026
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
              <TabsTrigger value="reset">Recuperar</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu-email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-sesi text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              {signUpSuccess ? (
                <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={signUpFullName}
                        onChange={(e) => setSignUpFullName(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu-email@exemplo.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-sesi text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                    Novos usuários são criados como "Usuário Padrão"
                  </p>
                </form>
              )}
            </TabsContent>

            {/* Reset Password Tab */}
            <TabsContent value="reset">
              {resetSuccess ? (
                <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    Email de recuperação enviado! Verifique sua caixa de entrada.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="seu-email@exemplo.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-sesi text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Email de Recuperação'
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                    Você receberá um link para redefinir sua senha
                  </p>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
