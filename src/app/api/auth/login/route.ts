import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";

export const POST = async (request: Request) => {
  const { password } = (await request.json().catch(() => ({}))) as { password?: string };

  if (!password) {
    return NextResponse.json({ message: "Ingresa la contraseña." }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ message: "ADMIN_PASSWORD no está configurado." }, { status: 500 });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ message: "Contraseña incorrecta." }, { status: 401 });
  }

  setSessionCookie();
  return NextResponse.json({ message: "Ingreso correcto." }, { status: 200 });
};