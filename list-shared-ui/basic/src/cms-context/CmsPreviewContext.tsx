import React, { createContext, useState, useEffect } from 'react';
import defaultCms from '../locale/cms-locale.json';
import { ADMIN_ORIGIN } from './constants';

export const CMSContext = createContext(defaultCms);

export const CMSProvider = ({ children }: { children: React.ReactNode }) => {
  const [cmsData, setCmsData] = useState(defaultCms);
  // console.warn('✅  CMS data with:', cmsData);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const previewToken = params.get('preview');
    const validPreviewToken = 'jhdfjkfjk3g789g';

    // console.log('✅ previewToken:', previewToken);

    if (previewToken !== validPreviewToken) {
      console.warn('❌ Invalid preview token');
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const { origin, data: msg } = event;

      if (origin !== ADMIN_ORIGIN) {
        console.warn(`❌ Invalid origin: ${origin}`);
        return;
      }

      if (msg?.type === 'updateDataCMS' && msg.data) {
        console.log('✅ Updating CMS data with:', msg.data);
        setCmsData((prevData) => {
    
          return {
            ...prevData,
            ...msg.data,
          
          };
        });
      }
    };

    window.addEventListener('message', handleMessage);

    window.parent.postMessage({ type: 'previewReady' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <CMSContext.Provider value={cmsData}>
      {children}
    </CMSContext.Provider>
  );
};
