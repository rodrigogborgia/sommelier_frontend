// /app/api/get-access-token/route.ts
import { NextResponse } from "next/server";
import { apiPost } from "@/app/services/api";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("HEYGEN_API_KEY is missing from .env");
    }

    // Llamada al backend HeyGen vía tu servicio centralizado
    const data = await apiPost("/get-access-token", {}, {
      headers: {
        "x-api-key": HEYGEN_API_KEY,
      },
    });

    return NextResponse.json({ access_token: data.access_token || data }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving access token:", error);
    return NextResponse.json({ error: "Failed to retrieve access token" }, { status: 500 });
  }
}
