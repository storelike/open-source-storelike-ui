import React, { useEffect } from 'react';
import seoConfig from '../../../../../const/seo/seo-data-site.json';

const YA_METRICA_ID = seoConfig.numberYandexMetric;

const YandexAnalytics: React.FC = () => {
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
      (function (m, e, t, r, i, k, a) {
        //@ts-ignore
        m[i] =
        //@ts-ignore
          m[i] ||
          function () {
            //@ts-ignore
            (m[i].a = m[i].a || []).push(arguments);
          };
          //@ts-ignore
        m[i].l = 1 * new Date();
        //@ts-ignore
        k = e.createElement(t);
        //@ts-ignore
        a = e.getElementsByTagName(t)[0];
        //@ts-ignore
        k.async = true;
        //@ts-ignore
        k.src = r;
        //@ts-ignore
        a.parentNode.insertBefore(k, a);
      })(
        window,
        document,
        'script',
        'https://cdn.jsdelivr.net/npm/yandex-metrica-watch/tag.js',
        'ym'
      );
//@ts-ignore
      window.ym(YA_METRICA_ID, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      });

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
