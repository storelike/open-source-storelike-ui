// cms/useCMS.ts
import { useContext } from 'react';
import { CMSContext } from './CmsPreviewContext';

export const useCmsText = () => useContext(CMSContext);
