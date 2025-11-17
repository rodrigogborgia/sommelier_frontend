import { useEffect, useRef } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { useVoiceChat } from "./logic/useVoiceChat";
import { useTextChat } from "./logic/useTextChat"; // 👈 nuevo hook corregido
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";

import { apiPost } from "@/app/services/api";

function InteractiveAvatar() {
  const { initAvatar, stopAvatar, sendText, sessionState, stream, sessionId } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { sendMessage } = useTextChat(); // 👈 usamos el hook de texto

  const mediaStream = useRef<HTMLVideoElement>(null);
  const tokenRef = useRef<string | null>(null);

  // Obtener token desde backend
  async function fetchAccessToken() {
    try {
      const token = await apiPost("/get-access-token", {});
      console.log("Access Token:", token);
      return token.access_token || token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  // Consultar PDFs y obtener knowledgeId
  async function fetchKnowledgeId(question: string) {
    try {
      const res = await apiPost("/query", { question });
      console.log("Query result:", res);
      if (res.ids && res.ids[0] && res.ids[0][0]) {
        return res.ids[0][0];
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching knowledgeId:", error);
      return undefined;
    }
  }

  // Iniciar sesión con saludo inicial
  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      const newToken = await fetchAccessToken();
      tokenRef.current = newToken;

      initAvatar(newToken);

      const checkSession = setInterval(async () => {
        if (sessionId && tokenRef.current) {
          clearInterval(checkSession);

          // 👋 Enviar saludo inicial
          sendMessage("¡Qué lindo es estar hoy con todos ustedes! ¿Qué les gustaría saber de Espacio Sommelier?");

          if (isVoiceChat) {
            await startVoiceChat(tokenRef.current, sessionId);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  // Manejar preguntas del usuario
  const handleUserMessage = useMemoizedFn(async (userMessage: string) => {
    if (!tokenRef.current || !sessionId) {
      console.error("No hay sesión activa");
      return;
    }

    const knowledgeId = await fetchKnowledgeId(userMessage);
    const message = knowledgeId
      ? `${userMessage} [knowledgeId:${knowledgeId}]`
      : userMessage;

    // 👈 enviar mensaje al avatar vía WebSocket
    sendMessage(message);
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
        <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center">
          {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
            <AvatarVideo ref={mediaStream} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <p className="text-xl text-gray-400">
                Listo para comenzar la asesoría con el Sommelier IA de Carnes.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 items-center justify-center p-4 border-t border-zinc-700 w-full">
          {sessionState === StreamingAvatarSessionState.CONNECTED ? (
            <AvatarControls onSendMessage={handleUserMessage} />
          ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
          <div className="flex justify-center items-center h-screen bg-black">
            <button className="text-white text-lg px-8 py-4 rounded-lg bg-[#7559FF]">
              Iniciar Chat de Voz
            </button>
          </div>
          ) : (
            <LoadingIcon />
          )}
        </div>
      </div>
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <MessageHistory />
      )}
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_API_BASE_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
