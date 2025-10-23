"use client";
import { PageHeader } from "@/components/sidebar/page-header";
import { DataTable } from "@/components/table/dataTable";

export function Receipts() {
  const breadcrumbs = {
    items: [
      { label: "Buchhaltung", href: "/buchhaltung/rechnungen" },
      { label: "Rechnungen" },
    ],
  };

  return (
    <div className="w-full">
      {/* Header */}

      <PageHeader {...breadcrumbs} />

      {/* Table directly underneath */}
      <DataTable />
    </div>
  );
}
