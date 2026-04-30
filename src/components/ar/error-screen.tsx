/**
 * =====================================================
 * ЭКРАН ОШИБКИ КАМЕРЫ / HTTPS
 * =====================================================
 * 
 * Показывается когда:
 * - Нет доступа к камере
 * - Страница открыта по HTTP вместо HTTPS
 * - Устройство не поддерживает WebRTC
 * 
 * =====================================================
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Wifi, Camera, HelpCircle } from 'lucide-react';

interface ErrorScreenProps {
  error: string;
  type: 'camera' | 'https' | 'webrtc' | 'unknown';
  onRetry?: () => void;
}

export function ErrorScreen({ error, type, onRetry }: ErrorScreenProps) {
  // ---------------------------------------------------
  // КОНФИГУРАЦИЯ ОШИБОК
  // ---------------------------------------------------
  
  const errorConfig = {
    camera: {
      icon: Camera,
      title: 'Нет доступа к камере',
      description: 'Для работы AR-квеста необходим доступ к камере устройства.',
      tips: [
        'Нажмите "Разрешить" в запросе браузера',
        'Проверьте настройки приватности устройства',
        'Попробуйте другой браузер (Chrome, Safari)',
      ],
    },
    https: {
      icon: Wifi,
      title: 'Требуется HTTPS',
      description: 'AR-квест работает только через защищённое соединение.',
      tips: [
        'Откройте приложение по HTTPS-ссылке',
        'Для теста используйте ngrok или Netlify',
        'На localhost HTTP работает для тестирования',
      ],
    },
    webrtc: {
      icon: AlertCircle,
      title: 'Устройство не поддерживается',
      description: 'Ваше устройство или браузер не поддерживает WebRTC.',
      tips: [
        'Обновите браузер до последней версии',
        'Попробуйте Chrome (Android) или Safari (iOS)',
        'Проверьте, что устройство имеет камеру',
      ],
    },
    unknown: {
      icon: HelpCircle,
      title: 'Произошла ошибка',
      description: 'Не удалось инициализировать AR-квест.',
      tips: [
        'Перезагрузите страницу',
        'Проверьте интернет-соединение',
        'Попробуйте позже',
      ],
    },
  };
  
  const config = errorConfig[type];
  const Icon = config.icon;
  
  // ---------------------------------------------------
  // РЕНДЕРИНГ
  // ---------------------------------------------------
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-red-900 to-red-950">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-6">
          {/* Иконка */}
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-red-600" />
          </div>
          
          {/* Заголовок */}
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
            {config.title}
          </h2>
          
          <p className="text-gray-600 text-center mb-4">
            {config.description}
          </p>
          
          {/* Детали ошибки */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">
              {error}
            </p>
          </div>
          
          {/* Советы */}
          <div className="space-y-2 mb-6">
            <p className="text-gray-500 text-sm font-medium">Попробуйте:</p>
            <ul className="space-y-1">
              {config.tips.map((tip, index) => (
                <li key={index} className="text-gray-600 text-sm flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Кнопки */}
          <div className="space-y-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Попробовать снова
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Перезагрузить страницу
            </Button>
          </div>
          
          {/* Информация о поддержке */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              Поддерживаемые браузеры: Chrome 79+, Safari 11+, Firefox 63+
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorScreen;
