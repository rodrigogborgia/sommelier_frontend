"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiGet } from "./services/api"; // importa tu servicio

export default function App() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await apiGet("/healthcheck"); // endpoint de prueba en tu backend
        setStatus("Backend OK: " + JSON.stringify(res));
      } catch (err: any) {
        setStatus("Error: " + err.message);
      }
    }
    checkBackend();
  }, []);

  return (
    <div className="w-screen flex flex-col bg-zinc-900 overflow-y-auto">
      <div className="w-[900px] flex flex-col items-start justify-start gap-5 mx-auto pt-8 pb-4">
        <div className="w-full text-center mb-8">
          <Image
            src="/Espacio_sommelier.png"
            alt="Logo Espacio Sommelier"
            width={300}
            height={60}
            priority={true}
            className="mx-auto"
          />
          <h1 className="text-xl font-semibold text-gray-300 mt-2">
            Asistente Sommelier de Carnes con IA
          </h1>
        </div>

        <div className="w-full">
          <InteractiveAvatar />
        </div>

        {/* Debug del backend */}
        <div className="text-gray-400 mt-4">{status}</div>
      </div>
    </div>
  );
}
