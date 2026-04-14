import {
  ExperienceLevel,
  JobListingStatus,
  JobListingType,
  LocationRequirement,
  WageInterval,
} from "@/drizzle/schema";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const JOB_LISTING_STATUS_SORT_ORDER: Record<JobListingStatus, number> = {
  published: 0,
  draft: 1,
  delisted: 2,
};

/**
 * Sorts job listing statuses based on a predefined sort order.
 * @param a - The first job listing status to compare.
 * @param b - The second job listing status to compare.
 * @returns A number indicating the sort order: negative if a comes before b, positive if b comes before a, or 0 if equal.
 */
export function sortJobListingsByStatus(
  a: JobListingStatus,
  b: JobListingStatus,
) {
  return JOB_LISTING_STATUS_SORT_ORDER[a] - JOB_LISTING_STATUS_SORT_ORDER[b];
}

export function formatWageInterval(interval: WageInterval) {
  switch (interval) {
    case "hourly":
      return "Hour";
    case "yearly":
      return "Year";
    default:
      throw new Error(`Invalid wage interval: ${interval satisfies never}`);
  }
}

export function formatLocationRequirement(
  locationRequirement: LocationRequirement,
) {
  switch (locationRequirement) {
    case "remote":
      return "Remote";
    case "in-office":
      return "In Office";
    case "hybrid":
      return "Hybrid";
    default:
      throw new Error(
        `Unknown location requirement: ${locationRequirement satisfies never}`,
      );
  }
}

export function formatExperienceLevel(experienceLevel: ExperienceLevel) {
  switch (experienceLevel) {
    case "junior":
      return "Junior";
    case "mid-level":
      return "Mid Level";
    case "senior":
      return "Senior";
    default:
      throw new Error(
        `Unknown experience level: ${experienceLevel satisfies never}`,
      );
  }
}

export function formatJobType(type: JobListingType) {
  switch (type) {
    case "full-time":
      return "Full Time";
    case "part-time":
      return "Part Time";
    case "internship":
      return "Internship";
    default:
      throw new Error(`Unknown job type: ${type satisfies never}`);
  }
}

export function formatJobListingStatus(status: JobListingStatus) {
  switch (status) {
    case "published":
      return "Active";
    case "draft":
      return "Draft";
    case "delisted":
      return "Delisted";
    default:
      throw new Error(`Unknown status: ${status satisfies never}`);
  }
}

export function formatWage(wage: number, wageInterval: WageInterval) {
  const wageFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  switch (wageInterval) {
    case "hourly": {
      return `${wageFormatter.format(wage)} / hr`;
    }
    case "yearly": {
      return wageFormatter.format(wage);
    }
    default:
      throw new Error(`Unknown wage interval: ${wageInterval satisfies never}`);
  }
}

export function formatJobListingLocation({
  stateAbbreviation,
  city,
}: {
  stateAbbreviation: string | null;
  city: string | null;
}) {
  if (stateAbbreviation == null && city == null) return "None";

  const locationParts = [];
  if (city != null) locationParts.push(city);
  if (stateAbbreviation != null) {
    locationParts.push(stateAbbreviation.toUpperCase());
  }

  return locationParts.join(", ");
}

export function getNextJobListingStatus(status: JobListingStatus) {
  switch (status) {
    case "draft":
    case "delisted":
      return "published";
    case "published":
      return "delisted";
    default:
      throw new Error(`Unknown job listing status: ${status satisfies never}`);
  }
}
