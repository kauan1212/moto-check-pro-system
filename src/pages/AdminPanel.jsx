import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const emptyClient = { email: '', password: '', nomeEmpresa: '', logoUrl: '', endereco: '', telefone: '', status: 'active', type: 'cliente' };

const AdminPanel = ({ onLogout }) => {
  const { toast } = useToast();
  const [users, setUsersState] = useState([]);
  const [newClient, setNewClient] = useState(emptyClient);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').eq('type', 'cliente');
    if (error) {
      toast({ title: 'Erro ao buscar clientes', description: error.message, variant: 'destructive' });
    } else {
      setUsersState(data);
    }
  };

  const handleInputChange = (e) => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!newClient.email || !newClient.password || !newClient.nomeEmpresa) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha e-mail, senha e nome da empresa.', variant: 'destructive' });
      return;
    }
    if (editingId) {
      // Editar
      const { error } = await supabase.from('users').update({ ...newClient }).eq('id', editingId);
      if (error) {
        toast({ title: 'Erro ao atualizar cliente', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Cliente atualizado!' });
        setEditingId(null);
        setNewClient(emptyClient);
        fetchUsers();
      }
    } else {
      // Criar
      const { data, error } = await supabase.from('users').insert([{ ...newClient }]);
      if (error) {
        toast({ title: 'Erro ao criar cliente', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Cliente criado!' });
        setNewClient(emptyClient);
        fetchUsers();
      }
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
    const client = users.find(u => u.id === id);
    setNewClient({ ...client, password: '' }); // Não mostrar senha
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta conta?')) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao deletar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Conta deletada!' });
      fetchUsers();
    }
  };

  const handleFreeze = async (id) => {
    const user = users.find(u => u.id === id);
    const novoStatus = user.status === 'frozen' ? 'active' : 'frozen';
    const { error } = await supabase.from('users').update({ status: novoStatus }).eq('id', id);
    if (error) {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: novoStatus === 'frozen' ? 'Conta congelada!' : 'Conta ativada!' });
      fetchUsers();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewClient(emptyClient);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewClient({ ...newClient, logoUrl: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleCopyLink = (id) => {
    const url = `${window.location.origin}/#/agendar-publico?empresa=${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado!', description: url });
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Painel do Administrador</CardTitle>
          <Button onClick={onLogout} className="float-right">Sair</Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <Label>E-mail</Label>
            <Input name="email" value={newClient.email} onChange={handleInputChange} required />
            <Label>Senha</Label>
            <Input name="password" type="password" value={newClient.password} onChange={handleInputChange} required />
            <Label>Nome da Empresa</Label>
            <Input name="nomeEmpresa" value={newClient.nomeEmpresa} onChange={handleInputChange} required />
            <Label>Endereço</Label>
            <Input name="endereco" value={newClient.endereco} onChange={handleInputChange} />
            <Label>Telefone</Label>
            <Input name="telefone" value={newClient.telefone} onChange={handleInputChange} />
            <Label>Logo</Label>
            <Input name="logo" type="file" accept="image/*" onChange={handleLogoUpload} />
            {newClient.logoUrl && (
              <img src={newClient.logoUrl} alt="Logo preview" className="h-16 mt-2 rounded shadow border" />
            )}
            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Salvar Alterações' : 'Criar Cliente'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancelar</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Empresa</th>
                <th>Endereço</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td>{u.email}</td>
                  <td>{u.nomeEmpresa}</td>
                  <td>{u.endereco}</td>
                  <td>{u.telefone}</td>
                  <td>{u.status === 'frozen' ? 'Congelada' : 'Ativa'}</td>
                  <td className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(u.id)}>Editar</Button>
                    <Button size="sm" variant="outline" onClick={() => handleFreeze(u.id)}>{u.status === 'frozen' ? 'Ativar' : 'Congelar'}</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>Deletar</Button>
                    <Button size="sm" variant="outline" onClick={() => handleCopyLink(u.id)} title="Copiar link público">
                      <Copy size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel; 