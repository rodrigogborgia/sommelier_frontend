import { useCallback, useState } from "react";

export const useVoiceChat = () => {
  const [isVoiceChatLoading, setIsVoiceChatLoading] = useState(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);

  // 🔹 Helper para pedir knowledgeId al backend
  const fetchKnowledgeId = async (userMessage: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      });
      const data = await response.json();
      return data.knowledgeId || null;
    } catch (error) {
      console.error("Error fetching knowledgeId:", error);
      return null;
    }
  };

  // 🔹 Iniciar chat de voz
  const startVoiceChat = useCallback(async (token: string, sessionId: string) => {
    try {
      setIsVoiceChatLoading(true);
      await fetch("https://api.heygen.com/v1/streaming.push_to_talk_start", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      setIsVoiceChatActive(true);
    } catch (error) {
      console.error("Error starting voice chat:", error);
    } finally {
      setIsVoiceChatLoading(false);
    }
  }, []);

  // 🔹 Detener chat de voz
  const stopVoiceChat = useCallback(async (token: string, sessionId: string) => {
    try {
      setIsVoiceChatLoading(true);
      await fetch("https://api.heygen.com/v1/streaming.push_to_talk_stop", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      setIsVoiceChatActive(false);
    } catch (error) {
      console.error("Error stopping voice chat:", error);
    } finally {
      setIsVoiceChatLoading(false);
    }
  }, []);

  // 🔹 Enviar mensaje de voz con knowledgeId
  const sendVoiceMessage = useCallback(
    async (token: string, sessionId: string, userMessage: string) => {
      try {
        // 1. Pedir knowledgeId al backend
        const knowledgeId = await fetchKnowledgeId(userMessage);

        // 2. Enviar mensaje al avatar con knowledgeId
        await fetch("https://api.heygen.com/v1/streaming.send_message", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            text: userMessage,
            knowledgeId, // adjuntamos el ID si existe
          }),
        });
      } catch (error) {
        console.error("Error sending voice message:", error);
      }
    },
    []
  );

  return {
    startVoiceChat,
    stopVoiceChat,
    sendVoiceMessage,
    isVoiceChatLoading,
    isVoiceChatActive,
  };
};
