/**
 * =====================================================
 * AR-СЦЕНА - MINDAR СКАНЕР (есди загружен) или ПРОСТАЯ КАМЕРА
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mindarRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Инициализация...');
  const [useMindAR, setUseMindAR] = useState(false);
  
  const { 
    handleMarkerFound, 
    handleMarkerLost,
    setCameraReady, 
    setCameraError,
    currentMarker,
    showingContent,
    completedSteps,
  } = useQuest();

  // ---------------------------------------------------
  // ИНИЦИАЛИЗАЦИЯ MINDAR (есди доступен)
  // ---------------------------------------------------
  
  const initMindAR = useCallback(async () => {
    try {
      const MINDAR = (window as any).MINDAR;
      const THREE = (window as any).THREE;
      
      if (!MINDAR || !THREE) {
        console.log('[AR] MindAR недоступен, используем камеру');
        throw new Error('MindAR не загружен');
      }
      
      setStatusMessage('Настройка MindAR...');
      console.log('[AR] Инициализация MindAR...');
      
      // Собираем маркеры
      const imageTargets = STEPS
        .filter(step => step.markerType === 'nft' && step.nftDescriptor)
        .map(step => step.nftDescriptor + '.mind');
      
      console.log('[AR] Маркеры:', imageTargets);
      
      // Создаём MindAR
      const mindar = new MINDAR.Image({
        imageTargetsSrc: imageTargets.join(','),
        filterThreshold: 0.7,
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no'
      });
      
      mindarRef.current = mindar;
      
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      
      // Добавляем якоря для маркеров
      STEPS.forEach((step, idx) => {
        if (step.markerType !== 'nft') return;
        
        const anchor = mindar.addAnchor(idx);
        const group = new THREE.Group();
        group.visible = false;
        anchor.group.add(group);
        
        anchor.onTargetFound = () => {
          console.log('[AR] Найден:', step.id);
          group.visible = true;
          handleMarkerFound(step.id);
          setStatusMessage(`Найден: ${step.title} ✅`);
        };
        
        anchor.onTargetLost = () => {
          group.visible = false;
          setStatusMessage('Сканирование...');
        };
      });
      
      mindar.onStart = () => {
        console.log('[AR] MindAR запущен');
        
        const video = document.querySelector('video');
        if (video) {
          video.style.objectFit = 'cover';
        }
        
        const canvas = renderer.domElement;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        containerRef.current?.appendChild(canvas);
        
        setUseMindAR(true);
        setIsLoading(false);
        setCameraReady(true);
        onReady?.();
        setStatusMessage('Наведите камеру на фото');
        
        // Рендеринг
        const animate = () => {
          renderer.render(scene, camera);
          requestAnimationFrame(animate);
        };
        animate();
      };
      
      mindar.onError = (err: any) => {
        console.error('[AR] MindAR error:', err);
        throw new Error('MindAR ошибка');
      };
      
      mindar.start();
      
    } catch (error) {
      console.log('[AR] MindAR недоступен, использую камеру');
      throw error;
    }
  }, [handleMarkerFound, setCameraReady, onReady]);

  // ---------------------------------------------------
  // ИНИЦИАЛИЗАЦИЯ ПРОСТОЙ КАМЕРЫ (ФОЛЛБЭК)
  // ---------------------------------------------------
  
  const initCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Камера не поддерживается');
      }
      
      setStatusMessage('Запрос камеры...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      console.log('[AR] Камера активна');
      
      setIsLoading(false);
      setCameraReady(true);
      onReady?.();
      setStatusMessage('Готов - тапните для теста');
      
    } catch (error: any) {
      let msg = 'Ошибка камеры';
      if (error.name === 'NotAllowedError') {
        msg = 'Доступ к камере запрещён';
      }
      setStatusMessage(msg);
      setCameraError(msg);
      onError?.(msg);
      setIsLoading(false);
    }
  }, [setCameraReady, setCameraError, onReady, onError]);

  // ---------------------------------------------------
  // ОБРАБОТЧИК ТАПА (СИМУЛЯЦИЯ)
  // ---------------------------------------------------
  
  const handleScreenTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const step = STEPS[completedSteps];
    if (step) {
      handleMarkerFound(step.id);
      setStatusMessage(`Найден: ${step.title} ✅`);
      setTimeout(() => {
        handleMarkerLost();
        if (!useMindAR) setStatusMessage('Тапните для теста');
      }, 3000);
    }
  }, [handleMarkerFound, handleMarkerLost, completedSteps, useMindAR]);

  // ---------------------------------------------------
  // МОНТИРОВАНИЕ
  // ---------------------------------------------------
  
  useEffect(() => {
    // Сначала пробуем MindAR, потом камера
    initMindAR().catch(() => {
      initCamera();
    });
    
    return () => {
      if (mindarRef.current) {
        mindarRef.current.stop();
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, [initMindAR, initCamera]);

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
        position: 'fixed', top: 0, left: 0, 
        width: '100%', height: '100%', zIndex: 0, backgroundColor: '#000' 
      }}
      onClick={handleScreenTap}
    >
      {/* Видео с камеры (если не MindAR) */}
      {!useMindAR && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%', objectFit: 'cover'
          }}
        />
      )}

      {/* Статус */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.85)', padding: '12px 24px', borderRadius: 25,
        color: '#22c55e', fontSize: '16px', zIndex: 60, fontWeight: 'bold',
        border: '2px solid #22c55e', maxWidth: '90%', textAlign: 'center'
      }}>
        📷 {statusMessage}
      </div>

      {/* Прогресс */}
      <div style={{
        position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.8)', padding: '15px 25px', borderRadius: 30,
        color: 'white', fontSize: '15px', zIndex: 50
      }}>
        📍 Этап {completedSteps + 1} из {STEPS.length}: {currentStep?.title || 'Квест завершён'}
      </div>

      {/* 3D объект */}
      {displayStep && showingContent && <MarkerObject step={displayStep} />}

      {/* Загрузка */}
      {isLoading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.95)', color: 'white', zIndex: 100
        }}>
          <div style={{
            width: 60, height: 60,
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #22c55e', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: 20, fontSize: 18 }}>{statusMessage}</p>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// =====================================================
// 3D-ОБЪЕКТ
// =====================================================

function MarkerObject({ step }: { step: QuestStep }) {
  const animClass = step.animation === 'bounceIn' ? 'animate-[bounceIn_0.6s_ease-out_forwards]' :
                    step.animation === 'rotateIn' ? 'animate-[rotateIn_0.5s_ease-out_forwards]' :
                    'animate-[scaleIn_0.5s_ease-out_forwards]';

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-30 ${animClass}`}
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
    >
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
    </div>
  );
}

export default ARScene;