import {
  CollectStatuses,
  CronJobs,
  Result,
} from "../../declarations/observatory/observatory.did.js";
import type {MailMessage} from "../types/mail.js";
import {formatTCycles} from "./cycles.utils.js";

const segmentMessage = ({
  segmentStatus,
  cron_jobs,
  segmentType,
}: {
  segmentStatus: Result;
  cron_jobs: CronJobs;
  segmentType: "Satellite" | "Mission Control";
}): MailMessage | undefined => {
  // If there was an error we want to inform
  if ("Err" in segmentStatus) {
    return {
      text: `${segmentType} status error: ${segmentStatus.Err}`,
      // eslint-disable-next-line max-len
      html: `<p>${segmentType} status error: ${segmentStatus.Err}</p>`,
    };
  }

  const {Ok: status} = segmentStatus;

  const minThreshold =
    cron_jobs.statuses.cycles_threshold[0] ?? (500_000_000_000n as const);

  if (status.status.cycles < minThreshold) {
    const link =
      segmentType === "Satellite"
        ? `https://console.juno.build/overview/?s=${status.id.toText()}`
        : "https://console.juno.build/mission-control/";

    return {
      // eslint-disable-next-line max-len
      text: `${segmentType} (${status.id.toText()}) cycles running low. ${formatTCycles(
        status.status.cycles,
      )} TCycles.`,
      // eslint-disable-next-line max-len
      html: `<p>${segmentType} (<a href="${link}" target="_blank" rel="noopener noreferrer">${status.id.toText()}</a>) cycles running low. ${formatTCycles(
        status.status.cycles,
      )} TCycles.</p>`,
    };
  }

  return undefined;
};

export const messages = ({
  statuses,
  cron_jobs,
  timestamp,
}: CollectStatuses): MailMessage[] => {
  const at = new Date(Number(timestamp / 1_000_000n));
  const date = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "long",
  }).format(at);

  const watermark: MailMessage = {
    text: `Status at ${date}.`,
    html: `<p><small>Status at ${date}</small></p>
<p><a href="https://console.juno.build" target="_blank" rel="noopener noreferrer"><small>Open Juno Console</small></a></p>`,
  };

  // If there was an error we want to notify
  if ("Err" in statuses) {
    return [
      {
        text: "The Observatory was not able to call your mission control.",
        // eslint-disable-next-line max-len
        html: "<p>The Observatory was not able to call your mission control.</p>",
      },
      watermark,
    ];
  }

  const {
    Ok: {mission_control, satellites},
  } = statuses;

  const messages: (MailMessage | undefined)[] = [];

  messages.push(
    segmentMessage({
      segmentStatus: mission_control,
      cron_jobs,
      segmentType: "Mission Control",
    }),
  );

  (satellites[0] ?? []).forEach((satellite) =>
    messages.push(
      segmentMessage({
        segmentStatus: satellite,
        cron_jobs,
        segmentType: "Satellite",
      }),
    ),
  );

  return [
    ...(messages.filter((msg) => msg !== undefined) as MailMessage[]),
    watermark,
  ];
};

export const mailContent = (statuses: CollectStatuses): MailMessage =>
  messages(statuses).reduce(
    (acc, next) => ({
      text: `${acc.text}\n${next.text}`,
      html: `${acc.html}<br/>${next.html}`,
    }),
    {text: "", html: ""},
  );
