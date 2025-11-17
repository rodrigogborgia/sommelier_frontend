import { useCallback } from "react";
import { useStreamingAvatarContext } from "./context";

export const useConversationState = () => {
  const { avatarRef, setIsListening } = useStreamingAvatarContext();

  // Iniciar escucha (si HeyGen lo soporta vía mensaje WS)
  const startListening = useCallback(() => {
    if (!avatarRef.current) return;
    try {
      avatarRef.current.send(JSON.stringify({ type: "start_listening" }));
      setIsListening(true);
    } catch (err) {
      console.error("Error enviando start_listening:", err);
    }
  }, [avatarRef, setIsListening]);

  // Detener escucha
  const stopListening = useCallback(() => {
    if (!avatarRef.current) return;
    try {
      avatarRef.current.send(JSON.stringify({ type: "stop_listening" }));
      setIsListening(false);
    } catch (err) {
      console.error("Error enviando stop_listening:", err);
    }
  }, [avatarRef, setIsListening]);

  return { startListening, stopListening };
};
