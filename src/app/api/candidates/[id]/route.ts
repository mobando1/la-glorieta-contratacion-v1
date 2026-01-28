import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { isAdminRequest } from "@/lib/api-auth";

const parseDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const GET = async (_request: Request, context: { params: { id: string } }) => {
  if (!isAdminRequest(_request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  const candidate = await prisma.candidate.findUnique({
    where: { id: context.params.id },
    include: {
      interviews: { orderBy: { createdAt: "desc" } },
      incidents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!candidate) {
    return NextResponse.json({ message: "Candidato no encontrado." }, { status: 404 });
  }

  return NextResponse.json(candidate, { status: 200 });
};

const STATUS_OPTIONS = ["NEW", "CONTACTED", "INTERVIEWED", "HIRED", "REJECTED", "ARCHIVED"];
const REHIRE_OPTIONS = ["YES", "NO", "MAYBE"];

export const PATCH = async (request: Request, context: { params: { id: string } }) => {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    status?: string;
    notes?: string | null;
    nextFollowUpAt?: string | null;
    rehireStatus?: string;
    rehireReason?: string | null;
  };

  const updates: Record<string, unknown> = {};

  if (body.status) {
    if (!STATUS_OPTIONS.includes(body.status)) {
      return NextResponse.json({ message: "Estado inválido." }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (body.notes !== undefined) {
    updates.notes = body.notes ? body.notes.trim() : null;
  }

  if (body.nextFollowUpAt !== undefined) {
    const parsed = parseDate(body.nextFollowUpAt);
    if (body.nextFollowUpAt && !parsed) {
      return NextResponse.json({ message: "Fecha de seguimiento inválida." }, { status: 400 });
    }
    updates.nextFollowUpAt = parsed;
  }

  if (body.rehireStatus) {
    if (!REHIRE_OPTIONS.includes(body.rehireStatus)) {
      return NextResponse.json({ message: "Estado de recontratación inválido." }, { status: 400 });
    }
    updates.rehireStatus = body.rehireStatus;
  }

  if (body.rehireReason !== undefined) {
    updates.rehireReason = body.rehireReason ? body.rehireReason.trim() : null;
  }

  const candidate = await prisma.candidate.update({
    where: { id: context.params.id },
    data: updates,
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE_CANDIDATE",
      entityType: "Candidate",
      entityId: candidate.id,
      candidateId: candidate.id,
      metadata: updates,
    },
  });

  return NextResponse.json(candidate, { status: 200 });
};