import type { APIRoute } from "astro";
import localeTextSite from "@locale/locale_text_site.json";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          message: localeTextSite.pages.api.feedback.requiredFieldsMsg,
        }),
        { status: 400 }
      );
    }

    // Обработка данных формы (например, отправка письма или сохранение в базе данных)

    return new Response(
      JSON.stringify({
        message: localeTextSite.pages.api.feedback.successMsgSend,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: localeTextSite.pages.api.feedback.errorMsgSend,
      }),
      { status: 500 }
    );
  }
};
