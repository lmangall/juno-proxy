// eslint-disable-next-line max-len
import type {CollectStatuses} from "../../declarations/observatory/observatory.did.js";
import {observatoryActor} from "../utils/actor.utils.js";
import {mailContent} from "../utils/html.utils.js";
import {sendMail} from "../utils/mail.utils.js";
import {metadataEmail} from "../utils/metadata.utils.js";
import {filterStatuses} from "../utils/status.utils.js";

export const collectStatuses = async () => {
  try {
    const oneMin = 60_000_000_000n;

    const actor = await observatoryActor();
    const statuses = await actor.collect_statuses({
      time_delta: [15n * oneMin],
    });

    const filteredStatuses: CollectStatuses[] = statuses.filter(filterStatuses);

    const notifications = filteredStatuses.filter(
      ({cron_jobs: {metadata}}) => metadataEmail(metadata) !== undefined,
    );

    const promises = notifications.map((statuses) =>
      sendMail({
        mailTo: metadataEmail(statuses.cron_jobs.metadata),
        mailContent: mailContent(statuses),
      }),
    );

    await Promise.race(promises);
  } catch (err: unknown) {
    console.error(err);
  }

  return null;
};
