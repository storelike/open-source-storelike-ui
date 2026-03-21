// src/components/react-components/app-react/seo/yandex-analytics/index.tsx
import { useEffect } from 'react';
import { cmSeo } from '../../../../../locale/cms-locale.json';

const YA_METRICA_ID = cmSeo.numberYandexMetric.value;

declare global {
  interface Window {
    ym?: (...args: any[]) => void;
  }
}

const YandexAnalytics: React.FC = () => {
  useEffect(() => {
    if (!YA_METRICA_ID || YA_METRICA_ID === 0) return;
    if (window.self !== window.top) {
      console.warn('Skipping Yandex.Metrika in iframe to avoid SecurityError');
      return;
    }

    let loaded = false;
    let timerId: NodeJS.Timeout | null = null;

    const insertScript = () => {
      try {
        const k = document.createElement('script');
        const a = document.getElementsByTagName('script')[0];
        if (a?.parentNode) {
          k.async = true;
          k.src = 'https://cdn.jsdelivr.net/npm/yandex-metrica-watch/tag.js';
          a.parentNode.insertBefore(k, a);
        }
      } catch (err) {
        console.error('Failed to inject Yandex.Metrika script', err);
      }
    };

    const initMetrica = () => {
      try {
        window.ym?.(YA_METRICA_ID, 'init', {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true,
        });
      } catch (err) {
        console.error('Yandex.Metrika init failed', err);
      }
    };

    const loadMetrica = (e?: Event) => {
      if (loaded) return;
      if (e?.type) console.log(`Event triggered: ${e.type}`);
      else console.log('Fallback: DOMContentLoaded');

      insertScript();
      initMetrica();
      loaded = true;

      if (timerId) clearTimeout(timerId);
      removeEventListeners();
    };

    const removeEventListeners = () => {
      window.removeEventListener('scroll', loadMetrica);
      window.removeEventListener('touchstart', loadMetrica);
      document.removeEventListener('mouseenter', loadMetrica);
      document.removeEventListener('click', loadMetrica);
      document.removeEventListener('DOMContentLoaded', loadFallback);
    };

    const loadFallback = () => {
      timerId = setTimeout(loadMetrica, 1000);
    };

    if (navigator.userAgent.includes('YandexMetrika')) {
      loadMetrica();
    } else {
      window.addEventListener('scroll', loadMetrica, { passive: true });
      window.addEventListener('touchstart', loadMetrica, { passive: true });
      document.addEventListener('mouseenter', loadMetrica);
      document.addEventListener('click', loadMetrica);
      document.addEventListener('DOMContentLoaded', loadFallback);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
      removeEventListeners();
    };
  }, []);

  return null;
};

export default YandexAnalytics;