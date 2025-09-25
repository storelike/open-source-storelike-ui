import React, { useEffect } from 'react';
import {cmSeo} from '../../../../../locale/cms-locale.json';
const YA_METRICA_ID = cmSeo.numberYandexMetric.value;

const YandexAnalytics: React.FC = () => {

  if (window.self !== window.top) {
  console.warn('Skipping Yandex.Metrika in iframe to avoid SecurityError');
  return;
} 
  useEffect(() => {
    if (!YA_METRICA_ID || YA_METRICA_ID === 0) return;

    let loadedMetrica = false;
    let timerId: NodeJS.Timeout | null = null;

    const loadMetrica = (e?: Event) => {
      if (loadedMetrica) return;

      if (e && e.type) {
        console.log(`Event triggered: ${e.type}`);
      } else {
        console.log('Fallback: DOMContentLoaded');
      }

      // Подключение Яндекс.Метрики
     try {
  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = true;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://cdn.jsdelivr.net/npm/yandex-metrica-watch/tag.js', 'ym');
} catch (err) {
  console.error('Failed to inject Yandex.Metrika script', err);
}
//@ts-ignore
      

      try {
  window.ym(YA_METRICA_ID, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      });
} catch (err) {
  console.error('Yandex.Metrika init failed', err);
}

      loadedMetrica = true;

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
