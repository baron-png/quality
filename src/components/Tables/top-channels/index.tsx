"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { getInstitutions } from "@/api/tenantService";

export function TopChannels({ className }: { className?: string }) {
  const { token } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getInstitutions(token)
        .then((res) => setData(res.tenants ?? []))
        .catch(() => setData([]))
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) return <div>Loading institutions...</div>;

  return (
    <div className={cn("grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card", className)}>
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Institutions
      </h2>
      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="min-w-[120px] !text-left">Profile</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((institution: any) => (
            <TableRow className="text-center text-base font-medium text-dark dark:text-white" key={institution.id}>
              <TableCell className="flex min-w-fit items-center gap-3">
                <Image
                  src={institution.logoUrl}
                  className="size-8 rounded-full object-cover"
                  width={40}
                  height={40}
                  alt={institution.name + " Logo"}
                  role="presentation"
                />
                <div>{institution.name}</div>
              </TableCell>
              <TableCell>{institution.domain}</TableCell>
              <TableCell>{institution.email}</TableCell>
              <TableCell>{institution.phone}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${institution.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {institution.status}
                </span>
              </TableCell>
              <TableCell>
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                  onClick={() => alert(`View institution ${institution.id}`)}
                >
                  View
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}