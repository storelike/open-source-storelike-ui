import useSWR from 'swr';
import defaultCms from '../locale/cms-locale.json';
import { ADMIN_ORIGIN } from './constants';

type CmsData = typeof defaultCms;

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

export function useCmsData() {
  // Determine admin mode from the URL
  const isAdminMode = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('admin') === 'true'
    : false;

  const { data, error } = useSWR<CmsData>(
    isAdminMode ? `${ADMIN_ORIGIN}/api/get-cms-data` : null,
    fetcher,
    {
      fallbackData: defaultCms,
      onError: (err: any) => console.error('Failed to load CMS data:', err),
      revalidateOnFocus: false,
    }
  );

  return data ?? defaultCms;
}