import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { isAdminRequest } from "@/lib/api-auth";

const parseNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
};

export const GET = async (request: Request) => {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status") || undefined;
  const rehireStatus = searchParams.get("rehireStatus") || undefined;
  const sort = searchParams.get("sort") || "createdAt";

  const where = {
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(rehireStatus ? { rehireStatus } : {}),
  };

  const orderBy =
    sort === "score"
      ? {
          interviews: {
            _max: {
              totalScore: "desc" as const,
            },
          },
        }
      : { createdAt: "desc" as const };

  const candidates = await prisma.candidate.findMany({
    where,
    orderBy,
    take: 50,
    include: {
      interviews: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { totalScore: true, decision: true },
      },
      _count: {
        select: { interviews: true, incidents: true },
      },
    },
  });

  const payload = candidates.map((candidate) => ({
    ...candidate,
    lastInterviewScore: candidate.interviews[0]?.totalScore ?? null,
    lastInterviewDecision: candidate.interviews[0]?.decision ?? null,
    totalInterviews: candidate._count.interviews,
    totalIncidents: candidate._count.incidents,
    interviews: undefined,
    _count: undefined,
  }));

  return NextResponse.json(payload, { status: 200 });
};

export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => ({}))) as {
    fullName?: string;
    phone?: string;
    position?: string;
    experience?: number | string;
  };

  if (!body.fullName?.trim()) {
    return NextResponse.json({ message: "El nombre es obligatorio." }, { status: 400 });
  }

  if (!body.phone?.trim()) {
    return NextResponse.json({ message: "El teléfono es obligatorio." }, { status: 400 });
  }

  if (!body.position?.trim()) {
    return NextResponse.json({ message: "El cargo es obligatorio." }, { status: 400 });
  }

  const experience = parseNumber(body.experience);
  if (Number.isNaN(experience) || experience < 0 || experience > 50) {
    return NextResponse.json(
      { message: "La experiencia debe estar entre 0 y 50." },
      { status: 400 }
    );
  }

  const candidate = await prisma.candidate.create({
    data: {
      fullName: body.fullName.trim(),
      phone: body.phone.trim(),
      position: body.position.trim(),
      experience,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE_CANDIDATE",
      entityType: "Candidate",
      entityId: candidate.id,
      candidateId: candidate.id,
      metadata: { source: "public_form" },
    },
  });

  return NextResponse.json(candidate, { status: 201 });
};