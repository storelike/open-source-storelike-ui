// ВАЖНО: После тестирования этот файл необходимо удалить или защитить
import type { APIRoute } from "astro";
import { decryptYandexToken } from "../../components/react-components/webfolio-react/decryptYandexToken"; 

const YDISK_API = "https://cloud-api.yandex.net/v1/disk";

export const GET: APIRoute = async ({ url }) => {
    const encRaw = url.searchParams.get("enc"); 
    
    if (!encRaw) {
        return new Response("Отсутствует параметр ?enc", { status: 400 });
    }

    let token: string;
    
    // 1. Расшифровка токена
    try {
        const decryptedResult = await decryptYandexToken(encRaw); 
        token = decryptedResult.trim();
        if (!token) throw new Error("Пустой токен после расшифровки.");
    } catch (e: any) {
        return new Response(`Ошибка расшифровки: ${e.message}`, { status: 500 });
    }

    // 2. Запрос к базовому эндпоинту Яндекс.Диска
    // Этот эндпоинт возвращает информацию о диске, включая список прав (scopes).
    const checkUrl = `${YDISK_API}/`; 
    
    const res = await fetch(checkUrl, {
        headers: {
            Authorization: `OAuth ${token}`,
        },
    });

    if (!res.ok) {
        const errorDetails = await res.text();
        return new Response(`Ошибка Яндекса (${res.status}): ${errorDetails}`, { status: res.status });
    }
    
    const data = await res.json();
    
    // 3. Возвращаем права
    return new Response(JSON.stringify({
        status: "OK",
        displayName: data.user.display_name,
        // !!! КЛЮЧЕВОЙ МОМЕНТ: Scopes !!!
        scopes: data.system_folders.applications.path.includes("app:") ? 
                "Не удалось определить точный список, но есть доступ к папке приложения." : 
                "Проверьте настройки OAuth приложения!",
        // Точный список прав можно получить только через /v1/user/info, но этот эндпоинт
        // подтверждает, что токен ДЕЙСТВИТЕЛЕН и имеет доступ к API.
    }, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
};