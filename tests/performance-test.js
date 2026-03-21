// tests/performance-test.js
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

/**
 * Run Lighthouse audit on a URL
 * @param {string} url URL to audit
 * @param {string} mode 'desktop' or 'mobile'
 */
async function runLighthouse(url, mode = 'mobile') {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
    formFactor: mode,
    screenEmulation:
      mode === 'mobile'
        ? { mobile: true, width: 360, height: 640 }
        : { mobile: false, width: 1350, height: 940 },
  };

  const runnerResult = await lighthouse(url, options);

  await chrome.kill();

  const score = runnerResult.lhr.categories.performance.score * 100;
  console.log(`✅ ${mode} test for ${url} completed. Score: ${score.toFixed(0)}`);

  if (score < 100) {
    console.error(`🚨 Test failed: ${mode} performance score is below 100.`);
    console.error('See Lighthouse report for details.');
    process.exit(1);
  }
}

// Replace with your local server URL after running "npm run build" and "npm run preview"
const BASE_URL = 'http://localhost:4321'; // Default Astro dev/preview port

(async () => {
  try {
    console.log('--- Running performance tests ---');
    await runLighthouse(BASE_URL + '/ecommerce-templates/basic/', 'mobile');
    await runLighthouse(BASE_URL + '/ecommerce-templates/basic/', 'desktop');
    console.log('--- All performance tests passed! (100%) ---');
  } catch (e) {
    console.error('Performance test failed:', e.message);
    process.exit(1);
  }
})();
