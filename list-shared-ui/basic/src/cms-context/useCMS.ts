import { useContext } from 'react';
import { CMSContext } from './CmsPreviewContext';

export const useCmsText = () => {
  const cmsData = useContext(CMSContext);

  // Возвращаем сразу cmHero, а не data
  return cmsData;
};
