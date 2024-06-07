import {nonNullish} from "@junobuild/utils";
import type {
  CronJobs,
  ListStatuses,
  Result,
} from "../../declarations/observatory/observatory.did.js";
import {lowCycles, running} from "./segment.utils.js";

const filterSegmentStatus = ({
  segmentStatus,
  cron_jobs,
  type,
}: {
  segmentStatus: Result;
  cron_jobs: CronJobs;
  type: "mission_control" | "satellite" | "orbiter";
}): boolean => {
  // If there was an error we want to inform
  if ("Err" in segmentStatus) {
    return true;
  }

  const {Ok: status} = segmentStatus;

  return running({status}) && lowCycles({status, type, cron_jobs});
};

export const filterStatuses = ({
  statuses,
  cron_jobs,
}: ListStatuses): boolean => {
  // If there was an error we want to notify
  if ("Err" in statuses) {
    return true;
  }

  const {
    Ok: {mission_control, satellites, orbiters},
  } = statuses;

  // Mission control needs to be reported
  if (
    filterSegmentStatus({
      segmentStatus: mission_control,
      cron_jobs,
      type: "mission_control",
    })
  ) {
    return true;
  }

  const satellite = (satellites[0] ?? []).find((satellite) =>
    filterSegmentStatus({
      segmentStatus: satellite,
      cron_jobs,
      type: "satellite",
    }),
  );

  if (nonNullish(satellite)) {
    return true;
  }

  const orbiter = (orbiters[0] ?? []).find((orbiter) =>
    filterSegmentStatus({
      segmentStatus: orbiter,
      cron_jobs,
      type: "orbiter",
    }),
  );

  return nonNullish(orbiter);
};
