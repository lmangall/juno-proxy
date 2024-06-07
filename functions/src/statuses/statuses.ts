import {nonNullish} from "@junobuild/utils";
import {error, log} from "firebase-functions/logger";
import {observatoryActor} from "../utils/actor.utils.js";
import {mailContent} from "../utils/html.utils.js";
import {sendMail} from "../utils/mail.utils.js";
import {metadataEmail} from "../utils/metadata.utils.js";
import {filterStatuses} from "../utils/status.utils.js";

export const collectStatuses = async () => {
  try {
    const oneMin = 60_000_000_000n;

    const {list_statuses} = await observatoryActor();
    const statuses = await list_statuses({
      time_delta: [15n * oneMin],
    });

    const filteredStatuses = statuses.filter(filterStatuses);

    const notifications = filteredStatuses.filter(({cron_jobs: {metadata}}) =>
      nonNullish(metadataEmail(metadata)),
    );

    if (notifications.length === 0) {
      log("No notifications collected.");
      return;
    }

    log(`Sending ${notifications.length} notifications...`);

    const promises = notifications.map((statuses) =>
      sendMail({
        mailTo: metadataEmail(statuses.cron_jobs.metadata),
        mailContent: mailContent(statuses),
      }),
    );

    await Promise.race(promises);

    log("Notifications sent.");
  } catch (err: unknown) {
    error(err);
  }
};
