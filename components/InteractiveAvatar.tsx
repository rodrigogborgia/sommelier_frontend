import { useEffect, useRef } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { useVoiceChat } from "./logic/useVoiceChat";
import { useTextChat } from "./logic/useTextChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";

import { apiPost } from "@/app/services/api";

function InteractiveAvatar() {
  const { initAvatar, stopAvatar, sendText, sessionState, stream, sessionId } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { sendMessage } = useTextChat();

  const mediaStream = useRef<HTMLVideoElement>(null);
  const tokenRef = useRef<string | null>(null);

  async function fetchAccessToken() {
    try {
      const token = await apiPost("/get-access-token", {});
      return token.access_token || token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  async function fetchKnowledgeId(question: string) {
    try {
      const res = await apiPost("/query", { question });
      if (res.ids && res.ids[0] && res.ids[0][0]) {
        return res.ids[0][0];
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching knowledgeId:", error);
      return undefined;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      const newToken = await fetchAccessToken();
      tokenRef.current = newToken;

      initAvatar(newToken);

      const checkSession = setInterval(async () => {
        if (sessionId && tokenRef.current) {
          clearInterval(checkSession);

          sendMessage(
            "¡Qué lindo es estar hoy con todos ustedes! ¿Qué les gustaría saber de Espacio Sommelier?"
          );

          if (isVoiceChat) {
            await startVoiceChat(tokenRef.current, sessionId);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  const handleUserMessage = useMemoizedFn(async (userMessage: string) => {
    if (!tokenRef.current || !sessionId) {
      console.error("No hay sesión activa");
      return;
    }

    const knowledgeId = await fetchKnowledgeId(userMessage);
    const message = knowledgeId
      ? `${userMessage} [knowledgeId:${knowledgeId}]`
      : userMessage;

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
            <button
              className="bg-transparent text-white text-lg px-6 py-2 rounded-lg border border-white hover:bg-[#7559FF] transition-colors"
              onClick={() => startSessionV2(true)}
            >
              Iniciar Chat de Voz
            </button>
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
