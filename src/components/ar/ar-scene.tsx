/**
 * =====================================================
 * AR-СЦЕНА - MINDAR СКАНЕР
 * =====================================================
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuest } from '@/hooks/use-quest';
import { STEPS, QuestStep } from '@/lib/quest-config';

interface ARSceneProps {
  onReady?: () => void;
  onError?: (error: string) => void;
}

export function ARScene({ onReady, onError }: ARSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Инициализация...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { 
    handleMarkerFound, 
    setCameraReady, 
    setCameraError,
    currentMarker,
    showingContent,
    completedSteps,
  } = useQuest();

  // ---------------------------------------------------
  // ИНИЦИАЛИЗАЦИЯ
  // ---------------------------------------------------
  
  const initAR = useCallback(async () => {
    try {
      console.log('[AR] Начало инициализации...');
      
      // Проверяем поддержку камеры
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Камера не поддерживается браузером');
      }
      
      setLoadingMessage('Загрузка AR библиотек...');
      
      // Проверяем загрузку A-Frame + THREE
      let attempts = 0;
      while (attempts < 50) {
        const aframe = (window as any).AFRAME;
        const three = (window as any).THREE;
        const mindar = (window as any).MINDAR;
        
        if (aframe && three && mindar) {
          console.log('[AR] Библиотеки загружены');
          break;
        }
        
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }
      
      const AFRAME = (window as any).AFRAME;
      const THREE = (window as any).THREE;
      const MINDAR = (window as any).MINDAR;
      
      if (!AFRAME || !THREE || !MINDAR) {
        console.error('[AR] Не загрузились: A-Frame=', !!AFRAME, 'THREE=', !!THREE, 'MINDAR=', !!MINDAR);
        throw new Error('AR библиотеки не загрузились. Проверьте интернет-соединение.');
      }
      
      setLoadingMessage('Настройка камеры...');
      console.log('[AR] Создание MindAR...');
      
      // Собираем маркеры
      const imageTargets: string[] = [];
      STEPS.forEach(step => {
        if (step.markerType === 'nft' && step.nftDescriptor) {
          imageTargets.push(step.nftDescriptor + '.mind');
        }
      });
      
      console.log('[AR] Маркеры:', imageTargets);
      
      // Создаём MindAR с правильной конфигурацией
      const mindar = new MINDAR.Image({
        imageTargetsSrc: imageTargets.join(','),
        filterThreshold: 0.7,
        uiLoading: 'no',
        uiScanning: 'no', 
        uiError: 'no',
        showStats: false,
        deviceType: 'auto'
      });
      
      console.log('[AR] MindAR создан');
      
      // Рендерер
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(1, 1, 0.1, 1000);
      
      // Свет
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      
      // Обработчики событий
      mindar.onStart = () => {
        console.log('[AR] MindAR started');
        
        const video = document.querySelector('video');
        if (video) {
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.objectFit = 'cover';
        }
        
        const canvas = renderer.domElement;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        containerRef.current?.appendChild(canvas);
        
        setIsLoading(false);
        setCameraReady(true);
        onReady?.();
        
        console.log('[AR] Готов к сканированию!');
        
        // Запускаем рендеринг
        const animate = () => {
          renderer.render(scene, camera);
          requestAnimationFrame(animate);
        };
        animate();
      };
      
      // Обработка маркеров
      for (let i = 0; i < STEPS.length; i++) {
        const step = STEPS[i];
        const anchor = mindar.addAnchor(i);
        
        const group = new THREE.Group();
        group.visible = false;
        anchor.group.add(group);
        
        anchor.onTargetFound = () => {
          console.log('[AR] Найден маркер:', step.id);
          group.visible = true;
          handleMarkerFound(step.id);
          
          if (step.soundUrl) {
            new Audio(step.soundUrl).play().catch(() => {});
          }
        };
        
        anchor.onTargetLost = () => {
          group.visible = false;
        };
      }
      
      mindar.onError = (err: any) => {
        console.error('[AR] MindAR error:', err);
        setCameraError('Ошибка AR: ' + (err.message || err));
        onError?.(err.message);
      };
      
      // Запуск
      mindar.start();
      
    } catch (error: any) {
      console.error('[AR] Ошибка инициализации:', error);
      setErrorMessage(error.message || 'Неизвестная ошибка');
      setCameraError(error.message || 'Ошибка инициализации AR');
      onError?.(error.message);
      setIsLoading(false);
    }
  }, [handleMarkerFound, setCameraReady, setCameraError, onReady, onError]);

  // ---------------------------------------------------
  // МОНТИРОВАНИЕ
  // ---------------------------------------------------
  
  useEffect(() => {
    // Небольшая задержка чтобы A-Frame загрузился
    const timer = setTimeout(() => {
      initAR();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [initAR]);

  // ---------------------------------------------------
  // РЕНДЕРИНГ
  // ---------------------------------------------------
  
  const displayStep = currentMarker && showingContent 
    ? STEPS.find(s => s.id === currentMarker) 
    : null;
  
  const currentStep = STEPS[completedSteps];

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: 0,
        backgroundColor: '#000',
      }}
    >
      {/* Статус */}
      {!isLoading && !errorMessage && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: '12px 24px',
          borderRadius: 25,
          color: '#22c55e',
          fontSize: '16px',
          zIndex: 60,
          fontWeight: 'bold',
          border: '2px solid #22c55e',
        }}>
          📷 Готов к сканированию
        </div>
      )}

      {/* Прогресс */}
      {!isLoading && !errorMessage && (
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '15px 25px',
          borderRadius: 30,
          color: 'white',
          fontSize: '15px',
          zIndex: 50,
        }}>
          📍 Этап {completedSteps + 1} из {STEPS.length}: {currentStep?.title || 'Квест завершён'}
        </div>
      )}

      {/* 3D объект */}
      {displayStep && showingContent && (
        <MarkerObject step={displayStep} />
      )}

      {/* Загрузка или ошибка */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.95)',
          color: 'white',
          zIndex: 100,
        }}>
          <div style={{
            width: 60,
            height: 60,
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #22c55e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ marginTop: 20, fontSize: 18 }}>{loadingMessage}</p>
          <p style={{ marginTop: 10, fontSize: 14, opacity: 0.7 }}>
            Подождите, загружаются AR библиотеки...
          </p>
        </div>
      )}

      {errorMessage && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.95)',
          color: 'white',
          zIndex: 100,
          padding: '20px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 24, color: '#ef4444', marginBottom: 20 }}>⚠️ Ошибка</p>
          <p style={{ fontSize: 16 }}>{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20,
              padding: '12px 24px',
              fontSize: 16,
              backgroundColor: '#22c55e',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Перезагрузить
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// =====================================================
// 3D-ОБЪЕКТ
// =====================================================

interface MarkerObjectProps {
  step: QuestStep;
}

function MarkerObject({ step }: MarkerObjectProps) {
  const animations: Record<string, string> = {
    fadeIn: 'animate-[fadeIn_0.5s_ease-out_forwards]',
    scaleIn: 'animate-[scaleIn_0.5s_ease-out_forwards]',
    bounceIn: 'animate-[bounceIn_0.6s_ease-out_forwards]',
    rotateIn: 'animate-[rotateIn_0.5s_ease-out_forwards]',
    portalIn: 'animate-[scaleIn_0.8s_ease-out_forwards]',
  };
  
  const animClass = animations[step.animation] || animations.scaleIn;

  const content = (
    <div style={{ transform: `scale(${step.scale})`, textAlign: 'center', maxWidth: '90%' }}>
      <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
        <span style={{ fontSize: '48px' }}>✨</span>
      </div>
      <p className="text-white text-2xl font-bold mt-4">{step.title}</p>
      {step.scrollText && (
        <div className="mt-4 bg-black/80 border-2 border-yellow-500 rounded-lg p-4 max-w-sm mx-auto">
          <p className="text-yellow-300 text-base">{step.scrollText}</p>
        </div>
      )}
      {step.clueForNext && (
        <div className="mt-3 bg-blue-900/80 border border-blue-400 rounded-lg p-3 max-w-sm mx-auto">
          <p className="text-blue-200 text-sm">{step.clueForNext}</p>
        </div>
      )}
      {step.id === 'marker_lake' && (
        <div className="mt-6 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl p-6">
          <p className="text-white text-3xl font-bold">🎉 SEVA2024AR</p>
          <p className="text-white text-lg mt-2">Скидка 25%!</p>
        </div>
      )}
    </div>
  );

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-30 ${animClass}`}
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
    >
      {content}
    </div>
  );
}

export default ARScene;