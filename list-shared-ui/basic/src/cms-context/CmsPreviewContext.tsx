import React, { createContext, useEffect, useState } from 'react';
import defaultCms from '../locale/cms-locale.json';
import { ADMIN_ORIGIN } from './constants';

export const CMSContext = createContext(defaultCms);

export const CMSProvider = ({ children }: { children: React.ReactNode }) => {
  const [cmsData, setCmsData] = useState(defaultCms);
  const [ready, setReady] = useState(false);

  // console.log("DAT contex====",cmsData.cmHero)
  useEffect(() => {
    const previewToken = 'jhdfjkfjk3g789g';
    const isPreview = new URLSearchParams(window.location.search).get('preview') === previewToken;

    // if (!isPreview) return;

    const handleMessage = (event: MessageEvent) => {
      const { origin, data: msg } = event;
      console.log("data=== msg  ",msg)

      if (origin !== ADMIN_ORIGIN) return;


      if (msg?.type === 'updateData') {
        setCmsData(prev => ({
          ...(prev || {}),
          ...(msg.data || {}),
        }));
        setReady(true);
      }
    };

    window.addEventListener('message', handleMessage);

    // ✅ Сообщаем родителю, что iframe готов
    window.parent.postMessage({ type: 'previewReady' }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <CMSContext.Provider value={cmsData}>
      {children}
    </CMSContext.Provider>
  );
};
