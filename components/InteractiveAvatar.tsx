import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";

import { AVATARS } from "@/app/lib/constants";
import { apiPost } from "@/app/services/api"; // 👈 usamos el servicio centralizado

// CONFIGURACIÓN PREDETERMINADA
const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: AVATARS[0].avatar_id,
  knowledgeId: undefined,
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.SERIOUS,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "es-AR",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();

  const [config] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const mediaStream = useRef<HTMLVideoElement>(null);

  // FUNCIÓN PARA OBTENER EL TOKEN DESDE TU BACKEND
  async function fetchAccessToken() {
    try {
      const token = await apiPost("/get-access-token", {}); // 👈 ahora usa el servicio
      console.log("Access Token:", token);
      return token.access_token || token; // según cómo lo devuelva tu backend
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      // --- LISTENERS DE EVENTOS ---
      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) =>
        console.log("Avatar started talking", e)
      );
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) =>
        console.log("Avatar stopped talking", e)
      );
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () =>
        console.log("Stream disconnected")
      );
      avatar.on(StreamingEvents.STREAM_READY, (event) =>
        console.log(">>>>> Stream ready:", event.detail)
      );
      avatar.on(StreamingEvents.USER_START, (event) =>
        console.log(">>>>> User started talking:", event)
      );
      avatar.on(StreamingEvents.USER_STOP, (event) =>
        console.log(">>>>> User stopped talking:", event)
      );
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) =>
        console.log(">>>>> User end message:", event)
      );
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) =>
        console.log(">>>>> User talking message:", event)
      );
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) =>
        console.log(">>>>> Avatar talking message:", event)
      );
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) =>
        console.log(">>>>> Avatar end message:", event)
      );
      // --- FIN LISTENERS ---

      await startAvatar(config);

      if (isVoiceChat) {
        await startVoiceChat();
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
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
            <AvatarControls />
          ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
            <div className="flex flex-row gap-4">
              <Button onClick={() => startSessionV2(true)}>
                Iniciar Chat de Voz
              </Button>
              <Button onClick={() => startSessionV2(false)}>
                Iniciar Chat de Texto
              </Button>
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
