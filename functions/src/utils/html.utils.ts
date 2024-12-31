import {nonNullish} from "@dfinity/utils";
import {
  CronJobs,
  ListStatuses,
  Result,
} from "../../declarations/observatory/observatory.did.js";
import type {MailMessage} from "../types/mail.js";
import {formatTCycles} from "./cycles.utils.js";
import {metadataName} from "./metadata.utils.js";
import {lowCycles} from "./segment.utils.js";

const segmentMessage = ({
  segmentStatus,
  cron_jobs,
  type,
}: {
  segmentStatus: Result;
  cron_jobs: CronJobs;
  type: "mission_control" | "satellite" | "orbiter";
}): MailMessage | undefined => {
  let segmentLabel: string;
  switch (type) {
    case "satellite":
      segmentLabel = "Satellite";
      break;
    case "orbiter":
      segmentLabel = "Orbiter";
      break;
    default:
      segmentLabel = "Mission Control";
  }

  // If there was an error we want to inform
  if ("Err" in segmentStatus) {
    return {
      text: `${segmentLabel} status error: ${segmentStatus.Err}`,
      html: `<li>${segmentLabel} status error: ${segmentStatus.Err}</li>`,
    };
  }

  const {Ok: status} = segmentStatus;

  if (lowCycles({status, type, cron_jobs})) {
    let link: string;
    switch (type) {
      case "satellite":
        link = `https://console.juno.build/satellite/?s=${status.id.toText()}`;
        break;
      case "orbiter":
        link = "https://console.juno.build/analytics/";
        break;
      default:
        link = "https://console.juno.build/mission-control/";
    }

    const name = metadataName(status.metadata?.[0] ?? []);
    const linkText = name !== "" ? name : status.id.toText();

    return {
      // eslint-disable-next-line max-len
      text: `${segmentLabel} (${status.id.toText()}) cycles running low (${formatTCycles(
        status.status.cycles,
      )} TCycles).`,
      // eslint-disable-next-line max-len
      html: `<li>${segmentLabel} (<a href="${link}" target="_blank" rel="noopener noreferrer">${linkText}</a>) cycles running low (${formatTCycles(
        status.status.cycles,
      )} TCycles)</li>`,
    };
  }

  return undefined;
};

const sentence =
  // eslint-disable-next-line max-len
  "The Juno's Observatory has detected that one or more of your modules are running low on cycles. To prevent any service interruptions, we recommend that you top up your resources immediately.";

const intro: MailMessage[] = [
  {
    text: "Hey,",
    html: "<p>Hey,</p>",
  },
  {
    text: sentence,
    html: `<p>${sentence}</p>`,
  },
];

const thanks: MailMessage[] = [
  {
    text: "Thank you,",
    html: "<p>Thank you,<br/>Juno</p>",
  },
  {
    text: "Juno",
    html: "<hr />",
  },
];

export const messages = ({
  statuses,
  cron_jobs,
  timestamp,
}: ListStatuses): MailMessage[] => {
  const at = new Date(Number(timestamp / 1_000_000n));
  const date = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "long",
  }).format(at);

  const watermark: MailMessage = {
    text: `Status collected at ${date}.`,
    html: `<p><small>Status collected at ${date}</small><br/>
<a href="https://console.juno.build" target="_blank" rel="noopener noreferrer"><small>Open Console</small></a></p>`,
  };

  // If there was an error we want to notify
  if ("Err" in statuses) {
    return [
      ...intro,
      {
        text: "Juno's Observatory was not able to call your mission control.",
        // eslint-disable-next-line max-len
        html: "<p>Juno's Observatory was not able to call your mission control.</p>",
      },
      ...thanks,
      watermark,
    ];
  }

  const {
    Ok: {mission_control, satellites, orbiters},
  } = statuses;

  const messages: (MailMessage | undefined)[] = [];

  messages.push(
    segmentMessage({
      segmentStatus: mission_control,
      cron_jobs,
      type: "mission_control",
    }),
  );

  (satellites[0] ?? []).forEach((satellite) =>
    messages.push(
      segmentMessage({
        segmentStatus: satellite,
        cron_jobs,
        type: "satellite",
      }),
    ),
  );

  (orbiters[0] ?? []).forEach((orbiter) =>
    messages.push(
      segmentMessage({
        segmentStatus: orbiter,
        cron_jobs,
        type: "orbiter",
      }),
    ),
  );

  const contentMessages = messages.filter(nonNullish) as MailMessage[];

  return [
    ...intro,
    {
      text: contentMessages.map(({text}) => text).join("\n"),
      html: `<ul>${contentMessages.map(({html}) => html).join("")}</ul>`,
    },
    ...thanks,
    watermark,
  ];
};

export const mailContent = (statuses: ListStatuses): MailMessage =>
  messages(statuses).reduce(
    (acc, next) => ({
      text: `${acc.text}\n${next.text}`,
      html: `${acc.html}${next.html}`,
    }),
    {text: "", html: ""},
  );
