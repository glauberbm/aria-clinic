import { Appointment } from "@/lib/store/scheduler";
import { format } from "date-fns";

/**
 * Convert appointments to CSV format
 */
export function convertToCSV(appointments: Appointment[]): string {
  const headers = ["Date", "Time", "Patient", "Doctor", "Type", "Duration", "Status"];

  const rows = appointments.map((apt) => [
    format(new Date(apt.date), "yyyy-MM-dd"),
    apt.timeStart,
    apt.patientName,
    apt.doctorName,
    apt.type,
    apt.duration.toString(),
    apt.status,
  ]);

  // Escape quotes in values and wrap in quotes
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape double quotes and wrap in quotes
          const escaped = String(cell).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
