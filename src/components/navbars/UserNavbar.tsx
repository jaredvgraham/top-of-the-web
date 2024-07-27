"use client";
import withAuth from "@/hoc/withAuth";
import { usePathname } from "next/navigation";
import React from "react";

const UserNavbar = () => {
  const pathname = usePathname();
  const isUserPage = pathname.includes("user");

  return (
    isUserPage && (
      <nav>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/admin">Admin</a>
          </li>
          <li>
            <a href="/user">User</a>
          </li>
        </ul>
      </nav>
    )
  );
};

export default UserNavbar;
