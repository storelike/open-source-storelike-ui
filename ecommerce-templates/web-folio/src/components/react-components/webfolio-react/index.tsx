// ====================================================================
// ФАЙЛ: src/components/react-components/webfolio-react/WebFolioReact.tsx
// ====================================================================
import React, { useEffect, useState, useMemo, useCallback } from "react";
import useSWR from "swr";
// ПРЕДПОЛАГАЕМЫЕ ИМПОРТЫ
import { useCmsData } from "cms-get-data/useCmsData"; 
import { decryptYandexToken } from "./decryptYandexToken"; 

// ------------------------------------------------------------------
// === UTILITY: Спинер Tailwind CSS ===
// ------------------------------------------------------------------
const Spinner: React.FC<{ size?: string, color?: string }> = ({ size = 'h-8 w-8', color = 'border-gray-900' }) => (
    <div className="flex justify-center items-center h-full">
        <div className={`animate-spin rounded-full ${size} border-b-2 ${color}`}></div>
    </div>
);
// ---

const YANDEX_API = "https://cloud-api.yandex.net/v1/disk/resources";
const PROXY_API_URL = "/api/yandex-disk"; 

// ------------------------------------------------------------------
// === UTILITY: Создание URL для прокси ===
// ------------------------------------------------------------------
interface ProxyUrlOptions {
    path: string;
    enc: any; 
    mode?: 'file' | 'list';
}

const buildProxyUrl = ({ path, enc, mode = 'file' }: ProxyUrlOptions) => {
    let cleanedPath = path.startsWith('disk:') ? path.substring(5) : path; 
    if (cleanedPath && !cleanedPath.startsWith('/')) {
        cleanedPath = '/' + cleanedPath;
    }
    
    const encStr = typeof enc === 'string' ? enc : JSON.stringify(enc); 
    
    return `${PROXY_API_URL}?path=${encodeURIComponent(cleanedPath)}&enc=${encodeURIComponent(encStr)}&mode=${mode}`;
};

// ------------------------------------------------------------------
// === 1. Фетчер для метаданных (СПИСОК АЛЬБОМОВ) - ПРЯМОЙ Yandex API ===
const fetchAlbums = async (url: string, token: string) => {
    if (!token) return null;
    const fullUrl = `${url}&fields=_embedded.items.name,_embedded.items.file,_embedded.items.type,_embedded.items.path`;
    const res = await fetch(fullUrl, { headers: { Authorization: `OAuth ${token}` } });
    
    if (!res.ok) {
        throw new Error(`Ошибка ${res.status}: ${res.statusText}. Проверьте токен или путь /webfolioStorelike.`);
    }
    return res.json();
};

// ------------------------------------------------------------------
// === 2. Фетчер для метаданных первого изображения (для AlbumCard) - ПРЯМОЙ Yandex API ===
const fetchFirstFileMeta = async ([url, token]: [string, string]): Promise<any> => {
    if (!token) return null;
    // Запрашиваем только путь, т.к. будем использовать прокси
    const metaRes = await fetch(url + `&fields=_embedded.items.path,_embedded.items.name,_embedded.items.type`, 
        { headers: { Authorization: `OAuth ${token}` } }
    );
    
    if (!metaRes.ok) return null; 
    
    const metaData = await metaRes.json();
    const allFilesAndFolders = metaData?._embedded?.items || [];
    
    const firstImageFile = allFilesAndFolders.find((i: any) => 
        i.type === "file" && /\.(jpe?g|png|gif|webp|svg)$/i.test(i.name)
    );
    
    // ✅ Возвращаем только путь.
    return firstImageFile ? firstImageFile.path : null; 
};

// ------------------------------------------------------------------
// === 3. Основной компонент WebFolioReact ===
// ------------------------------------------------------------------
const WebFolioReact: React.FC = () => {
    const { cmWebfolio } = useCmsData(); 
    const [token, setToken] = useState<string | null>(null);
    const [encryptedToken, setEncryptedToken] = useState<any>(null); 
    const [decryptError, setDecryptError] = useState<string | null>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

    // Расшифровка токена
    useEffect(() => {
        if (typeof window === "undefined") return;
        const enc = cmWebfolio?.key_yandex_disk?.value;
        if (!enc) return;
        
        setEncryptedToken(enc); 
        
        (async () => {
            try {
                const dec = await decryptYandexToken(enc);       
                setToken(dec.trim());
            } catch (err: any) {
                setDecryptError(err?.message || "Неизвестная ошибка расшифровки");
            }
        })();
    }, [cmWebfolio?.key_yandex_disk?.value]);

    // Загрузка альбомов
    const { data, error, isLoading, mutate } = useSWR(
        token ? [`${YANDEX_API}?path=/webfolioStorelike&limit=100`, token] : null,
        ([url, tk]) => fetchAlbums(url, tk)
    );
    
    // Рендеринг состояний
    if (!token || !encryptedToken || decryptError) {
        return (
            <div className="text-center mt-10">
                {decryptError ? (
                    <p className="text-red-600">Ошибка расшифровки: {decryptError}</p>
                ) : (
                    // ✅ СПИНЕР: Авторизация
                    <Spinner size="h-10 w-10" color="border-blue-600" /> 
                )}
            </div>
        );
    }
    
    if (error)
        return (
            <div className="text-center mt-10">
               <p className="text-red-600 mb-3">Ошибка загрузки альбомов: {error.message}</p>
               <button onClick={() => mutate()} className="btn">Повторить попытку</button>
            </div>
        );

    if (isLoading)
        // ✅ СПИНЕР: Загрузка альбомов
        return <div className="text-center mt-10"><Spinner size="h-10 w-10" color="border-gray-600" /></div>;

    if (selectedAlbum) {
        return (
             <AlbumView
                 albumPath={selectedAlbum}
                 onBack={() => setSelectedAlbum(null)}
                 encryptedToken={encryptedToken} 
             />
        );
    }

    const albums = data?._embedded?.items?.filter((i: any) => i.type === "dir") || [];

    return (
        <div className="mt-22 mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {albums.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500 mt-10">Нет доступных альбомов.</p>
                ) : (
                    albums.map((album: any) => (
                        <AlbumCard
                            key={album.path}
                            album={album}
                            onOpen={() => setSelectedAlbum(album.path)}
                            token={token} 
                            encryptedToken={encryptedToken} 
                        />
                    ))
                )}
             </div>
        </div>
    );
};

// ------------------------------------------------------------------
// === 4. Компонент Карточки Альбома (AlbumCard) ===
// ------------------------------------------------------------------
const AlbumCard: React.FC<{
    album: any;
    onOpen: () => void;
    token: string;
    encryptedToken: any;
}> = ({ album, onOpen, token, encryptedToken }) => {
    
    const swrKey = token
        ? [`${YANDEX_API}?path=${encodeURIComponent(album.path)}&limit=10`, token]
        : null;
        
    // ✅ Получаем только путь файла
    const { data: imagePath, isLoading } = useSWR(swrKey, fetchFirstFileMeta, { 
        revalidateOnFocus: false, 
    });
    
    const [imgError, setImgError] = useState(false); 
    
    // ✅ ИСПРАВЛЕНИЕ: Всегда используем PROXY для загрузки миниатюр!
    const imageUrl = useMemo(() => {
        if (!imagePath || !encryptedToken) return '';
        
        // Используем PROXY, который закэширует и вернет миниатюру. 
        // Если бы мы хотели маленькую миниатюру, мы бы модифицировали PROXY,
        // но для AlbumCard достаточно использовать PROXY с 'mode: file' 
        // (он будет закэширован).
        return buildProxyUrl({ path: imagePath, enc: encryptedToken, mode: 'file' }); 
    }, [imagePath, encryptedToken]);

    const showPlaceholder = isLoading || !imageUrl || imgError;

    return (
        <div 
            onClick={onOpen} 
            className="album-card cursor-pointer border rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:shadow-xl"
            onContextMenu={(e) => e.preventDefault()} // ✅ ЗАЩИТА: Отключаем контекстное меню
            onDragStart={(e) => e.preventDefault()} // ✅ ЗАЩИТА: Отключаем перетаскивание
        >
            <div className="relative bg-gray-200 h-48 flex items-center justify-center">
                {showPlaceholder ? (
                    imgError ? (
                        <span className="text-red-500">❌ Ошибка загрузки</span>
                    ) : (
                        // ✅ СПИНЕР: Загрузка превью
                        <Spinner size="h-6 w-6" color="border-gray-500" /> 
                    )
                ) : (
                    <img
                        src={imageUrl} 
                        alt={album.name}
                        className="w-full h-48 object-cover transition-opacity duration-500 opacity-100"
                        onContextMenu={(e) => e.preventDefault()} // ✅ Защита
                        onDragStart={(e) => e.preventDefault()} // ✅ Защита
                        onError={() => {
                            // Если прокси не сработал (редко, но бывает)
                            setImgError(true); 
                        }}
                    />
                )}
            </div>
            <div className="p-4 text-center">
                <h4 className="font-semibold">{album.name}</h4>
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// === 5. Компонент AlbumView ===
// ------------------------------------------------------------------
interface AlbumViewProps {
    albumPath: string;
    onBack: () => void;
    encryptedToken: any; 
}

const AlbumView: React.FC<AlbumViewProps> = ({ albumPath, onBack, encryptedToken }) => {
    
    const listFetcher = useCallback(async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Proxy List Error: ${res.status}: ${errText.slice(0, 100)}`);
        }
        return res.json();
    }, []);

    // 💡 Примечание: Серверный 'list' mode все равно остается полезным,
    // так как он быстро возвращает пути файлов для альбома.
    const swrKey = useMemo(() => encryptedToken 
        ? buildProxyUrl({ path: albumPath, enc: encryptedToken, mode: 'list' }) 
        : null, [albumPath, encryptedToken]);

    const { data, error, isLoading } = useSWR(swrKey, listFetcher, {
        revalidateOnFocus: false,
    });
    
    if (error)
        return <p className="text-center mt-10 text-red-600">Ошибка загрузки фото: {error.message}</p>;
    
    // ✅ СПИНЕР: Загрузка фото в альбоме
    if (isLoading)
        return <div className="text-center mt-10"><Spinner size="h-10 w-10" color="border-gray-600" /></div>;


    const photos = data?.files?.filter((i: any) => /\.(jpe?g|png|gif|webp|svg)$/i.test(i.name)) || [];
    const albumName = data?.name || albumPath.split('/').pop();

    return (
        <div className="p-4 sm:p-6">
             <button onClick={onBack} className="btn-back">← Назад к альбомам</button>
            <h2 className="text-2xl font-bold mb-6 mt-4">Альбом: {albumName}</h2>
             
            {photos.length === 0 ? (
                 <p className="text-center text-gray-500 mt-10">Нет фотографий в этом альбоме</p>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
                     {photos.map((photo: any) => {
                           // Используем PROXY для основного изображения (кэширование, защита, обход 403)
                         const src = buildProxyUrl({ path: photo.path, enc: encryptedToken, mode: 'file' }); 
                         return (
                             <div 
                                key={photo.path} 
                                className="photo-item relative overflow-hidden rounded-lg shadow-md"
                                onContextMenu={(e) => e.preventDefault()} // ✅ ЗАЩИТА
                                onDragStart={(e) => e.preventDefault()} // ✅ ЗАЩИТА
                            >
                                 <img
                                     src={src} 
                                     alt={photo.name}
                                     loading="lazy"
                                     className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.05]"
                                    onContextMenu={(e) => e.preventDefault()} // ✅ ЗАЩИТА
                                    onDragStart={(e) => e.preventDefault()} // ✅ ЗАЩИТА
                                     onError={(e) => {
                                          console.error(`❌ IMG FAIL in AlbumView: ${photo.name}.`);
                                          (e.currentTarget as HTMLImageElement).src = ''; 
                                     }}
                                 />
                             </div>
                         );
                     })}
                 </div>
            )}
        </div>
    );
};


export default WebFolioReact;