import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

const AUTH_CHECK_URL = 'https://functions.poehali.dev/833bc0dd-ad44-4b38-b1ac-2ff2f5b265e5';

export const useAdminAuth = (API_URL: string) => {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password');
    if (savedPassword) {
      setPassword(savedPassword);
      handleLogin(savedPassword);
    }
  }, []);

  const handleLogin = async (pwd?: string) => {
    const passToUse = pwd || password;
    setLoading(true);
    
    try {
      // Проверяем, не заблокирован ли IP
      const checkResponse = await fetch(AUTH_CHECK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' })
      });

      if (checkResponse.status === 429) {
        const checkData = await checkResponse.json();
        toast({
          title: '🚫 Доступ временно заблокирован',
          description: checkData.message,
          variant: 'destructive'
        });
        setLoading(false);
        return { success: false, plans: [] };
      }

      const response = await fetch(`${API_URL}?action=plans`, {
        headers: {
          'X-Admin-Password': passToUse
        }
      });
      
      if (response.status === 401) {
        // Записываем неудачную попытку
        await fetch(AUTH_CHECK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'record', 
            username: 'admin',
            success: false 
          })
        });

        toast({
          title: '❌ Неверный пароль',
          variant: 'destructive'
        });
        setIsAuthorized(false);
        localStorage.removeItem('admin_password');
        return { success: false, plans: [] };
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // Записываем успешную попытку
        await fetch(AUTH_CHECK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'record', 
            username: 'admin',
            success: true 
          })
        });

        setIsAuthorized(true);
        localStorage.setItem('admin_password', passToUse);
        
        toast({
          title: '✅ Вход выполнен',
          description: 'Добро пожаловать в админ-панель'
        });
        
        return { success: true, plans: data.plans || [] };
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка подключения',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
    
    return { success: false, plans: [] };
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setPassword('');
    localStorage.removeItem('admin_password');
    toast({
      title: '👋 Выход выполнен'
    });
  };

  return {
    password,
    setPassword,
    isAuthorized,
    loading,
    setLoading,
    handleLogin,
    handleLogout
  };
};