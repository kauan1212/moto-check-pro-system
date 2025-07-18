import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, Eye, EyeOff, UserPlus, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import VistoriaHeader from '@/components/vistoria/VistoriaHeader';

const ADMIN_EMAIL = "kauankg@hotmail.com";

const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
const setUsers = (users) => localStorage.setItem('users', JSON.stringify(users));

const LoginPage = ({ onLoginSuccess, onAdminLogin }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    setIsRegistering(false); // Sempre começa no login
  }, []);

  const handleRegister = (e) => {
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
    setTimeout(() => {
      const users = getUsers();
      if (users.find(u => u.email === email)) {
        toast({ title: "Já existe", description: "Este e-mail já está cadastrado.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      users.push({ id: Date.now(), email, password, type: 'admin', status: 'active', nomeEmpresa: '', logoUrl: '' });
      setUsers(users);
      toast({ title: "Admin cadastrado!", description: "Faça login para continuar.", className: "bg-green-500 text-white" });
      setIsRegistering(false);
      setEmail('');
      setPassword('');
      setIsLoading(false);
    }, 500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        toast({ title: "Falha no Login", description: "E-mail ou senha incorretos.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (user.status === 'frozen') {
        toast({ title: "Conta congelada", description: "Entre em contato com o administrador.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (user.type === 'admin') {
        toast({ title: "Login Admin", description: "Bem-vindo, admin!", className: "bg-green-500 text-white" });
        onAdminLogin && onAdminLogin(user);
      } else {
        toast({ title: "Login Bem-Sucedido!", description: "Bem-vindo!", className: "bg-green-500 text-white" });
        onLoginSuccess && onLoginSuccess(user);
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-start min-h-screen p-4 pt-8 md:pt-16"
    >
      <VistoriaHeader />
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
                <Button type="button" variant="link" onClick={() => setIsRegistering(true)} disabled={isLoading}>
                  Cadastrar admin
                </Button>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      <p className="text-xs text-gray-500 mt-6">
        {isRegistering ? "Cadastro restrito ao admin." : "Acesso para clientes e administração."}
      </p>
    </motion.div>
  );
};

export default LoginPage;