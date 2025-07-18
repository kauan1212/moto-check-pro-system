import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';

const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
const setUsers = (users) => localStorage.setItem('users', JSON.stringify(users));

const emptyClient = { email: '', password: '', nomeEmpresa: '', logoUrl: '', endereco: '', telefone: '', status: 'active', type: 'cliente' };

const AdminPanel = ({ onLogout }) => {
  const { toast } = useToast();
  const [users, setUsersState] = useState([]);
  const [newClient, setNewClient] = useState(emptyClient);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    setUsersState(getUsers().filter(u => u.type === 'cliente'));
  }, []);

  const refreshUsers = () => {
    setUsersState(getUsers().filter(u => u.type === 'cliente'));
  };

  const handleInputChange = (e) => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    if (!newClient.email || !newClient.password || !newClient.nomeEmpresa) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha e-mail, senha e nome da empresa.', variant: 'destructive' });
      return;
    }
    const allUsers = getUsers();
    if (editingIndex !== null) {
      // Editar
      const idx = allUsers.findIndex(u => u.id === users[editingIndex].id);
      allUsers[idx] = { ...allUsers[idx], ...newClient };
      setUsers(allUsers);
      toast({ title: 'Cliente atualizado!' });
    } else {
      // Criar
      if (allUsers.find(u => u.email === newClient.email)) {
        toast({ title: 'E-mail já cadastrado', variant: 'destructive' });
        return;
      }
      allUsers.push({ ...newClient, id: Date.now() });
      setUsers(allUsers);
      toast({ title: 'Cliente criado!' });
    }
    setNewClient(emptyClient);
    setEditingIndex(null);
    refreshUsers();
  };

  const handleEdit = (idx) => {
    setEditingIndex(idx);
    setNewClient(users[idx]);
  };

  const handleDelete = (idx) => {
    if (!window.confirm('Tem certeza que deseja deletar esta conta?')) return;
    const allUsers = getUsers();
    const id = users[idx].id;
    setUsers(allUsers.filter(u => u.id !== id));
    toast({ title: 'Conta deletada!' });
    refreshUsers();
  };

  const handleFreeze = (idx) => {
    const allUsers = getUsers();
    const id = users[idx].id;
    const user = allUsers.find(u => u.id === id);
    user.status = user.status === 'frozen' ? 'active' : 'frozen';
    setUsers(allUsers);
    toast({ title: user.status === 'frozen' ? 'Conta congelada!' : 'Conta ativada!' });
    refreshUsers();
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
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
              <Button type="submit">{editingIndex !== null ? 'Salvar Alterações' : 'Criar Cliente'}</Button>
              {editingIndex !== null && <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancelar</Button>}
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
              {users.map((u, idx) => (
                <tr key={u.id} className="border-b">
                  <td>{u.email}</td>
                  <td>{u.nomeEmpresa}</td>
                  <td>{u.endereco}</td>
                  <td>{u.telefone}</td>
                  <td>{u.status === 'frozen' ? 'Congelada' : 'Ativa'}</td>
                  <td className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(idx)}>Editar</Button>
                    <Button size="sm" variant="outline" onClick={() => handleFreeze(idx)}>{u.status === 'frozen' ? 'Ativar' : 'Congelar'}</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(idx)}>Deletar</Button>
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