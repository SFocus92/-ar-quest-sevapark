/**
 * =====================================================
 * СТАРТОВАЯ СТРАНИЦА КВЕСТА
 * =====================================================
 * 
 * Эта страница показывается перед началом квеста.
 * Содержит кнопку "Начать", которая запускает камеру
 * (критично для iOS Safari - нужен жест пользователя).
 * 
 * =====================================================
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PARK_CONFIG } from '@/lib/quest-config';
import { Compass, Camera, MapPin, AlertCircle } from 'lucide-react';

interface StartPageProps {
  onStart: () => void;
}

export function StartPage({ onStart }: StartPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleStart = async () => {
    setIsLoading(true);
    // Небольшая задержка для плавности
    await new Promise(resolve => setTimeout(resolve, 300));
    onStart();
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-green-800 via-green-700 to-green-900">
      {/* Фоновый паттерн */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Логотип и заголовок */}
      <div className="relative z-10 text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
          <Compass className="w-12 h-12 text-amber-400 animate-pulse" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          AR-Квест
        </h1>
        
        <h2 className="text-xl md:text-2xl text-amber-400 font-semibold">
          {PARK_CONFIG.name}
        </h2>
      </div>
      
      {/* Карточка с описанием */}
      <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardContent className="p-6">
          {/* Описание */}
          <div className="text-center mb-6">
            <p className="text-gray-700 text-lg leading-relaxed">
              Добро пожаловать в AR-квест парка{' '}
              <span className="font-bold text-green-700">{PARK_CONFIG.name}</span>!
            </p>
            <p className="text-gray-600 mt-3">
              Найдите тайные метки, разгадайте загадки и получите награду!
            </p>
          </div>
          
          {/* Инструкции */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Ходите по парку и ищите спрятанные маркеры</span>
            </div>
            <div className="flex items-start gap-3 text-gray-600">
              <Camera className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Наводите камеру на маркеры для обнаружения</span>
            </div>
            <div className="flex items-start gap-3 text-gray-600">
              <Compass className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Соберите все метки и получите промокод</span>
            </div>
          </div>
          
          {/* Кнопка "Начать" */}
          <Button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Загрузка...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Начать квест
              </span>
            )}
          </Button>
          
          {/* Предупреждение для iOS */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                <strong>Важно:</strong> Нажмите «Разрешить» когда браузер запросит доступ к камере. 
                Без этого AR-квест не сможет работать.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Подпись */}
      <p className="relative z-10 mt-6 text-white/60 text-sm text-center">
        Для работы требуется камера и HTTPS-соединение
      </p>
    </div>
  );
}

export default StartPage;
