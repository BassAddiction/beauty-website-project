import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";

interface User {
  username: string;
  email: string;
  plan_name: string;
  plan_days: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UsersManagementProps {
  adminPassword: string;
}

const UsersManagement = ({ adminPassword }: UsersManagementProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const ADMIN_USERS_URL = 'https://functions.poehali.dev/e99b698b-6c6b-46cc-9206-1d6dac7e8575';

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(ADMIN_USERS_URL, {
        method: 'GET',
        headers: {
          'X-Admin-Key': adminPassword
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Load users error:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${username}?\n\nЭто удалит пользователя из:\n- Базы данных\n- RemnaWave панели`)) {
      return;
    }

    setDeletingUser(username);
    try {
      const response = await fetch(`${ADMIN_USERS_URL}?username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Key': adminPassword
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast({
        title: '✅ Успешно удалено',
        description: `Пользователь ${username} удалён`
      });

      await loadUsers();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось удалить пользователя',
        variant: 'destructive'
      });
    }
    setDeletingUser(null);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === uniqueUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(uniqueUsers.map(u => u.username));
    }
  };

  const toggleSelectUser = (username: string) => {
    setSelectedUsers(prev => 
      prev.includes(username) 
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: '⚠️ Предупреждение',
        description: 'Выберите пользователей для удаления',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`Вы уверены, что хотите удалить ${selectedUsers.length} пользователей?\n\nЭто удалит их из:\n- Базы данных\n- RemnaWave панели`)) {
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const username of selectedUsers) {
      try {
        const response = await fetch(`${ADMIN_USERS_URL}?username=${encodeURIComponent(username)}`, {
          method: 'DELETE',
          headers: {
            'X-Admin-Key': adminPassword
          }
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Failed to delete ${username}:`, error);
        failCount++;
      }
    }

    toast({
      title: successCount > 0 ? '✅ Удаление завершено' : '❌ Ошибка',
      description: `Успешно: ${successCount}, Ошибок: ${failCount}`,
      variant: failCount > 0 ? 'destructive' : 'default'
    });

    setSelectedUsers([]);
    await loadUsers();
    setLoading(false);
  };

  useEffect(() => {
    if (adminPassword) {
      loadUsers();
    }
  }, [adminPassword]);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniqueUsers = Array.from(
    new Map(filteredUsers.map(user => [user.username, user])).values()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление пользователями VPN</h2>
          <p className="text-muted-foreground">Всего пользователей: {uniqueUsers.length}</p>
        </div>
        <Button onClick={loadUsers} disabled={loading} variant="outline">
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Обновить
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="Поиск по имени пользователя или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                <Icon name="X" size={16} />
              </Button>
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Выбрано: {selectedUsers.length}
                </Badge>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={loading}
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Удалить выбранных
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                >
                  Отменить
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input 
                      type="checkbox"
                      checked={selectedUsers.length === uniqueUsers.length && uniqueUsers.length > 0}
                      onChange={toggleSelectAll}
                      className="cursor-pointer w-4 h-4"
                    />
                  </TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Тариф</TableHead>
                  <TableHead>Дней</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Icon name="Loader2" size={32} className="animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : uniqueUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Пользователи не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  uniqueUsers.map((user) => (
                    <TableRow key={user.username}>
                      <TableCell>
                        <input 
                          type="checkbox"
                          checked={selectedUsers.includes(user.username)}
                          onChange={() => toggleSelectUser(user.username)}
                          className="cursor-pointer w-4 h-4"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.plan_name}</TableCell>
                      <TableCell>{user.plan_days}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            user.status === 'succeeded' ? 'default' : 
                            user.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.username)}
                          disabled={deletingUser === user.username}
                        >
                          {deletingUser === user.username ? (
                            <Icon name="Loader2" size={16} className="animate-spin" />
                          ) : (
                            <Icon name="Trash2" size={16} />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
