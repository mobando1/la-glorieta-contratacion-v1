"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  decisionLabels,
  incidentSeverityLabels,
  incidentTypeLabels,
  rehireLabels,
  sourceLabels,
  statusLabels,
} from "@/lib/labels";

const STATUS_OPTIONS = ["NEW", "CONTACTED", "INTERVIEWED", "HIRED", "REJECTED", "ARCHIVED"];
const REHIRE_OPTIONS = ["YES", "NO", "MAYBE"];
const DECISION_OPTIONS = ["HIRE", "POOL", "REJECT"];
const SOURCE_OPTIONS = ["", "LOCAL", "REFERIDO", "REDES", "OTRO"];
const INCIDENT_TYPES = [
  "NO_SHOW",
  "CONFLICT",
  "DISHONESTY",
  "THEFT_SUSPECT",
  "POOR_PERFORMANCE",
  "CUSTOMER_COMPLAINT",
  "POSITIVE_FEEDBACK",
  "OTHER",
];
const INCIDENT_SEVERITIES = ["LOW", "MEDIUM", "HIGH"];

type Interview = {
  id: string;
  createdAt: string;
  punctuality: number;
  attitude: number;
  teamwork: number;
  totalScore: number;
  decision: string;
  availability?: string | null;
  expectedSalary?: string | null;
  canStartDate?: string | null;
  source?: string | null;
};

type Incident = {
  id: string;
  createdAt: string;
  type: string;
  severity: string;
  summary: string;
  details?: string | null;
  evidenceUrl?: string | null;
};

type Candidate = {
  id: string;
  fullName: string;
  phone: string;
  position: string;
  experience: number;
  status: string;
  notes?: string | null;
  nextFollowUpAt?: string | null;
  rehireStatus: string;
  rehireReason?: string | null;
  createdAt: string;
  interviews: Interview[];
  incidents: Incident[];
};

const CandidateProfilePage = () => {
  const params = useParams();
  const candidateId = params?.id as string;
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");

  const [rehireStatus, setRehireStatus] = useState("");
  const [rehireReason, setRehireReason] = useState("");

  const [punctuality, setPunctuality] = useState(0);
  const [attitude, setAttitude] = useState(0);
  const [teamwork, setTeamwork] = useState(0);
  const [availability, setAvailability] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [canStartDate, setCanStartDate] = useState("");
  const [source, setSource] = useState("");
  const [decisionOverride, setDecisionOverride] = useState("");
  const [interviewMessage, setInterviewMessage] = useState<string | null>(null);

  const [incidentType, setIncidentType] = useState("");
  const [incidentSeverity, setIncidentSeverity] = useState("");
  const [incidentSummary, setIncidentSummary] = useState("");
  const [incidentDetails, setIncidentDetails] = useState("");
  const [incidentEvidence, setIncidentEvidence] = useState("");
  const [incidentMessage, setIncidentMessage] = useState<string | null>(null);

  const totalScore = punctuality + attitude + teamwork;
  const suggestedDecision = totalScore >= 12 ? "HIRE" : totalScore >= 8 ? "POOL" : "REJECT";
  const finalDecision = decisionOverride || suggestedDecision;

  const hasHighIncidents = useMemo(() => {
    return candidate?.incidents?.some((incident) => incident.severity === "HIGH") ?? false;
  }, [candidate]);

  useEffect(() => {
    const fetchCandidate = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/candidates/${candidateId}`);
        if (!response.ok) {
          throw new Error("No se pudo cargar el candidato.");
        }
        const data = (await response.json()) as Candidate;
        setCandidate(data);
        setStatus(data.status);
        setNotes(data.notes ?? "");
        setNextFollowUpAt(data.nextFollowUpAt ? data.nextFollowUpAt.slice(0, 10) : "");
        setRehireStatus(data.rehireStatus);
        setRehireReason(data.rehireReason ?? "");
      } catch (error) {
        setFeedback("No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  const handleSaveCandidate = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notes,
          nextFollowUpAt: nextFollowUpAt || null,
          rehireStatus,
          rehireReason,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setFeedback(data?.message ?? "No se pudo guardar la información.");
        return;
      }

      const data = (await response.json()) as Candidate;
      setCandidate((prev) => (prev ? { ...prev, ...data } : data));
      setFeedback("Cambios guardados correctamente.");
    } catch (error) {
      setFeedback("No se pudo guardar la información.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInterview = async () => {
    setInterviewMessage(null);

    if (
      punctuality < 0 ||
      attitude < 0 ||
      teamwork < 0 ||
      punctuality > 5 ||
      attitude > 5 ||
      teamwork > 5
    ) {
      setInterviewMessage("Completa las calificaciones de la entrevista.");
      return;
    }

    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          punctuality,
          attitude,
          teamwork,
          availability: availability || null,
          expectedSalary: expectedSalary || null,
          canStartDate: canStartDate || null,
          source: source || null,
          decision: finalDecision,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setInterviewMessage(data?.message ?? "No se pudo guardar la entrevista.");
        return;
      }

      const interview = (await response.json()) as Interview;
      setCandidate((prev) =>
        prev
          ? {
              ...prev,
              status: "INTERVIEWED",
              interviews: [interview, ...prev.interviews],
            }
          : prev
      );
      setPunctuality(0);
      setAttitude(0);
      setTeamwork(0);
      setAvailability("");
      setExpectedSalary("");
      setCanStartDate("");
      setSource("");
      setDecisionOverride("");
      setInterviewMessage("Entrevista guardada correctamente.");
    } catch (error) {
      setInterviewMessage("No se pudo guardar la entrevista.");
    }
  };

  const handleCreateIncident = async () => {
    setIncidentMessage(null);

    if (!incidentType || !incidentSeverity || !incidentSummary.trim()) {
      setIncidentMessage("Completa tipo, severidad y resumen.");
      return;
    }

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          type: incidentType,
          severity: incidentSeverity,
          summary: incidentSummary,
          details: incidentDetails || null,
          evidenceUrl: incidentEvidence || null,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setIncidentMessage(data?.message ?? "No se pudo guardar el incidente.");
        return;
      }

      const incident = (await response.json()) as Incident;
      setCandidate((prev) => (prev ? { ...prev, incidents: [incident, ...prev.incidents] } : prev));
      setIncidentSummary("");
      setIncidentDetails("");
      setIncidentEvidence("");
      setIncidentType("");
      setIncidentSeverity("");
      setIncidentMessage("Incidente registrado.");
    } catch (error) {
      setIncidentMessage("No se pudo guardar el incidente.");
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando perfil...</p>;
  }

  if (!candidate) {
    return <p className="text-sm text-rose-600">No se encontró el candidato.</p>;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{candidate.fullName}</h2>
        <p className="text-sm text-slate-600">Perfil completo del candidato.</p>
      </div>

      {feedback && <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{feedback}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold">Resumen</h3>
            <p className="text-sm text-slate-500">Datos y estado actual.</p>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p><strong>Teléfono:</strong> {candidate.phone}</p>
            <p><strong>Cargo:</strong> {candidate.position}</p>
            <p><strong>Experiencia:</strong> {candidate.experience} años</p>
            <p><strong>Registro:</strong> {new Date(candidate.createdAt).toLocaleDateString("es-CO")}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Estado</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {statusLabels[option]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Notas internas</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Próximo seguimiento</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={nextFollowUpAt}
                onChange={(event) => setNextFollowUpAt(event.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveCandidate}
              disabled={saving}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold">Recontratación</h3>
            <p className="text-sm text-slate-500">Define si el candidato puede volver a ser contratado.</p>
          </div>

          {hasHighIncidents && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              Hay incidentes graves. Revisa si aplica "No recontratar".
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Estado de recontratación</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                value={rehireStatus}
                onChange={(event) => setRehireStatus(event.target.value)}
              >
                {REHIRE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {rehireLabels[option]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Razón corta (factual)</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={rehireReason}
                onChange={(event) => setRehireReason(event.target.value)}
                placeholder="Ej: no cumplió horarios en julio"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveCandidate}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Guardar recontratación"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Entrevista express</h3>
        <p className="text-sm text-slate-500">Evalúa puntualidad, actitud y trabajo en equipo (0 a 5).</p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { label: "Puntualidad", value: punctuality, setter: setPunctuality },
            { label: "Actitud", value: attitude, setter: setAttitude },
            { label: "Trabajo en equipo", value: teamwork, setter: setTeamwork },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-sm font-medium">{field.label}</label>
              <input
                type="number"
                min={0}
                max={5}
                value={field.value}
                onChange={(event) => field.setter(Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Disponibilidad</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Salario esperado</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={expectedSalary}
              onChange={(event) => setExpectedSalary(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Fecha de inicio</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={canStartDate}
              onChange={(event) => setCanStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Fuente</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            >
              {SOURCE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option ? sourceLabels[option] : "Selecciona"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1">Total: {totalScore}</span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
            Sugerencia: {decisionLabels[suggestedDecision]}
          </span>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Decisión final</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            value={finalDecision}
            onChange={(event) => setDecisionOverride(event.target.value)}
          >
            {DECISION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {decisionLabels[option]}
              </option>
            ))}
          </select>
        </div>

        {interviewMessage && <p className="mt-3 text-sm text-rose-600">{interviewMessage}</p>}

        <button
          type="button"
          onClick={handleCreateInterview}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Guardar entrevista
        </button>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <h4 className="text-sm font-semibold text-slate-700">Historial de entrevistas</h4>
          {candidate.interviews.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">Sin entrevistas registradas.</p>
          )}
          {candidate.interviews.length > 0 && (
            <ul className="mt-3 space-y-3 text-sm">
              {candidate.interviews.map((interview) => (
                <li key={interview.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span>{new Date(interview.createdAt).toLocaleString("es-CO")}</span>
                    <span className="font-medium">{decisionLabels[interview.decision]}</span>
                  </div>
                  <p className="mt-1 text-slate-600">
                    Puntualidad {interview.punctuality} · Actitud {interview.attitude} · Equipo {interview.teamwork}
                  </p>
                  <p className="mt-1 text-slate-600">Total {interview.totalScore}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Historial (incidentes y reconocimientos)</h3>
        <p className="text-sm text-slate-500">Registra hechos, no opiniones.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={incidentType}
              onChange={(event) => setIncidentType(event.target.value)}
            >
              <option value="">Selecciona</option>
              {INCIDENT_TYPES.map((option) => (
                <option key={option} value={option}>
                  {incidentTypeLabels[option]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Severidad</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={incidentSeverity}
              onChange={(event) => setIncidentSeverity(event.target.value)}
            >
              <option value="">Selecciona</option>
              {INCIDENT_SEVERITIES.map((option) => (
                <option key={option} value={option}>
                  {incidentSeverityLabels[option]}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Resumen (hecho concreto)</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={incidentSummary}
              onChange={(event) => setIncidentSummary(event.target.value)}
              placeholder="Ej: Llegó 40 min tarde el 12/03"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Detalles</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              value={incidentDetails}
              onChange={(event) => setIncidentDetails(event.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Evidencia (link)</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={incidentEvidence}
              onChange={(event) => setIncidentEvidence(event.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {incidentMessage && <p className="mt-3 text-sm text-rose-600">{incidentMessage}</p>}

        <button
          type="button"
          onClick={handleCreateIncident}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Registrar incidente
        </button>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <h4 className="text-sm font-semibold text-slate-700">Historial de incidentes</h4>
          {candidate.incidents.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">Sin incidentes registrados.</p>
          )}
          {candidate.incidents.length > 0 && (
            <ul className="mt-3 space-y-3 text-sm">
              {candidate.incidents.map((incident) => (
                <li key={incident.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span>{new Date(incident.createdAt).toLocaleString("es-CO")}</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        incident.severity === "HIGH"
                          ? "bg-rose-100 text-rose-700"
                          : incident.severity === "MEDIUM"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {incidentSeverityLabels[incident.severity]}
                    </span>
                  </div>
                  <p className="mt-1 font-medium">{incidentTypeLabels[incident.type]}</p>
                  <p className="mt-1 text-slate-600">{incident.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default CandidateProfilePage;