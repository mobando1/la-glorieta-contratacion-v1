import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { isAdminRequest } from "@/lib/api-auth";

const TYPE_OPTIONS = [
  "NO_SHOW",
  "CONFLICT",
  "DISHONESTY",
  "THEFT_SUSPECT",
  "POOR_PERFORMANCE",
  "CUSTOMER_COMPLAINT",
  "POSITIVE_FEEDBACK",
  "OTHER",
];

const SEVERITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

export const GET = async (request: Request) => {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) {
    return NextResponse.json({ message: "candidateId es requerido." }, { status: 400 });
  }

  const incidents = await prisma.incident.findMany({
    where: { candidateId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(incidents, { status: 200 });
};

export const POST = async (request: Request) => {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    candidateId?: string;
    type?: string;
    severity?: string;
    summary?: string;
    details?: string;
    evidenceUrl?: string;
  };

  if (!body.candidateId) {
    return NextResponse.json({ message: "candidateId es requerido." }, { status: 400 });
  }

  if (!body.type || !TYPE_OPTIONS.includes(body.type)) {
    return NextResponse.json({ message: "Tipo de incidente inválido." }, { status: 400 });
  }

  if (!body.severity || !SEVERITY_OPTIONS.includes(body.severity)) {
    return NextResponse.json({ message: "Severidad inválida." }, { status: 400 });
  }

  if (!body.summary?.trim()) {
    return NextResponse.json({ message: "El resumen es obligatorio." }, { status: 400 });
  }

  const incident = await prisma.incident.create({
    data: {
      candidateId: body.candidateId,
      type: body.type,
      severity: body.severity,
      summary: body.summary.trim(),
      details: body.details?.trim() || null,
      evidenceUrl: body.evidenceUrl?.trim() || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE_INCIDENT",
      entityType: "Incident",
      entityId: incident.id,
      candidateId: body.candidateId,
      metadata: { severity: body.severity, type: body.type },
    },
  });

  return NextResponse.json(incident, { status: 201 });
};