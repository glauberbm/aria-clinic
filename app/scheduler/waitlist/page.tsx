"use client";

import { useState } from "react";
import { useScheduler } from "@/lib/store/scheduler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaitlistForm } from "@/components/scheduler/WaitlistForm";
import { WaitlistTable } from "@/components/scheduler/WaitlistTable";
import { WaitlistFormData } from "@/lib/validations/waitlist";

export default function WaitlistPage() {
  const { waitlist, doctors, addToWaitlist, removeFromWaitlist } = useScheduler();
  const [selectedTab, setSelectedTab] = useState<"all" | "pending" | "offered">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(false);

  const filtered = {
    all: waitlist,
    pending: waitlist.filter((e) => e.status === "pending"),
    offered: waitlist.filter((e) => e.status === "offered"),
  }[selectedTab];

  const handleAddToWaitlist = async (data: WaitlistFormData) => {
    setIsLoading(true);
    try {
      addToWaitlist({
        patientId: `patient-${Date.now()}`,
        patientName: data.patientName,
        doctorId: data.doctorId || undefined,
        requestedDate: data.requestedDate || undefined,
        requestedTime: data.requestedTime || undefined,
        status: "pending",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Appointment Waitlist</h1>
        <p className="text-gray-600 mt-1">
          Manage patients waiting for appointments ({waitlist.length} total)
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(value: string) => setSelectedTab(value as "all" | "pending" | "offered")}>
        <TabsList>
          <TabsTrigger value="all">
            All ({waitlist.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({waitlist.filter((e) => e.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="offered">
            Offered ({waitlist.filter((e) => e.status === "offered").length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value={selectedTab} className="mt-6 space-y-8">
          {/* Add to Waitlist Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Patient to Waitlist</CardTitle>
            </CardHeader>
            <CardContent>
              <WaitlistForm
                onSubmit={handleAddToWaitlist}
                doctors={doctors}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Waitlist Table */}
          <Card>
            <CardHeader>
              <CardTitle>Waitlist Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  No entries for this filter
                </p>
              ) : (
                <WaitlistTable
                  entries={filtered}
                  doctors={doctors}
                  onRemove={removeFromWaitlist}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
