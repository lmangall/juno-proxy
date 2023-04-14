// eslint-disable-next-line max-len
import type {ListStatuses} from "../../declarations/observatory/observatory.did.js";
import {observatoryActor} from "../utils/actor.utils.js";
import {mailContent} from "../utils/html.utils.js";
import {sendMail} from "../utils/mail.utils.js";
import {metadataEmail} from "../utils/metadata.utils.js";
import {filterStatuses} from "../utils/status.utils.js";

export const collectStatuses = async () => {
  try {
    const oneMin = 60_000_000_000n;

    const actor = await observatoryActor();
    const statuses = await actor.list_statuses({
      time_delta: [15n * oneMin],
    });

    const filteredStatuses: ListStatuses[] = statuses.filter(filterStatuses);

    const notifications = filteredStatuses.filter(
      ({cron_jobs: {metadata}}) => metadataEmail(metadata) !== undefined,
    );

    if (notifications.length === 0) {
      return;
    }

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
};
