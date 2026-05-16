"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doctor } from "@/lib/store/scheduler";
import { waitlistFormSchema, WaitlistFormData } from "@/lib/validations/waitlist";

interface WaitlistFormProps {
  onSubmit: (data: WaitlistFormData) => Promise<void>;
  doctors: Doctor[];
  isLoading?: boolean;
}

export function WaitlistForm({
  onSubmit,
  doctors,
  isLoading = false,
}: WaitlistFormProps) {
  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      patientName: "",
      doctorId: undefined,
      requestedDate: undefined,
      requestedTime: undefined,
    },
  });

  const handleSubmit = async (data: WaitlistFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Failed to add to waitlist:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Patient Name */}
        <FormField
          control={form.control}
          name="patientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter patient name"
                  {...field}
                  disabled={isLoading}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preferred Doctor */}
        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Doctor (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose a preferred doctor if desired
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preferred Date */}
        <FormField
          control={form.control}
          name="requestedDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Date (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  disabled={isLoading}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    field.onChange(date);
                  }}
                  value={
                    field.value
                      ? field.value.toISOString().split("T")[0]
                      : ""
                  }
                />
              </FormControl>
              <FormDescription>
                Choose a preferred appointment date
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preferred Time */}
        <FormField
          control={form.control}
          name="requestedTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Time (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="time"
                  placeholder="HH:MM"
                  disabled={isLoading}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Choose a preferred appointment time
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Adding to Waitlist..." : "Add to Waitlist"}
        </Button>
      </form>
    </Form>
  );
}
