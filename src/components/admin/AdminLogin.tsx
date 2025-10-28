import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

interface AdminLoginProps {
  password: string;
  setPassword: (password: string) => void;
  handleLogin: () => void;
  loading: boolean;
}

export const AdminLogin = ({ password, setPassword, handleLogin, loading }: AdminLoginProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Lock" className="w-6 h-6" />
            Админ-панель Speed VPN
          </CardTitle>
          <CardDescription>Введите пароль для доступа</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Пароль</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Введите пароль"
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={loading || !password}
          >
            {loading ? 'Проверка...' : 'Войти'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
