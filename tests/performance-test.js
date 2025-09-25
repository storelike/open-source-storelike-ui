// tests/performance-test.js
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

/**
 * Проверяет URL с использованием Lighthouse
 * @param {string} url URL для проверки
 * @param {string} mode 'desktop' или 'mobile'
 */
async function runLighthouse(url, mode = 'mobile') {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
    formFactor: mode, // Используем mode для проверки
    screenEmulation: (mode === 'mobile') ? { mobile: true, width: 360, height: 640 } : { mobile: false, width: 1350, height: 940 },
  };

  const runnerResult = await lighthouse(url, options);

  await chrome.kill();

  const score = runnerResult.lhr.categories.performance.score * 100;
  console.log(`✅ Тест ${mode} для ${url} завершен. Оценка: ${score.toFixed(0)}`);
  
  if (score < 100) {
    console.error(`🚨 Сбой теста: Оценка производительности ${mode} ниже 100.`);
    console.error('Подробный отчет можно найти в результатах Lighthouse.');
    process.exit(1);
  }
}

// Замените на URL вашего локального сервера, запущенного на этапе "npm run build" и "npm run start"
const BASE_URL = 'http://localhost:4321'; // Стандартный порт Astro dev/preview

(async () => {
  try {
    console.log('--- Запуск тестов производительности ---');
    await runLighthouse(BASE_URL + '/ecommerce-templates/basic/', 'mobile');
    await runLighthouse(BASE_URL + '/ecommerce-templates/basic/', 'desktop');
    console.log('--- Все тесты производительности успешно пройдены! (100%) ---');
  } catch (e) {
    console.error('Тест производительности не удался:', e.message);
    process.exit(1);
  }
})();