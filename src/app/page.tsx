/**
 * =====================================================
 * ГЛАВНАЯ СТРАНИЦА AR-КВЕСТА
 * =====================================================
 * 
 * Эта страница управляет всем приложением:
 * - Показывает стартовую страницу
 * - Инициализирует AR-сцену
 * - Управляет состоянием квеста
 * 
 * =====================================================
 */

'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { StartPage } from '@/components/ar/start-page';
import { QuestUI } from '@/components/ar/quest-ui';
import { ErrorScreen } from '@/components/ar/error-screen';
import { useQuest } from '@/hooks/use-quest';

// =====================================================
// ДИНАМИЧЕСКИЙ ИМПОРТ AR-СЦЕНЫ (SSR = false)
// =====================================================
// A-Frame работает только в браузере, поэтому отключаем SSR

const ARScene = dynamic(
  () => import('@/components/ar/ar-scene').then(mod => mod.ARScene),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Загрузка AR...</p>
        </div>
      </div>
    )
  }
);

// =====================================================
// ФУНКЦИЯ ЗАГРУЗКИ СКРИПТА (ВНЕ КОМПОНЕНТА)
// =====================================================

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Проверяем, не загружен ли уже скрипт
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    
    document.head.appendChild(script);
  });
}

// =====================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// =====================================================

export default function QuestApp() {
  const { 
    isStarted, 
    startQuest, 
    cameraReady, 
    cameraError, 
    setCameraError,
    setCameraReady 
  } = useQuest();
  
  const [arLoaded, setArLoaded] = useState(false);
  const [showAR, setShowAR] = useState(false);
  
  // ---------------------------------------------------
  // ЗАГРУЗКА A-FRAME СКРИПТОВ
  // ---------------------------------------------------
  
  useEffect(() => {
    // Загружаем A-Frame и AR.js скрипты
    const loadAFrame = async () => {
      // Проверяем, загружен ли уже A-Frame
      if ((window as any).AFRAME) {
        setArLoaded(true);
        return;
      }
      
      try {
        // Загружаем A-Frame
        await loadScript('https://aframe.io/releases/1.4.0/aframe.min.js');
        
        // Загружаем AR.js
        await loadScript('https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js');
        
        setArLoaded(true);
      } catch (error) {
        console.error('Failed to load A-Frame:', error);
        setCameraError('Не удалось загрузить AR-библиотеки. Проверьте интернет-соединение.');
      }
    };
    
    loadAFrame();
  }, [setCameraError]);
  
  // ---------------------------------------------------
  // ОБРАБОТЧИК НАЧАЛА КВЕСТА
  // ---------------------------------------------------
  
  const handleStart = useCallback(() => {
    // Проверяем HTTPS (кроме localhost)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setCameraError('Для работы AR требуется HTTPS. Откройте приложение по защищённой ссылке.');
      return;
    }
    
    startQuest();
    setShowAR(true);
  }, [startQuest, setCameraError]);
  
  // ---------------------------------------------------
  // ОБРАБОТЧИК ГОТОВНОСТИ AR
  // ---------------------------------------------------
  
  const handleARReady = useCallback(() => {
    setCameraReady(true);
  }, [setCameraReady]);
  
  // ---------------------------------------------------
  // ОБРАБОТЧИК ОШИБКИ AR
  // ---------------------------------------------------
  
  const handleARError = useCallback((error: string) => {
    setCameraError(error);
  }, [setCameraError]);
  
  // ---------------------------------------------------
  // ОПРЕДЕЛЕНИЕ ТИПА ОШИБКИ
  // ---------------------------------------------------
  
  const getErrorType = (): 'camera' | 'https' | 'webrtc' | 'unknown' => {
    if (!cameraError) return 'unknown';
    
    if (cameraError.includes('HTTPS') || cameraError.includes('защищён')) {
      return 'https';
    }
    if (cameraError.includes('камер') || cameraError.includes('camera')) {
      return 'camera';
    }
    if (cameraError.includes('WebRTC') || cameraError.includes('поддерживает')) {
      return 'webrtc';
    }
    return 'unknown';
  };
  
  // ---------------------------------------------------
  // РЕНДЕРИНГ
  // ---------------------------------------------------
  
  // Показываем экран ошибки если есть ошибка
  if (cameraError && isStarted) {
    return (
      <ErrorScreen 
        error={cameraError} 
        type={getErrorType()}
        onRetry={() => {
          setCameraError(null);
          window.location.reload();
        }}
      />
    );
  }
  
  // Показываем стартовую страницу если квест не начат
  if (!isStarted || !showAR) {
    return <StartPage onStart={handleStart} />;
  }
  
  // Показываем AR-сцену
  return (
    <div className="relative min-h-screen bg-black">
      {/* AR-сцена */}
      {arLoaded && (
        <Suspense fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p>Загрузка AR...</p>
            </div>
          </div>
        }>
          <ARScene 
            onReady={handleARReady}
            onError={handleARError}
          />
        </Suspense>
      )}
      
      {/* UI Overlay */}
      <QuestUI />
      
      {/* Экран загрузки камеры */}
      {!cameraReady && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-30">
          <div className="text-center text-white p-6">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium mb-2">Инициализация камеры...</p>
            <p className="text-white/60 text-sm">Разрешите доступ к камере в браузере</p>
          </div>
        </div>
      )}
    </div>
  );
}
