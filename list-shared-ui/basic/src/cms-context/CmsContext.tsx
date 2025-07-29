import React, { createContext, useContext, useEffect, useState } from 'react';
import initialCmsData from '../locale/cms-locale.json';

type CmsContextType = {
  data: Record<string, any>;
  reload: () => void;
};

const CmsContext = createContext<CmsContextType>({
  data: {},
  reload: () => {},
});

export const CmsProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState(() => {
    // При первой загрузке пробуем из sessionStorage
    const cached = sessionStorage.getItem('cms_locsle');
    return cached ? JSON.parse(cached) : initialCmsData;
  });

  useEffect(() => {
    // Сохраняем данные в sessionStorage
    sessionStorage.setItem('cms_locsle', JSON.stringify(data));
  }, [data]);

  const reload = () => {
    // Возможность принудительной перезагрузки
    setData(initialCmsData);
    sessionStorage.setItem('cms_locsle', JSON.stringify(initialCmsData));
  };

  return (
    <CmsContext.Provider value={{ data, reload }}>
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => useContext(CmsContext);
