import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface UpdateResult {
  username: string;
  status: string;
  error?: string;
}

const AdminUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    total_users: number;
    updated: number;
    failed: number;
    results: UpdateResult[];
  } | null>(null);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(
        'https://functions.poehali.dev/058e87bb-5d15-4a90-8f78-2ab58eeaf5c8',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="max-w-4xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Settings" className="w-6 h-6" />
            Обновление настроек пользователей
          </CardTitle>
          <CardDescription>
            Применить настройки: 30 ГБ лимит, ежедневный сброс, VLESS-Reality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!results && !error && (
            <Button 
              onClick={handleUpdate} 
              disabled={loading} 
              className="w-full button-glow"
              size="lg"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" className="w-5 h-5 mr-2 animate-spin" />
                  Обновление пользователей...
                </>
              ) : (
                <>
                  <Icon name="RefreshCw" className="w-5 h-5 mr-2" />
                  Обновить всех пользователей
                </>
              )}
            </Button>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
              <Icon name="AlertCircle" className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-blue-500">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {results.total_users}
                      </p>
                      <p className="text-sm text-muted-foreground">Всего</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-500">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {results.updated}
                      </p>
                      <p className="text-sm text-muted-foreground">Обновлено</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-500">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {results.failed}
                      </p>
                      <p className="text-sm text-muted-foreground">Ошибок</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Обновление завершено! Применены настройки: 30 ГБ лимит, ежедневный сброс трафика, VLESS-Reality inbound.
                  </p>
                </div>
              </div>

              {results.results.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Показать детали ({results.results.length} пользователей)
                  </summary>
                  <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                    {results.results.map((result, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded text-xs ${
                          result.status === 'success'
                            ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200'
                            : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200'
                        }`}
                      >
                        <span className="font-mono">{result.username}</span>
                        <span>
                          {result.status === 'success' ? '✅' : '❌'}
                          {result.error && ` ${result.error}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <Button 
                onClick={() => {
                  setResults(null);
                  setError('');
                }} 
                variant="outline" 
                className="w-full"
              >
                <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
                Вернуться
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUpdate;
