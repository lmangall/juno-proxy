// eslint-disable-next-line max-len
import type {CollectStatuses} from "../../declarations/observatory/observatory.did.js";
import {observatoryActor} from "../utils/actor.utils.js";
import {sendMail} from "../utils/mail.utils.js";
import {filterStatuses} from "../utils/status.utils.js";

export const collectStatuses = async () => {
  try {
    const oneMin = 60_000_000_000n;

    const actor = await observatoryActor();
    const statuses = await actor.collect_statuses({
      time_delta: [oneMin],
    });

    const filteredStatuses: CollectStatuses[] = statuses.filter(filterStatuses);

    console.log("Statuses collected: ", filteredStatuses);

    const metadataKey = ({
      metadata,
      key,
    }: {
      metadata: [string, string][];
      key: string;
    }): string => new Map(metadata).get(key) ?? "";

    const notifications = filteredStatuses.filter(
      ({cron_jobs: {metadata}}) =>
        metadataKey({metadata, key: "email"}) !== undefined,
    );

    console.log("Notifications: ", notifications);

    const promises = notifications.map(({cron_jobs: {metadata}}) =>
      sendMail(metadataKey({metadata, key: "email"})),
    );

    await Promise.all(promises);

    console.log("Email(s) sent.");
  } catch (err: unknown) {
    console.error(err);
  }

  return null;
};
