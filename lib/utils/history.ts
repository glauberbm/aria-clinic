import { Appointment, AppointmentStatus } from "@/lib/store/scheduler";

export interface HistoryFilters {
  dateFrom?: Date;
  dateTo?: Date;
  doctorIds?: string[];
  statuses?: AppointmentStatus[];
  searchQuery?: string;
  sortBy?: "date" | "doctor" | "patient" | "status" | "duration";
  sortOrder?: "asc" | "desc";
}

/**
 * Filter and sort appointments based on provided criteria
 * CAREFUL: Ensures all filters are applied correctly
 */
export function filterAndSortAppointments(
  appointments: Appointment[],
  filters: HistoryFilters
): Appointment[] {
  let results = [...appointments];

  // Date range filter
  if (filters.dateFrom) {
    results = results.filter((a) => {
      const aptDate = new Date(a.date);
      const fromDate = new Date(filters.dateFrom!);
      return aptDate >= fromDate;
    });
  }

  if (filters.dateTo) {
    results = results.filter((a) => {
      const aptDate = new Date(a.date);
      const toDate = new Date(filters.dateTo!);
      // Include the entire day (set to end of day)
      toDate.setHours(23, 59, 59, 999);
      return aptDate <= toDate;
    });
  }

  // Doctor filter
  if (filters.doctorIds && filters.doctorIds.length > 0) {
    results = results.filter((a) => filters.doctorIds!.includes(a.doctorId));
  }

  // Status filter
  if (filters.statuses && filters.statuses.length > 0) {
    results = results.filter((a) => filters.statuses!.includes(a.status));
  }

  // Search (patient name or appointment ID)
  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const query = filters.searchQuery.toLowerCase().trim();
    results = results.filter(
      (a) =>
        a.patientName.toLowerCase().includes(query) || a.id.toLowerCase().includes(query)
    );
  }

  // Sort
  const sortKey = filters.sortBy || "date";
  const sortOrder = filters.sortOrder || "desc";

  results.sort((a, b) => {
    let aVal: string | number | Date;
    let bVal: string | number | Date;

    switch (sortKey) {
      case "date":
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
        break;
      case "doctor":
        aVal = a.doctorName;
        bVal = b.doctorName;
        break;
      case "patient":
        aVal = a.patientName;
        bVal = b.patientName;
        break;
      case "status":
        aVal = a.status;
        bVal = b.status;
        break;
      case "duration":
        aVal = a.duration;
        bVal = b.duration;
        break;
      default:
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
    }

    // String comparison
    if (typeof aVal === "string" && typeof bVal === "string") {
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    }

    // Number comparison
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  return results;
}
