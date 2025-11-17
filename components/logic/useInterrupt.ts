import { useCallback } from "react";
import { useStreamingAvatarContext } from "./context";

export const useInterrupt = () => {
  const { avatarRef } = useStreamingAvatarContext();

  const interrupt = useCallback(() => {
    if (!avatarRef.current) return;
    try {
      // Enviar un mensaje de interrupción al WS
      avatarRef.current.send(JSON.stringify({ type: "interrupt" }));
    } catch (err) {
      console.error("Error enviando interrupt:", err);
    }
  }, [avatarRef]);

  return { interrupt };
};
