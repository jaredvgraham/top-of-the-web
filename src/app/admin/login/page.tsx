import { Suspense } from "react";
import AdminLoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-ink/50">
          Loading…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
