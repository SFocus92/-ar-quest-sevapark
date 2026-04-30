/**
 * =====================================================
 * AR-СЦЕНА - РАБОЧИЙ СКАНЕР
 * =====================================================
 * 
 * Использует A-Frame + AR.js для распознавания Hiro маркера
 * Для NFT нужно сгенерировать .mind файлы
 * 
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
  const [scanStatus, setScanStatus] = useState('Подготовка...');
  const lastFoundRef = useRef<string | null>(null);
  
  const { 
    handleMarkerFound, 
    setCameraReady, 
    setCameraError,
    currentMarker,
    showingContent,
    completedSteps,
  } = useQuest();

  // ---------------------------------------------------
  // ИНИЦИАЛИЗАЦИЯ AR.JS
  // ---------------------------------------------------
  
  const initAR = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Камера не поддерживается');
      }
      
      setLoadingMessage('Загрузка A-Frame...');
      
      // Ждём A-Frame
      let aframeLoaded = false;
      for (let i = 0; i < 100; i++) {
        if ((window as any).AFRAME) {
          aframeLoaded = true;
          break;
        }
        await new Promise(r => setTimeout(r, 100));
      }
      
      if (!aframeLoaded) {
        throw new Error('A-Frame не загрузился');
      }
      
      setLoadingMessage('Настройка камеры...');
      
      // Создаём контейнер для сцены
      if (!containerRef.current) return;
      
      // Создаём a-scene через A-Frame
      const scene = document.createElement('a-scene');
      scene.setAttribute('embedded', '');
      scene.setAttribute('renderer', 'antialias: true; alpha: true; colorManagement: true;');
      scene.setAttribute('vr-mode-ui', 'enabled: false');
      scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;');
      
      // Камера
      const cameraEntity = document.createElement('a-entity');
      cameraEntity.setAttribute('camera', '');
      cameraEntity.setAttribute('look-controls', 'enabled: false');
      scene.appendChild(cameraEntity);
      
      // Для тестирования создаём Hiro маркер
      // В production нужно использовать NFT с .mind файлами
      const hiroMarker = document.createElement('a-entity');
      hiroMarker.setAttribute('marker', 'type: pattern; url: https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.patt');
      
      // 3D объект для визуализации
      const modelEntity = document.createElement('a-entity');
      modelEntity.setAttribute('gltf-model', '#model-astronaut');
      modelEntity.setAttribute('scale', '0.5 0.5 0.5');
      modelEntity.setAttribute('position', '0 0 0');
      modelEntity.setAttribute('rotation', '-90 0 0');
      modelEntity.setAttribute('visible', 'false');
      modelEntity.id = 'hiro-model';
      
      // Анимация при появлении
      modelEntity.setAttribute('animation', 'property: scale; from: 0 0 0; to: 0.5 0.5 0.5; dur: 500; easing: easeOutElastic');
      
      hiroMarker.appendChild(modelEntity);
      scene.appendChild(hiroMarker);
      
      // Создаём 3D модель (скрытая)
      const asset = document.createElement('a-assets');
      
      // Пробуем загрузить модель если есть
      const modelItem = document.createElement('a-asset-item');
      modelItem.id = 'model-astronaut';
      modelItem.setAttribute('src', '/assets/models/astronaut.glb');
      asset.appendChild(modelItem);
      scene.appendChild(asset);
      
      // Обработчики событий для Hiro маркера
      hiroMarker.addEventListener('markerFound', () => {
        console.log('Hiro marker found!');
        setScanStatus('Маркер найден! 🎉');
        
        // Находим текущий ожидаемый маркер
        const expectedStep = STEPS[completedSteps];
        if (expectedStep) {
          handleMarkerFound(expectedStep.id);
          lastFoundRef.current = expectedStep.id;
        }
        
        // Показываем модель
        setTimeout(() => {
          const model = document.getElementById('hiro-model');
          if (model) model.setAttribute('visible', 'true');
        }, 500);
      });
      
      hiroMarker.addEventListener('markerLost', () => {
        console.log('Hiro marker lost');
        setScanStatus('Сканирование...');
        
        const model = document.getElementById('hiro-model');
        if (model) model.setAttribute('visible', 'false');
      });
      
      scene.addEventListener('loaded', () => {
        console.log('AR Scene loaded');
        setIsLoading(false);
        setCameraReady(true);
        onReady?.();
        setScanStatus('Наведите камеру на Hiro маркер');
      });
      
      scene.addEventListener('error', (e: any) => {
        console.error('AR error:', e);
        setCameraError('Ошибка AR');
        onError?.('Ошибка');
      });
      
      containerRef.current.appendChild(scene);
      
      // Скрываем стандартные элементы AR.js
      setTimeout(() => {
        const enterVR = document.querySelector('.a-enter-vr');
        if (enterVR) (enterVR as HTMLElement).style.display = 'none';
      }, 2000);
      
    } catch (error: any) {
      console.error('Init error:', error);
      let msg = 'Ошибка инициализации';
      if (error.message?.includes('timeout')) msg = 'Не загрузились AR библиотеки';
      else if (error.message?.includes('камер')) msg = 'Камера недоступна';
      
      setCameraError(msg);
      onError?.(msg);
      setIsLoading(false);
    }
  }, [handleMarkerFound, setCameraReady, setCameraError, onReady, onError, completedSteps]);

  // ---------------------------------------------------
  // МОНТИРОВАНИЕ
  // ---------------------------------------------------
  
  useEffect(() => {
    initAR();
  }, [initAR]);

  // ---------------------------------------------------
  // ТЕКУЩИЙ ШАГ
  // ---------------------------------------------------
  
  const displayStep = currentMarker && showingContent 
    ? STEPS.find(s => s.id === currentMarker) 
    : null;

  // ---------------------------------------------------
  // РЕНДЕРИНГ
  // ---------------------------------------------------
  
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
      {/* Статус сканирования */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '12px 24px',
        borderRadius: 25,
        color: '#22c55e',
        fontSize: '16px',
        zIndex: 60,
        fontWeight: 'bold',
        border: '2px solid #22c55e',
      }}>
        📷 {scanStatus}
      </div>

      {/* Подсказка для тестирования */}
      <div style={{
        position: 'absolute',
        top: 90,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: '15px',
        borderRadius: 15,
        color: 'white',
        fontSize: '14px',
        zIndex: 50,
        maxWidth: '90%',
        textAlign: 'center',
        border: '1px solid #666',
      }}>
        <p style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: 8 }}>⚠️ Для тестирования:</p>
        <p>1. Откройте https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png</p>
        <p>2. Покажите это изображение на другом экране</p>
        <p>3. Наведите камеру на изображение</p>
        <p style={{ marginTop: 10, color: '#ef4444', fontSize: 12 }}>
          Для своих маркеров нужны .mind файлы
        </p>
      </div>

      {/* Прогресс */}
      <div style={{
        position: 'absolute',
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '15px 30px',
        borderRadius: 30,
        color: 'white',
        fontSize: '16px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span>📍</span>
        <span>Этап {completedSteps + 1} из {STEPS.length}</span>
        <span style={{ color: '#22c55e' }}>{STEPS[completedSteps]?.title || ''}</span>
      </div>

      {/* 3D объект при обнаружении */}
      {displayStep && showingContent && (
        <MarkerObject step={displayStep} />
      )}

      {/* Загрузка */}
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
  
  useEffect(() => {
    if (step.soundUrl) {
      new Audio(step.soundUrl).play().catch(() => {});
    }
  }, [step.soundUrl]);

  const content = (() => {
    return (
      <div style={{ transform: `scale(${step.scale})`, textAlign: 'center' }}>
        <div className="w-40 h-40 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
          <span style={{ fontSize: '48px' }}>✨</span>
        </div>
        <p className="text-white text-2xl font-bold mt-6">{step.title}</p>
        {step.scrollText && (
          <div className="mt-4 bg-black/80 border-2 border-yellow-500 rounded-lg p-4 max-w-xs mx-auto">
            <p className="text-yellow-300 text-base">{step.scrollText}</p>
          </div>
        )}
        {step.clueForNext && (
          <div className="mt-4 bg-blue-900/80 border border-blue-400 rounded-lg p-3 max-w-xs mx-auto">
            <p className="text-blue-200 text-sm">{step.clueForNext}</p>
          </div>
        )}
        {step.id === 'marker_lake' && (
          <div className="mt-6 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl p-6">
            <p className="text-white text-3xl font-bold">🎉 SEVA2024AR</p>
            <p className="text-white text-lg mt-2">Скидка 25% на посещение парка!</p>
          </div>
        )}
      </div>
    );
  })();

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