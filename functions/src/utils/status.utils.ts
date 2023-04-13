import type {
  CollectStatuses,
  CronJobs,
  Result,
} from "../../declarations/observatory/observatory.did.js";
import {lowCycles} from "./segment.utils.js";

const filterSegmentStatus = ({
  segmentStatus,
  cron_jobs,
  type,
}: {
  segmentStatus: Result;
  cron_jobs: CronJobs;
  type: "mission_control" | "satellite";
}): boolean => {
  // If there was an error we want to inform
  if ("Err" in segmentStatus) {
    return true;
  }

  const {Ok: status} = segmentStatus;

  return lowCycles({status, type, cron_jobs});
};

export const filterStatuses = ({
  statuses,
  cron_jobs,
}: CollectStatuses): boolean => {
  // If there was an error we want to notify
  if ("Err" in statuses) {
    return true;
  }

  const {
    Ok: {mission_control, satellites},
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

  return satellite !== undefined;
};
