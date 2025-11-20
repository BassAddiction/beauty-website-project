import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";
import API_ENDPOINTS from '@/config/api';

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

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_USERS, {
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
      const response = await fetch(`${API_ENDPOINTS.ADMIN_USERS}?username=${encodeURIComponent(username)}`, {
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
        const response = await fetch(`${API_ENDPOINTS.ADMIN_USERS}?username=${encodeURIComponent(username)}`, {
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

  const handleRestoreUsers = async () => {
    if (!confirm('Восстановить всех удаленных пользователей из базы данных в Remnawave?\n\nЭто создаст пользователей в VPN системе на основе данных из БД.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.RESTORE_USERS, {
        method: 'POST',
        headers: {
          'X-Admin-Key': adminPassword,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to restore users');
      }

      const result = await response.json();
      
      toast({
        title: '✅ Восстановление завершено',
        description: `Восстановлено: ${result.restored}, Пропущено: ${result.skipped}, Ошибок: ${result.errors}`,
        duration: 10000
      });

      if (result.error_details && result.error_details.length > 0) {
        console.error('Restore errors:', result.error_details);
      }

      await loadUsers();
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось восстановить пользователей',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  const handleRestoreSingleUser = async () => {
    const username = prompt('Введите username пользователя для восстановления:');
    if (!username) return;

    const daysInput = prompt('Введите количество дней подписки (например, 180 для 6 месяцев):');
    if (!daysInput) return;

    const days = parseInt(daysInput);
    if (isNaN(days) || days <= 0) {
      toast({
        title: '❌ Ошибка',
        description: 'Неверное количество дней',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`Восстановить пользователя ${username} с подпиской на ${days} дней?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.RESTORE_USERS, {
        method: 'POST',
        headers: {
          'X-Admin-Key': adminPassword,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          custom_days: days
        })
      });

      if (!response.ok) {
        throw new Error('Failed to restore user');
      }

      const result = await response.json();
      
      if (result.restored > 0) {
        toast({
          title: '✅ Пользователь восстановлен',
          description: `${username} создан в Remnawave с подпиской на ${days} дней`,
          duration: 10000
        });
        console.log('Restored user details:', result.restored_users[0]);
      } else if (result.skipped > 0) {
        toast({
          title: '⚠️ Пропущено',
          description: `Пользователь ${username} уже существует в Remnawave`,
          variant: 'default'
        });
      } else {
        toast({
          title: '❌ Ошибка',
          description: result.error_details?.[0]?.error || 'Не удалось восстановить пользователя',
          variant: 'destructive'
        });
      }

      await loadUsers();
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось восстановить пользователя',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  const handleSendApologyEmail = async () => {
    const email = prompt('Введите email клиента:');
    if (!email) return;

    const username = prompt('Введите username клиента:');
    if (!username) return;

    const daysInput = prompt('Введите количество дней подписки (например, 180 для 6 месяцев):');
    if (!daysInput) return;

    const days = parseInt(daysInput);
    if (isNaN(days) || days <= 0) {
      toast({
        title: '❌ Ошибка',
        description: 'Неверное количество дней',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`Отправить письмо с извинениями на ${email}?\n\nПодписка: ${days} дней\nКопия будет отправлена на mistersvolk@yandex.ru`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SEND_APOLOGY_EMAIL, {
        method: 'POST',
        headers: {
          'X-Admin-Key': adminPassword,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          username: username,
          subscription_url: '',
          days: days
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: '✅ Письмо отправлено',
          description: `Письмо с извинениями отправлено на ${email} с копией на mistersvolk@yandex.ru`,
          duration: 10000
        });
      } else {
        toast({
          title: '❌ Ошибка',
          description: result.error || 'Не удалось отправить письмо',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Email error:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось отправить письмо',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление пользователями VPN</h2>
          <p className="text-muted-foreground">Всего пользователей: {uniqueUsers.length}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleSendApologyEmail} disabled={loading} variant="default">
            <Icon name="Mail" size={16} className="mr-2" />
            Отправить извинения
          </Button>
          <Button onClick={handleRestoreSingleUser} disabled={loading} variant="outline">
            <Icon name="UserCog" size={16} className="mr-2" />
            Восстановить одного
          </Button>
          <Button onClick={handleRestoreUsers} disabled={loading} variant="outline">
            <Icon name="UserPlus" size={16} className="mr-2" />
            Восстановить всех
          </Button>
          <Button onClick={loadUsers} disabled={loading} variant="outline">
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Обновить
          </Button>
        </div>
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