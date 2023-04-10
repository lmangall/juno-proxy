import {Ed25519KeyIdentity} from "@dfinity/identity";

const key = Ed25519KeyIdentity.generate();

const principal = key.getPrincipal().toText();
const token = key.toJSON();

console.log("Principal:", principal);
console.log("Key:", JSON.stringify(token));

// firebase functions:secrets:set CRON_CONTROLLER