"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  X,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { Appointment, AppointmentStatus } from "@/lib/store/scheduler";
import { StatusBadge } from "./StatusBadge";

interface AppointmentActionsProps {
  appointment: Appointment;
  onStatusChange: (
    appointmentId: string,
    status: AppointmentStatus,
    data?: { reason?: string; notes?: string }
  ) => Promise<void>;
  isLoading?: boolean;
  onReschedule?: () => void;
}

const cancelReasons = [
  "Doctor unavailable",
  "Patient request",
  "No-show",
  "Emergency",
  "Other",
];

export function AppointmentActions({
  appointment,
  onStatusChange,
  isLoading = false,
  onReschedule,
}: AppointmentActionsProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRescheduleConfirm, setShowRescheduleConfirm] = useState(false);
  const [showMarkDoneConfirm, setShowMarkDoneConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("Patient request");
  const [doneNotes, setDoneNotes] = useState("");

  const handleConfirm = async () => {
    await onStatusChange(appointment.id, "confirmed");
  };

  const handleCancel = async () => {
    await onStatusChange(appointment.id, "cancelled", { reason: cancelReason });
    setShowCancelConfirm(false);
    setCancelReason("Patient request");
  };

  const handleMarkDone = async () => {
    await onStatusChange(appointment.id, "completed", { notes: doneNotes });
    setShowMarkDoneConfirm(false);
    setDoneNotes("");
  };

  const handleMarkNoShow = async () => {
    await onStatusChange(appointment.id, "noshow");
  };

  const handleReschedule = () => {
    setShowRescheduleConfirm(false);
    onReschedule?.();
  };

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Status</p>
              <StatusBadge status={appointment.status} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {/* Confirm Button - only show if scheduled */}
            {appointment.status === "scheduled" && (
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Confirm Appointment
              </Button>
            )}

            {/* Reschedule Button - show if scheduled or confirmed */}
            {(appointment.status === "scheduled" ||
              appointment.status === "confirmed") && (
              <Button
                onClick={() => setShowRescheduleConfirm(true)}
                disabled={isLoading}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Calendar size={18} />
                Reschedule
              </Button>
            )}

            {/* Mark Done Button - only for scheduled or confirmed */}
            {(appointment.status === "scheduled" ||
              appointment.status === "confirmed") && (
              <Button
                onClick={() => setShowMarkDoneConfirm(true)}
                disabled={isLoading}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Mark as Done
              </Button>
            )}

            {/* Mark No-show Button - only for scheduled or confirmed */}
            {(appointment.status === "scheduled" ||
              appointment.status === "confirmed") && (
              <Button
                onClick={handleMarkNoShow}
                disabled={isLoading}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700"
              >
                <AlertCircle size={18} />
                Mark as No-show
              </Button>
            )}

            {/* Cancel Button - show unless already cancelled or completed */}
            {appointment.status !== "cancelled" &&
              appointment.status !== "completed" && (
                <Button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
                >
                  <X size={18} />
                  Cancel
                </Button>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Reschedule Confirmation Dialog */}
      {showRescheduleConfirm && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-blue-900">Reschedule Appointment</p>
                  <p className="text-sm text-blue-800 mt-1">
                    This will mark the current appointment as &quot;rescheduled&quot; and create a new slot.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-blue-200">
                <Button
                  onClick={handleReschedule}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Proceed
                </Button>
                <Button
                  onClick={() => setShowRescheduleConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mark Done Confirmation Dialog */}
      {showMarkDoneConfirm && (
        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-green-900">Mark as Completed</p>
                  <p className="text-sm text-green-800 mt-1">
                    Confirm that the appointment was completed successfully.
                  </p>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label htmlFor="notes" className="text-sm font-medium text-green-900 block mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={doneNotes}
                  onChange={(e) => setDoneNotes(e.target.value)}
                  placeholder="Add any notes about the appointment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-green-200">
                <Button
                  onClick={handleMarkDone}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Confirm Done
                </Button>
                <Button
                  onClick={() => {
                    setShowMarkDoneConfirm(false);
                    setDoneNotes("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-red-900">Cancel Appointment</p>
                  <p className="text-sm text-red-800 mt-1">
                    This action cannot be undone. The appointment will be marked as cancelled.
                  </p>
                </div>
              </div>

              {/* Reason Selection */}
              <div>
                <label htmlFor="reason" className="text-sm font-medium text-red-900 block mb-2">
                  Cancellation Reason *
                </label>
                <select
                  id="reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm"
                >
                  {cancelReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-red-200">
                <Button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Cancel Appointment
                </Button>
                <Button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancelReason("Patient request");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Abort
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Log */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Status History (Mock Data)</h4>
          <div className="space-y-3">
            <div className="text-sm border-l-2 border-gray-300 pl-4 pb-3">
              <p className="text-gray-900 font-medium">Scheduled</p>
              <p className="text-gray-500 text-xs mt-1">Created on {appointment.date.toLocaleDateString()}</p>
              <p className="text-gray-600 text-xs mt-1">by System</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
