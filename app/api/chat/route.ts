// /app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiPost } from "@/app/services/api"; // 👈 usamos el servicio centralizado

export async function POST(req: NextRequest) {
  try {
    // 1. Obtener la pregunta del usuario ('message') que viene del Front-end de HeyGen.
    const { message } = await req.json();

    console.log(`[PROXY] Enviando pregunta al backend vía API_BASE_URL`);

    // 2. Llamada al backend Flask (RAG) usando el servicio apiPost
    const data = await apiPost("/ask", { question: message });

    // 3. Devolver la respuesta a HeyGen. HeyGen usará este texto para hacer hablar al avatar.
    return NextResponse.json({
      response: data.answer, // 'data.answer' contiene la respuesta final de GPT/RAG
    });
  } catch (error: any) {
    console.error("[PROXY] Error al procesar el chat:", error);
    return NextResponse.json(
      {
        error:
          "Hubo un problema al conectar con el servidor experto en carnes.",
      },
      { status: 500 }
    );
  }
}
