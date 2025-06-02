import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { compactFormat, standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getInstitutions } from "../fetch";

export async function TopChannels({ className }: { className?: string }) {
  const data = await getInstitutions();

  return (
    <div className={cn("grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card", className)}>
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Institutions
      </h2>
      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="min-w-[120px] !text-left">Profile</TableHead>
            <TableHead>Users</TableHead>
            <TableHead className="!text-right">Branches</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((institution: any, i: number) => (
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
              <TableCell>-</TableCell> {/* Placeholder for Users */}
              <TableCell className="!text-right text-green-light-1">-</TableCell> {/* Placeholder for Branches */}
              <TableCell>{institution.status}</TableCell>
              <TableCell>
                {[institution.city, institution.state, institution.country].filter(Boolean).join(", ")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}