import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface TestResult {
  test: string;
  status?: number;
  response?: string;
  error?: string;
}

const AdminUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    message: string;
    test_user: { username: string; uuid: string };
    test_results: TestResult[];
  } | null>(null);
  const [error, setError] = useState('');
  const [inbounds, setInbounds] = useState<any>(null);

  const handleGetInbounds = async () => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/fd8d4fcc-154c-42a6-b352-7b8c3c1aa5ae?action=inbounds'
      );
      const data = await response.json();
      setInbounds(data);
      console.log('Inbounds:', data);
    } catch (err) {
      console.error('Ошибка получения inbounds:', err);
    }
  };

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
          <Button 
            onClick={handleGetInbounds} 
            variant="outline"
            className="w-full mb-4"
          >
            <Icon name="List" className="w-5 h-5 mr-2" />
            Показать список Inbounds (сквадов)
          </Button>

          {inbounds && (
            <div className="p-4 bg-muted rounded-md mb-4">
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(inbounds, null, 2)}
              </pre>
            </div>
          )}

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
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="TestTube" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    {results.message}
                  </p>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Тестовый пользователь: <span className="font-mono">{results.test_user.username}</span>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                  UUID: {results.test_user.uuid}
                </p>
              </div>

              {results.test_results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Результаты тестирования API endpoints:</p>
                  {results.test_results.map((test, idx) => (
                    <Card
                      key={idx}
                      className={`${
                        test.status === 200
                          ? 'border-green-500'
                          : test.error
                          ? 'border-red-500'
                          : 'border-yellow-500'
                      }`}
                    >
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm">{test.test}</span>
                            <span className={`text-sm font-bold ${
                              test.status === 200 ? 'text-green-600' : 
                              test.error ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {test.status ? `HTTP ${test.status}` : '❌ ERROR'}
                            </span>
                          </div>
                          {test.response && (
                            <details>
                              <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                                Показать ответ
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                                {test.response}
                              </pre>
                            </details>
                          )}
                          {test.error && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              Ошибка: {test.error}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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