"use client";

import { Button } from "@/components/ui/button";

import {
  createJobListing,
  updateJobListing,
} from "@/actions/job-listing-actions";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  experienceLevels,
  JobListingTable,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/drizzle/schema";
import { jobListingSchema } from "@/lib/schemas/job-listing-schema";
import {
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
  formatWageInterval,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LoadingSwap } from "../loading-swap";
import { MarkdownEditor } from "../markdown/markdown-editor";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { StateSelectItems } from "./state-select-items";

const NONE_SELECT_VALUE = "none";

export function JobListingForm({
  jobListing,
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "title"
    | "description"
    | "experienceLevel"
    | "id"
    | "stateAbbreviation"
    | "type"
    | "wage"
    | "wageInterval"
    | "city"
    | "locationRequirement"
  >;
}) {
  const form = useForm({
    resolver: zodResolver(jobListingSchema),
    defaultValues: {
      title: jobListing?.title ?? "",
      description: jobListing?.description ?? "",
      stateAbbreviation: jobListing?.stateAbbreviation ?? null,
      city: jobListing?.city ?? null,
      wage: jobListing?.wage ?? null,
      wageInterval: jobListing?.wageInterval ?? "yearly",
      experienceLevel: jobListing?.experienceLevel ?? "junior",
      type: jobListing?.type ?? "full-time",
      locationRequirement: jobListing?.locationRequirement ?? "in-office",
    },
  });

  async function onSubmit(data: z.infer<typeof jobListingSchema>) {
    const action = jobListing
      ? updateJobListing.bind(null, jobListing.id)
      : createJobListing;
    const res = await action(data);

    if (res.error) {
      toast.error(res.message);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FieldGroup className="@container flex flex-col gap-6">
        {/* Title + Wage */}
        <div className="grid grid-cols-1 gap-6 @md:grid-cols-2">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Job Title</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="wage"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Wage</FieldLabel>
                <div className="flex">
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        isNaN(e.target.valueAsNumber)
                          ? null
                          : e.target.valueAsNumber,
                      )
                    }
                    className="rounded-r-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <Controller
                    name="wageInterval"
                    control={form.control}
                    render={({ field: intervalField }) => (
                      <Select
                        value={intervalField.value ?? ""}
                        onValueChange={intervalField.onChange}
                      >
                        <SelectTrigger className="w-32 rounded-l-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {wageIntervals.map((interval) => (
                            <SelectItem key={interval} value={interval}>
                              {formatWageInterval(interval)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <FieldDescription>Optional</FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* City + State + Location Requirement */}
        <div className="grid grid-cols-1 gap-6 @md:grid-cols-3">
          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>City</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="stateAbbreviation"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>State</FieldLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) =>
                    field.onChange(val === NONE_SELECT_VALUE ? null : val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.value && (
                      <SelectItem
                        value={NONE_SELECT_VALUE}
                        className="text-muted-foreground"
                      >
                        Clear
                      </SelectItem>
                    )}
                    <StateSelectItems />
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="locationRequirement"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Location Requirement</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locationRequirements.map((lr) => (
                      <SelectItem key={lr} value={lr}>
                        {formatLocationRequirement(lr)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Job Type + Experience Level */}
        <div className="grid grid-cols-1 gap-6 @md:grid-cols-2">
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Job Type</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobListingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatJobType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="experienceLevel"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Experience Level</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((exp) => (
                      <SelectItem key={exp} value={exp}>
                        {formatExperienceLevel(exp)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Description */}
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Description</FieldLabel>
              <MarkdownEditor
                {...field}
                markdown={field.value ?? ""}
                onChange={field.onChange}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        <LoadingSwap isLoading={form.formState.isSubmitting}>
          {jobListing ? "Update Job Listing" : "Create Job Listing"}
        </LoadingSwap>
      </Button>
    </form>
  );
}
