import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const totalCandidatos = await prisma.candidate.count();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const candidatosHoy = await prisma.candidate.count({
    where: { createdAt: { gte: startOfToday } },
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Panel de La Glorieta</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-600">Total candidatos</p>
            <p className="mt-2 text-3xl font-semibold">{totalCandidatos}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-600">Candidatos hoy</p>
            <p className="mt-2 text-3xl font-semibold">{candidatosHoy}</p>
          </div>
        </div>
      </div>
    </main>
  );
}