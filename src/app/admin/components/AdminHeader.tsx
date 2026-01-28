"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const AdminHeader = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <h1 className="text-lg font-semibold text-slate-900">Panel de La Glorieta</h1>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
        >
          {loading ? "Cerrando..." : "Cerrar sesión"}
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;