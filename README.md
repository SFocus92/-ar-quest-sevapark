# AR-Квест "СеваПарк" 🗺️🎮

Интерактивный AR-квест для парков развлечений на базе WebAR.

## Особенности

- ✅ Работает в браузере (не требует установки приложения)
- ✅ Поддержка iOS Safari и Android Chrome
- ✅ Маркерное AR (распознавание изображений)
- ✅ Последовательный квест с логикой
- ✅ 3D-объекты и анимации
- ✅ Финальная награда с промокодом

## Технологии

- **Next.js 16** — React-фреймворк
- **A-Frame** — WebVR/AR фреймворк
- **AR.js** — маркерное AR
- **Zustand** — управление состоянием
- **Tailwind CSS + shadcn/ui** — стилизация

## Быстрый старт

### Разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev
```

### Деплой на Netlify

```bash
# Установка Netlify CLI
npm install -g netlify-cli

# Авторизация
netlify login

# Деплой
netlify deploy --prod
```

### Деплой на Vercel

```bash
# Установка Vercel CLI
npm install -g vercel

# Деплой
vercel --prod
```

## Структура проекта

```
src/
├── app/
│   ├── page.tsx           # Главная страница AR-квеста
│   ├── layout.tsx         # Root layout
│   └── markers/           # Страница маркеров для печати
├── components/
│   ├── ar/                # AR-компоненты
│   └── ui/                # UI-компоненты (shadcn)
├── hooks/
│   └── use-quest.ts       # Хук управления квестом
└── lib/
    └── quest-config.ts    # Конфигурация квеста
```

## Кастомизация

### Изменение названия парка и промокода

Отредактируйте `src/lib/quest-config.ts`:

```typescript
export const PARK_CONFIG = {
  name: "Ваш Парк",
  promoCode: "ВАШ_КОД_2024",
  discount: "20%",
};
```

### Добавление этапов квеста

Добавьте новые шаги в массив `STEPS` в файле `quest-config.ts`:

```typescript
{
  id: 'marker_new',
  order: 4,
  markerType: 'custom',
  markerPattern: '/assets/markers/pattern-new.patt',
  title: 'Новое место',
  // ...
}
```

### Создание кастомных маркеров

1. Откройте https://ar-js-org.github.io/AR.js/three.js/examples/marker-training.html
2. Загрузите изображение
3. Скачайте `.patt` файл
4. Поместите в `public/assets/markers/`

## Страницы

- `/` — AR-квест
- `/markers` — Маркеры для печати

## Требования

- Node.js 18+
- HTTPS для продакшена (критично для камеры!)
- Современный браузер с WebRTC

## Лицензия

MIT
