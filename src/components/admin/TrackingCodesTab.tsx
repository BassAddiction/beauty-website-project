import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import API_ENDPOINTS from '@/config/api';

interface TrackingCodesTabProps {
  adminPassword: string;
}

export const TrackingCodesTab = ({ adminPassword }: TrackingCodesTabProps) => {
  const [headCode, setHeadCode] = useState('');
  const [bodyCode, setBodyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.TRACKING_CODES}?admin_password=${encodeURIComponent(adminPassword)}`);
      const data = await response.json();
      
      if (data.success) {
        setHeadCode(data.head_code || '');
        setBodyCode(data.body_code || '');
      }
    } catch (error) {
      console.error('Ошибка загрузки кодов:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCodes = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(API_ENDPOINTS.TRACKING_CODES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_password: adminPassword,
          head_code: headCode,
          body_code: bodyCode,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Коды успешно сохранены! Перезагрузите страницу, чтобы изменения вступили в силу.');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage('Ошибка сохранения: ' + (data.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      setMessage('Ошибка сохранения: ' + error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <Icon name="Code" className="w-6 h-6 text-primary mt-1" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Счётчики и метатеги</h2>
            <p className="text-muted-foreground">
              Добавьте коды счётчиков аналитики, пикселей и любые другие скрипты. 
              Коды из первого поля добавятся в &lt;head&gt;, из второго — в начало &lt;body&gt;.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="FileCode" className="w-4 h-4 inline mr-2" />
              Код для &lt;head&gt;
            </label>
            <p className="text-sm text-muted-foreground mb-3">
              Яндекс.Метрика, Google Analytics, мета-теги для соцсетей
            </p>
            <Textarea
              value={headCode}
              onChange={(e) => setHeadCode(e.target.value)}
              placeholder={`<!-- Яндекс.Метрика -->
<script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
   ym(XXXXXX, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true
   });
</script>

<!-- VK Pixel -->
<script type="text/javascript">
!function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src='https://vk.com/js/api/openapi.js?169',t.onload=function(){VK.Retargeting.Init("VK-RTRG-XXXXX-XXXXX"),VK.Retargeting.Hit()},document.head.appendChild(t)}();
</script>`}
              className="font-mono text-sm min-h-[300px]"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="FileCode" className="w-4 h-4 inline mr-2" />
              Код для начала &lt;body&gt;
            </label>
            <p className="text-sm text-muted-foreground mb-3">
              Google Tag Manager, Facebook Pixel (если заработает), noscript-версии счётчиков
            </p>
            <Textarea
              value={bodyCode}
              onChange={(e) => setBodyCode(e.target.value)}
              placeholder={`<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<!-- Яндекс.Метрика (noscript) -->
<noscript><div><img src="https://mc.yandex.ru/watch/XXXXXX" style="position:absolute; left:-9999px;" alt="" /></div></noscript>`}
              className="font-mono text-sm min-h-[200px]"
              disabled={saving}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={saveCodes}
              disabled={saving}
              size="lg"
            >
              {saving ? (
                <>
                  <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" className="w-4 h-4 mr-2" />
                  Сохранить коды
                </>
              )}
            </Button>

            {message && (
              <div className={`flex items-center gap-2 ${message.includes('успешно') ? 'text-green-500' : 'text-red-500'}`}>
                <Icon name={message.includes('успешно') ? 'CheckCircle' : 'AlertCircle'} className="w-5 h-5" />
                <span>{message}</span>
              </div>
            )}
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-medium">Что можно добавить:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Яндекс.Метрика</strong> — бесплатная аналитика от Яндекса</li>
                  <li><strong>Google Analytics</strong> — если работает через VPN</li>
                  <li><strong>VK Pixel</strong> — ретаргетинг ВКонтакте</li>
                  <li><strong>Telegram Analytics</strong> — отслеживание из Telegram Ads</li>
                  <li><strong>Custom мета-теги</strong> — Open Graph, Twitter Cards</li>
                  <li><strong>Любые скрипты</strong> — чат-боты, виджеты, попапы</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">
                  ⚠️ После сохранения перезагрузите главную страницу сайта, чтобы увидеть изменения
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};