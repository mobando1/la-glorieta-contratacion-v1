import type { ReactNode } from "react";
import AdminHeader from "./components/AdminHeader";

const AdminLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <AdminHeader />
    <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
  </div>
);

export default AdminLayout;