import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, Eye, EyeOff, UserPlus, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import VistoriaHeader from '@/components/vistoria/VistoriaHeader';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ADMIN_EMAIL = "kauankg@hotmail.com";

const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
const setUsers = (users) => localStorage.setItem('users', JSON.stringify(users));

const LoginPage = ({ onLoginSuccess, onAdminLogin }) => {
  const { toast } = useToast();
  const { signIn, signUp, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    setIsRegistering(false); // Sempre começa no login
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (email !== ADMIN_EMAIL) {
      toast({ title: "Cadastro restrito", description: "Apenas o admin pode ser cadastrado por aqui.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Senha Fraca", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);
    if (!error) {
      toast({ title: "Admin cadastrado!", description: "Faça login para continuar.", className: "bg-green-500 text-white" });
      setIsRegistering(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast({ title: "Erro no login", description: error.message, variant: "destructive" });
      console.error("Erro no login:", error);
      return;
    }
    // Buscar dados do usuário na tabela users para saber se é admin ou cliente
    const { data, error: userError } = await import('@/lib/customSupabaseClient').then(m => m.supabase)
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (userError || !data) {
      toast({ title: "Erro ao buscar usuário", description: userError?.message || "Usuário não encontrado.", variant: "destructive" });
      console.error("Erro ao buscar usuário:", userError);
      return;
    }
    if (data.type === 'admin') {
      onAdminLogin && onAdminLogin(data);
    } else {
      onLoginSuccess && onLoginSuccess(data);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    const { supabase } = await import('@/lib/customSupabaseClient');
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
    setForgotLoading(false);
    if (error) {
      toast({ title: 'Erro ao enviar e-mail', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'E-mail enviado!', description: 'Verifique sua caixa de entrada para redefinir a senha.' });
      setShowForgot(false);
      setForgotEmail('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-start min-h-screen p-4 pt-8 md:pt-16"
    >
      {/* Banner do sistema */}
      <div className="w-full max-w-md mx-auto mb-6 mt-4">
        <div className="rounded-xl shadow-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6 flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">Sistema de Checklist</h1>
          <p className="text-sm sm:text-base font-medium opacity-90 text-center">
            Gerencie suas vistorias e manutenções de forma simples e profissional.
          </p>
        </div>
      </div>
      {/* <VistoriaHeader /> */}
      <Card className="w-full max-w-md shadow-2xl mt-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-700 flex items-center justify-center">
            {isRegistering ? <UserPlus className="h-8 w-8 mr-3 text-purple-600" /> : <LogIn className="h-8 w-8 mr-3 text-purple-600" />}
            {isRegistering ? "Cadastrar Admin" : "Entrar na sua conta"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="mt-1"
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegistering ? "Crie uma senha (mín. 6 caracteres)" : "Digite sua senha"}
                required
                className="mt-1 pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-7 h-8 w-8 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </Button>
            </div>
            <CardFooter className="pt-6 flex flex-col items-center gap-4">
              <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-3 text-lg" disabled={isLoading}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    {isRegistering ? <Save className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
                  </motion.div>
                ) : (
                  isRegistering ? <Save className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />
                )}
                {isRegistering ? "Cadastrar" : "Entrar"}
              </Button>
              {!isRegistering && (
                <Button type="button" variant="link" onClick={() => setShowForgot(true)} disabled={isLoading}>
                  Esqueci minha senha
                </Button>
              )}
            </CardFooter>
          </form>
          {showForgot && (
            <div className="mt-6 p-4 border rounded bg-gray-50">
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <Label htmlFor="forgotEmail">E-mail para redefinir senha</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  required
                  disabled={forgotLoading}
                />
                <div className="flex gap-2 mt-2">
                  <Button type="submit" disabled={forgotLoading}>
                    {forgotLoading ? 'Enviando...' : 'Enviar link de redefinição'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForgot(false)} disabled={forgotLoading}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-gray-500 mt-6">
        {isRegistering ? "Cadastro restrito ao admin." : "Acesso para clientes e administração."}
      </p>
    </motion.div>
  );
};

export default LoginPage;