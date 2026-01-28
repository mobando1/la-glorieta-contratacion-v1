import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Panel de La Glorieta</h1>
            <p className="mt-1 text-sm text-slate-600">
              Dashboard de contratación: candidatos, decisiones y memoria histórica.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/candidates"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Ver candidatos
            </Link>
            <Link
              href="/aplicar"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Abrir formulario público
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Candidatos"
            value="—"
            helper="Total registrados"
            note="(En el siguiente paso lo conectamos a la API)"
          />
          <Card title="Nuevos" value="—" helper="Por revisar" />
          <Card title="En proceso" value="—" helper="Entrevista / validación" />
          <Card title="Decisión tomada" value="—" helper="Aprobado / descartado" />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Panel
            title="Accesos rápidos"
            description="Flujo ideal para el administrador."
          >
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                <span className="text-slate-700">1) Revisar nuevos aspirantes</span>
                <Link className="font-semibold text-slate-900 hover:underline" href="/admin/candidates">
                  Abrir
                </Link>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                <span className="text-slate-700">2) Tomar decisión (Aprobar/Descartar)</span>
                <span className="text-xs text-slate-500">En candidato</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                <span className="text-slate-700">3) Marcar “No recontratar” si aplica</span>
                <span className="text-xs text-slate-500">En candidato</span>
              </li>
            </ul>
          </Panel>

          <Panel
            title="Memoria histórica"
            description="Esto es lo que vuelve el sistema poderoso."
          >
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Objetivo</p>
              <p className="mt-1 text-sm text-amber-800">
                Registrar notas internas, alertas y decisiones para que si alguien vuelve a pedir trabajo,
                el sistema recuerde el historial (bueno o malo).
              </p>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Próximo paso: agregamos “Notas internas”, “Banderas” y “Estado”.
            </div>
          </Panel>

          <Panel
            title="Estado del sistema"
            description="Checklist rápido para saber si todo está OK."
          >
            <div className="mt-3 space-y-2 text-sm">
              <StatusItem label="Servidor Next.js" value="OK si ves esta página" />
              <StatusItem label="API candidatos" value="OK si /api/candidates responde" />
              <StatusItem label="BD (Prisma)" value="OK si crea registros desde /aplicar" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/api/candidates"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-100"
              >
                Probar API /api/candidates
              </Link>
              <Link
                href="/admin/candidates"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-100"
              >
                Ir a /admin/candidates
              </Link>
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Card(props: { title: string; value: string; helper: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">{props.title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{props.value}</p>
          <p className="mt-1 text-sm text-slate-600">{props.helper}</p>
          {props.note ? <p className="mt-2 text-xs text-slate-500">{props.note}</p> : null}
        </div>
        <div className="h-10 w-10 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function Panel(props: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-800">{props.title}</p>
      <p className="mt-1 text-sm text-slate-600">{props.description}</p>
      {props.children}
    </div>
  );
}

function StatusItem(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="text-slate-700">{props.label}</span>
      <span className="text-xs font-semibold text-slate-900">{props.value}</span>
    </div>
  );
}