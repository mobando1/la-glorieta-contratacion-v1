import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const POST = async () => {
  clearSessionCookie();
  return NextResponse.json({ message: "Sesión cerrada." }, { status: 200 });
};