"use client";
import withAuth from "@/hoc/withAuth";
import { usePathname } from "next/navigation";
import React from "react";

const AdminNavbar = () => {
  const pathname = usePathname();

  const isAdminPage = pathname.includes("admin");

  return (
    isAdminPage && (
      <nav>
        <ul>
          <li>
            <a href="/admin">Admin</a>
          </li>
          <li>
            <a href="/admin/blogform">Blog Form</a>
          </li>
        </ul>
      </nav>
    )
  );
};

export default AdminNavbar;
