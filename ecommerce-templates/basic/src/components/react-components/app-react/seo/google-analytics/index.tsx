import React, { useEffect } from 'react';
import {cmSeo} from '../../../../../locale/cms-locale.json';


const GOOGLE_ANALYTICS_ID = cmSeo.numberGoogleMetric.value as any;

const GoogleAnalytics: React.FC = () => {
    useEffect(() => {
        if (!GOOGLE_ANALYTICS_ID||GOOGLE_ANALYTICS_ID==='0'||GOOGLE_ANALYTICS_ID===0 ) return;
        
      const scriptTag = document.createElement('script');
      scriptTag.defer = true;
      scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
      document.head.appendChild(scriptTag);
  
      const initScript = document.createElement('script');
      initScript.defer = true;
      initScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GOOGLE_ANALYTICS_ID}');
      `;
      document.head.appendChild(initScript);
    }, []);
    
    return null;
  };
  
export default GoogleAnalytics;
