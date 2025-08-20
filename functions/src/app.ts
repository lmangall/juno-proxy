import cors from "cors";
import express from "express";
import {sendEmail} from "./email.js";
import {proxy} from "./proxy.js";

const app = express();
app.use(express.json());
app.use(cors({origin: true}));

const token: string = process.env.NOTIFICATIONS_TOKEN!;

const assertToken = ({
  req,
  res,
}: {
  req: express.Request;
  res: express.Response;
}): {valid: boolean} => {
  const authorization = req.get("authorization");
  if (authorization !== `Bearer ${token}`) {
    res.status(500).send("Access restricted.");
    return {valid: false};
  }
  return {valid: true};
};

app.post("/notifications/email", async (req, res): Promise<void> => {
  const { valid } = assertToken({ req, res });
  if (!valid) {
    // Just return - response already sent by assertToken
    return;
  }
  
  try {
    await proxy({ req, res, fn: sendEmail });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

export {app};