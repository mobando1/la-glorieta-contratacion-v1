"use client";

import { useState } from "react";

type FormState = {
  fullName: string;
  phone: string;
  position: string;
  experience: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type SubmitStatus =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const POSITION_OPTIONS = [
  "Mesero",
  "Auxiliar de cocina",
  "Cocinera",
  "Auxiliar de mesa/servicio",
  "Otro",
];

const initialFormState: FormState = {
  fullName: "",
  phone: "",
  position: "",
  experience: "",
};

const ApplyPage = () => {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>({ type: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (state: FormState): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!state.fullName.trim()) {
      nextErrors.fullName = "Ingresa tu nombre completo.";
    }

    if (!state.phone.trim()) {
      nextErrors.phone = "Ingresa tu teléfono.";
    }

    if (!state.position) {
      nextErrors.position = "Selecciona el cargo al que aplicas.";
    }

    if (state.experience === "") {
      nextErrors.experience = "Ingresa tus años de experiencia (0 si no tienes).";
    } else {
      const experienceValue = Number(state.experience);
      if (Number.isNaN(experienceValue)) {
        nextErrors.experience = "La experiencia debe ser un número.";
      } else if (experienceValue < 0 || experienceValue > 50) {
        nextErrors.experience = "La experiencia debe estar entre 0 y 50.";
      }
    }

    return nextErrors;
  };

  const handleChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFormState((prev) => ({
        ...prev,
        [field]: field === "phone" ? value.replace(/\D/g, "") : value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: "idle" });

    const validationErrors = validate(formState);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formState.fullName.trim(),
          phone: formState.phone.trim(),
          position: formState.position,
          experience: Number(formState.experience),
        }),
      });

      if (response.status === 201) {
        setStatus({ type: "success", message: "Enviado correctamente. Te contactaremos pronto." });
        setFormState(initialFormState);
        return;
      }

      if (response.status === 400) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setStatus({
          type: "error",
          message: data?.message ?? "Revisa los datos e intenta nuevamente.",
        });
        return;
      }

      setStatus({ type: "error", message: "Error interno, intenta de nuevo." });
    } catch (error) {
      setStatus({ type: "error", message: "Error interno, intenta de nuevo." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Aplicar a La Glorieta</h1>
        <p className="mt-2 text-sm text-slate-600">Completa este formulario y te contactaremos.</p>

        {status.type !== "idle" && (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {status.message}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="fullName">
              Nombre completo
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formState.fullName}
              onChange={handleChange("fullName")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              placeholder="Ej: María Gómez"
              required
            />
            {errors.fullName && <p className="text-xs text-rose-600">{errors.fullName}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="phone">
              Teléfono
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              value={formState.phone}
              onChange={handleChange("phone")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              placeholder="Ej: 3001234567"
              required
            />
            {errors.phone && <p className="text-xs text-rose-600">{errors.phone}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="position">
              Cargo al que aplicas
            </label>
            <select
              id="position"
              name="position"
              value={formState.position}
              onChange={handleChange("position")}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              required
            >
              <option value="">Selecciona una opción</option>
              {POSITION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.position && <p className="text-xs text-rose-600">{errors.position}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="experience">
              Años de experiencia
            </label>
            <input
              id="experience"
              name="experience"
              type="number"
              min={0}
              max={50}
              value={formState.experience}
              onChange={handleChange("experience")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              placeholder="0"
              required
            />
            {errors.experience && <p className="text-xs text-rose-600">{errors.experience}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Enviando…" : "Enviar solicitud"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ApplyPage;