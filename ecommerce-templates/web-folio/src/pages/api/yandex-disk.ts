// src/pages/api/yandex-disk.ts
import type { APIRoute } from "astro";
import { decryptYandexTokenServer } from "../../utils/decryptYandexTokenServer"; 

const YDISK_API = "https://cloud-api.yandex.net/v1/disk";

export const GET: APIRoute = async ({ url }) => {
    const path = url.searchParams.get("path");
    const encRaw = url.searchParams.get("enc"); 
    const mode = url.searchParams.get("mode") || "file"; 
    
    if (!path || !encRaw) {
        return new Response("Отсутствует параметр ?path или ?enc", { status: 400 });
    }

    let token: string;
    
    // 1. РАСШИФРОВКА ТОКЕНА (Используем рабочий серверный дешифратор)
    try {
        token = (await decryptYandexTokenServer(encRaw)).trim();
        if (!token) throw new Error("Пустой токен после расшифровки.");
    } catch (decryptionError: any) {
        console.error(`[Yandex Proxy ERROR 401] Ошибка расшифровки: ${decryptionError.message}`);
        return new Response("Ошибка авторизации: Не удалось расшифровать токен.", { status: 401 });
    }

    const authHeaders = { Authorization: `OAuth ${token}` };

// ------------------------------------------------------------------
// --- РЕЖИМ FILE: ПРОКСИРОВАНИЕ ОРИГИНАЛЬНОГО ФАЙЛА ---
// ------------------------------------------------------------------
    if (mode === "file") {
        const dlUrl = `${YDISK_API}/resources/download?path=${encodeURIComponent(path)}`;
        const dlRes = await fetch(dlUrl, { headers: authHeaders });

        if (!dlRes.ok) {
            // ... (обработка ошибок Яндекс.Диска)
            return new Response(`Ошибка Яндекс.Диск (${dlRes.status}): ${dlRes.statusText}`, { status: dlRes.status });
        }
        
        const { href } = await dlRes.json();
        const fileRes = await fetch(href); 
        
        if (!fileRes.ok) {
            return new Response(`Ошибка проксирования: ${fileRes.statusText}`, { status: fileRes.status });
        }
        
        const type = fileRes.headers.get("content-type") || "image/jpeg";

        return new Response(fileRes.body, {
            headers: {
                "Content-Type": type,
                // ✅ КЭШИРОВАНИЕ: Год для проксированного контента.
                "Cache-Control": "public, max-age=31536000, immutable", 
            },
        });
    }

// ------------------------------------------------------------------
// --- РЕЖИМ LIST: ПОЛУЧЕНИЕ МЕТАДАННЫХ (включая previewUrl) ---
// ------------------------------------------------------------------
    if (mode === "list") {
        // Запрашиваем поля для получения URL превью (preview, sizes)
        const fields = '_embedded.items.name,_embedded.items.path,_embedded.items.type,_embedded.items.preview,_embedded.items.sizes,_embedded.items.file';
        const listUrl = `${YDISK_API}/resources?path=${encodeURIComponent(path)}&limit=200&fields=${fields}`;
        
        const listRes = await fetch(listUrl, { headers: authHeaders });
        
        if (!listRes.ok) {
            const status = listRes.status;
            return new Response(`Ошибка получения списка файлов (${status})`, { status });
        }
        
        const json = await listRes.json();
        const files = (json?._embedded?.items?.filter((i: any) => i.type === "file") || []);

        return new Response(JSON.stringify({
            files: files.map((f: any) => ({ 
                name: f.name, 
                path: f.path,
                // ✅ ВОЗВРАЩАЕМ ПРЯМУЮ ССЫЛКУ для AlbumView
                previewUrl: f.preview || f.sizes?.find((s: any) => s.name === "M")?.url // Выбираем средний размер для лучшего качества/скорости
            })),
            name: json.name
        }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response("Неизвестный режим.", { status: 400 });
};