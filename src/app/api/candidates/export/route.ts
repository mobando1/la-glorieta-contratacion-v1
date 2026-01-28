import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { isAdminRequest } from "@/lib/api-auth";

const buildCsv = (rows: string[][]) => {
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
};

export const GET = async (request: Request) => {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const rehireStatus = searchParams.get("rehireStatus") || undefined;
  const dateFromRaw = searchParams.get("dateFrom");
  const dateToRaw = searchParams.get("dateTo");
  const dateFrom = dateFromRaw ? new Date(dateFromRaw) : undefined;
  const dateTo = dateToRaw ? new Date(dateToRaw) : undefined;

  if ((dateFromRaw && Number.isNaN(dateFrom?.getTime())) || (dateToRaw && Number.isNaN(dateTo?.getTime()))) {
    return NextResponse.json({ message: "Rango de fechas inválido." }, { status: 400 });
  }

  const where = {
    ...(status ? { status } : {}),
    ...(rehireStatus ? { rehireStatus } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
  };

  const candidates = await prisma.candidate.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      interviews: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const rows = [
    [
      "ID",
      "Fecha registro",
      "Nombre",
      "Teléfono",
      "Cargo",
      "Experiencia",
      "Estado",
      "Recontratación",
      "Último puntaje",
      "Última decisión",
      "Notas",
    ],
  ];

  candidates.forEach((candidate) => {
    const lastInterview = candidate.interviews[0];
    rows.push([
      candidate.id,
      candidate.createdAt.toISOString(),
      candidate.fullName,
      candidate.phone,
      candidate.position,
      String(candidate.experience),
      candidate.status,
      candidate.rehireStatus,
      lastInterview?.totalScore?.toString() ?? "",
      lastInterview?.decision ?? "",
      candidate.notes ?? "",
    ]);
  });

  const csv = buildCsv(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=export-candidatos.csv",
    },
  });
};