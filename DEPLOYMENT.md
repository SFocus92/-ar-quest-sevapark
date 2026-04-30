# Инструкция по деплою AR-квеста на Netlify

## Предварительные требования

- Аккаунт на GitHub (https://github.com/SFocus92)
- Аккаунт на Netlify (https://netlify.com)
- Git установлен локально
- Node.js 18+ установлен

## Шаг 1: Создание NFT-дескрипторов

**Важно:** Без этого шага AR-распознавание работать не будет!

1. Откройте https://carnaux.github.io/NFT-Marker-Creator/
2. Для каждого файла `public/assets/nft-sources/marker-X.jpg` (X от 1 до 7):
   - Нажмите "Choose File" и загрузите marker-X.jpg
   - Нажмите "Generate"
   - Дождитесь завершения (может занять 1-2 минуты)
   - Скачайте 3 файла: `image.fset`, `image.fset3`, `image.iset`
   - Переименуйте их в `marker-X.fset`, `marker-X.fset3`, `marker-X.iset`
   - Поместите в папку `public/assets/nft/`

После завершения в `public/assets/nft/` должно быть 21 файл (7 маркеров × 3 файла).

## Шаг 2: Коммит NFT-дескрипторов

```bash
cd D:\ar-quest-sevapark
git add public/assets/nft/
git commit -m "Add NFT marker descriptors for AR recognition"
```

## Шаг 3: Создание репозитория на GitHub

### Вариант A: Через веб-интерфейс

1. Откройте https://github.com/new
2. Repository name: `ar-quest-sevapark`
3. Description: `AR Quest for СеваПарк - WebAR quest with NFT markers`
4. Выберите **Public**
5. **НЕ** добавляйте README, .gitignore или лицензию (уже есть)
6. Нажмите "Create repository"

### Вариант B: Через GitHub CLI

```bash
gh repo create ar-quest-sevapark --public --source=. --remote=origin
```

## Шаг 4: Пуш кода на GitHub

```bash
git remote add origin https://github.com/SFocus92/ar-quest-sevapark.git
git branch -M main
git push -u origin main
```

Если попросит авторизацию:
- Username: SFocus92
- Password: используйте Personal Access Token (не пароль!)

## Шаг 5: Подключение к Netlify

### Вариант A: Через веб-интерфейс (рекомендуется)

1. Откройте https://app.netlify.com/
2. Нажмите "Add new site" → "Import an existing project"
3. Выберите "Deploy with GitHub"
4. Авторизуйте Netlify для доступа к GitHub
5. Выберите репозиторий `SFocus92/ar-quest-sevapark`
6. Настройки билда:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 20
7. Нажмите "Deploy site"

### Вариант B: Через Netlify CLI

```bash
# Установить Netlify CLI (если еще не установлен)
npm install -g netlify-cli

# Авторизоваться
netlify login

# Инициализировать сайт
netlify init

# Выбрать:
# - Create & configure a new site
# - Team: ваш аккаунт
# - Site name: ar-quest-sevapark
# - Build command: npm run build
# - Publish directory: .next

# Деплой
netlify deploy --prod
```

## Шаг 6: Настройка домена (опционально)

1. В Netlify Dashboard откройте ваш сайт
2. Перейдите в "Domain settings"
3. По умолчанию будет: `ar-quest-sevapark.netlify.app`
4. Можно изменить на кастомный поддомен или подключить свой домен

## Шаг 7: Тестирование

1. Откройте URL сайта (например: https://ar-quest-sevapark.netlify.app)
2. На мобильном устройстве:
   - iOS: откройте в Safari
   - Android: откройте в Chrome
3. Разрешите доступ к камере
4. Наведите на распечатанные фотографии или реальные объекты
5. Проверьте все 7 этапов

## Шаг 8: Обновление сайта

После любых изменений в коде:

```bash
git add .
git commit -m "Описание изменений"
git push
```

Netlify автоматически пересоберет и задеплоит сайт.

## Проверка готовности

- [ ] NFT-дескрипторы созданы (21 файл в `public/assets/nft/`)
- [ ] Код закоммичен в Git
- [ ] Репозиторий создан на GitHub
- [ ] Код запушен на GitHub
- [ ] Сайт подключен к Netlify
- [ ] Деплой успешно завершен
- [ ] HTTPS URL работает
- [ ] Камера запускается на мобильном
- [ ] Квест проходится от начала до конца
- [ ] Промокод SEVA2024AR показывается в финале

## Устранение проблем

### Build fails на Netlify

**Ошибка:** TypeScript errors

**Решение:** В `next.config.ts` уже установлено `ignoreBuildErrors: true`, но если проблема остается:

```bash
# Локально проверить билд
npm run build

# Если есть ошибки, исправить их
```

### Камера не работает на продакшене

**Причина:** Нет HTTPS

**Решение:** Netlify автоматически предоставляет HTTPS. Убедитесь что открываете сайт по `https://` (не `http://`).

### Маркеры не распознаются

**Причина:** NFT-дескрипторы не созданы или не загружены

**Решение:**
1. Проверьте что в `public/assets/nft/` есть все 21 файл
2. Проверьте что они закоммичены: `git status`
3. Если нет, добавьте: `git add public/assets/nft/ && git commit -m "Add NFT descriptors" && git push`

## Полезные команды

```bash
# Проверить статус Git
git status

# Посмотреть логи
git log --oneline

# Проверить удаленный репозиторий
git remote -v

# Открыть сайт Netlify
netlify open:site

# Посмотреть логи билда Netlify
netlify logs

# Локальный тест билда
npm run build
npm run start
```

## Контакты и поддержка

- GitHub: https://github.com/SFocus92/ar-quest-sevapark
- Netlify Dashboard: https://app.netlify.com/

---

**Готово!** Ваш AR-квест теперь доступен онлайн 🎉
