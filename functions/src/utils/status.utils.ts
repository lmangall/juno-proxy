import type {
  CollectStatuses,
  CronJobs,
  Result,
} from "../../declarations/observatory/observatory.did.js";

const filterSegmentStatus = ({
  segmentStatus,
  cron_jobs,
}: {
  segmentStatus: Result;
  cron_jobs: CronJobs;
}): boolean => {
  // If there was an error we want to inform
  if ("Err" in segmentStatus) {
    return true;
  }

  const {Ok: status} = segmentStatus;

  return (
    status.status.cycles <
    (cron_jobs.statuses.cycles_threshold[0] ?? 500_000_000_000n)
  );
};

export const filterStatuses = ({statuses, cron_jobs}: CollectStatuses) => {
  // If there was an error we want to notify
  if ("Err" in statuses) {
    return true;
  }

  const {
    Ok: {mission_control, satellites},
  } = statuses;

  // Mission control needs to be reported
  if (filterSegmentStatus({segmentStatus: mission_control, cron_jobs})) {
    return true;
  }

  const satellite = (satellites[0] ?? []).find((satellite) =>
    filterSegmentStatus({segmentStatus: satellite, cron_jobs}),
  );

  return satellite !== undefined;
};
