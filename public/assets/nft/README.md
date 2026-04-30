# NFT Marker Descriptors

Эта папка содержит NFT-дескрипторы для распознавания реальных объектов.

## Как создать дескрипторы:

1. Откройте https://carnaux.github.io/NFT-Marker-Creator/
2. Загрузите оптимизированные фотографии из `public/assets/nft-sources/`
3. Для каждого marker-X.jpg создайте дескриптор
4. Скачайте 3 файла: .fset, .fset3, .iset
5. Переименуйте их правильно (например: marker-1.fset, marker-1.fset3, marker-1.iset)
6. Поместите все файлы сюда

## Структура:

```
marker-1.fset
marker-1.fset3
marker-1.iset
marker-2.fset
marker-2.fset3
marker-2.iset
...
marker-7.fset
marker-7.fset3
marker-7.iset
```

## Примечание:

Пока дескрипторы не созданы, AR-распознавание работать не будет.
Используйте tap-to-simulate для тестирования логики квеста.
