import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { evaluateInterview } from "@/domain/interview";
import { isAdminRequest } from "@/lib/api-auth";

const SOURCE_OPTIONS = ["LOCAL", "REFERIDO", "REDES", "OTRO"];
const DECISION_OPTIONS = ["HIRE", "POOL", "REJECT"];

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
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) {
    return NextResponse.json({ message: "candidateId es requerido." }, { status: 400 });
  }

  const interviews = await prisma.interview.findMany({
    where: { candidateId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(interviews, { status: 200 });
};

export const POST = async (request: Request) => {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    candidateId?: string;
    punctuality?: number | string;
    attitude?: number | string;
    teamwork?: number | string;
    availability?: string;
    expectedSalary?: string;
    canStartDate?: string;
    source?: string;
    decision?: string;
  };

  if (!body.candidateId) {
    return NextResponse.json({ message: "candidateId es requerido." }, { status: 400 });
  }

  const punctuality = parseNumber(body.punctuality);
  const attitude = parseNumber(body.attitude);
  const teamwork = parseNumber(body.teamwork);

  try {
    const evaluation = evaluateInterview({ punctuality, attitude, teamwork });

    const decision = body.decision && DECISION_OPTIONS.includes(body.decision)
      ? body.decision
      : evaluation.suggestedDecision;

    const canStartDate = body.canStartDate ? new Date(body.canStartDate) : null;
    if (body.canStartDate && Number.isNaN(canStartDate?.getTime())) {
      return NextResponse.json({ message: "Fecha de inicio inválida." }, { status: 400 });
    }

    const interview = await prisma.interview.create({
      data: {
        candidateId: body.candidateId,
        punctuality,
        attitude,
        teamwork,
        totalScore: evaluation.totalScore,
        decision,
        availability: body.availability?.trim() || null,
        expectedSalary: body.expectedSalary?.trim() || null,
        canStartDate,
        source: body.source && SOURCE_OPTIONS.includes(body.source) ? body.source : null,
      },
    });

    await prisma.candidate.update({
      where: { id: body.candidateId },
      data: { status: "INTERVIEWED" },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_INTERVIEW",
        entityType: "Interview",
        entityId: interview.id,
        candidateId: body.candidateId,
        metadata: { totalScore: evaluation.totalScore, decision },
      },
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Datos de entrevista inválidos." }, { status: 400 });
  }
};