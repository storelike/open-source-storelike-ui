import fs from 'fs';
import path from 'path';

// Загружаем данные из seo-data-site.json с использованием ESM
const seoData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/const/seo/seo-data-site.json'), 'utf8'));


// Формируем строку Content-Security-Policy с использованием siteHTTPS
const contentSecurityPolicy = `frame-ancestors 'self' ${seoData.siteHTTPS} https://metrika.yandex.ru https://metrika.yandex.by https://metrica.yandex.com https://metrica.yandex.com.tr https://webvisor.com`;

// Создаем содержимое vercel.json
const vercelConfig = {
  headers: [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: contentSecurityPolicy,
        },
        {
          key: "Cache-Control",
          value: "public, max-age=3600, must-revalidate", // Браузерное кэширование на 1 час
        },
        {
          key: "Vercel-CDN-Cache-Control",
          value: "public, s-maxage=86400", // Кэширование на Vercel CDN на 1 день
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload", // Для улучшения безопасности
        },
      ],
    },
  ],
};

// Записываем файл vercel.json в корень проекта
fs.writeFileSync(
  path.join(process.cwd(), 'vercel.json'),
  JSON.stringify(vercelConfig, null, 2) // Красиво форматируем JSON
);

console.log('Файл vercel.json успешно сгенерирован!');
