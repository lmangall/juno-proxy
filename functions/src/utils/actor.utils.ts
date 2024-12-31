import {
  Actor,
  HttpAgent,
  type ActorSubclass,
  type Identity,
} from "@dfinity/agent";
import {Ed25519KeyIdentity} from "@dfinity/identity";
// eslint-disable-next-line import/default, max-len
import {idlFactory} from "../../declarations/observatory/observatory.factory.did.js";

const initIdentity = (): Identity => {
  const controller = process.env.CRON_CONTROLLER as string;
  const token = JSON.parse(controller);

  return Ed25519KeyIdentity.fromParsedJson(token);
};

const icAgent = async (): Promise<HttpAgent> => {
  const identity = initIdentity();

  return await HttpAgent.create({identity, host: "https://icp-api.io"});
};

export const observatoryActor = async (): Promise<
  ActorSubclass<idlFactory>
> => {
  const canisterId = process.env.OBSERVATORY_CANISTER_ID as string;

  const agent = await icAgent();

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
