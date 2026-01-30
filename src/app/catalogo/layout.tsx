'use client';

import Navbar from "@/components/layout/Navbar";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar visible={true} />
      {children}
    </>
  );
}
