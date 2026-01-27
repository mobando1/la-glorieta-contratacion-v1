export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const position = String(body.position ?? "").trim();
    const experienceRaw = body.experience;

    if (!fullName || !phone || !position) {
      return NextResponse.json(
        { error: "fullName, phone y position son obligatorios." },
        { status: 400 }
      );
    }

    const experience = Number.isFinite(Number(experienceRaw)) ? Number(experienceRaw) : 0;

    const candidate = await prisma.candidate.create({
      data: {
        fullName,
        phone,
        position,
        experience,
      },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(candidates);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}