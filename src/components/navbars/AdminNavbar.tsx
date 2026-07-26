"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const links = [
  { href: "/admin", label: "Websites" },
  { href: "/admin/previews", label: "Previews" },
  { href: "/admin/onboarding", label: "Onboarding" },
  { href: "/admin/blogform", label: "Blog" },
  { href: "/admin/send-email", label: "Email" },
];

const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminPage = pathname.includes("admin");
  const isLogin = pathname === "/admin/login";

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  if (!isAdminPage || isLogin) return null;

  return (
    <nav className="sticky top-0 z-40 max-w-[100vw] overflow-x-hidden border-b border-ink/10 bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-6 sm:gap-8">
          <Link
            href="/admin"
            className="font-display shrink-0 text-lg font-medium tracking-tight text-ink"
          >
            Bsites
            <span className="ml-1.5 text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-accent">
              Admin
            </span>
          </Link>

          <ul className="hidden items-center gap-1 sm:flex">
            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "text-ink"
                        : "text-ink/45 hover:text-ink/80"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-[13px] h-[2px] bg-accent" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 rounded-full px-3 py-2 text-sm text-ink/45 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          Log out
        </button>
      </div>

      <div className="flex max-w-[100vw] gap-2 overflow-x-auto border-t border-ink/5 px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                active ? "bg-ink text-paper" : "bg-ink/5 text-ink/55"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminNavbar;
