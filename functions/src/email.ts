import * as express from "express";
import {firestore} from "firebase-admin";
import * as functions from "firebase-functions";
import DocumentData = firestore.DocumentData;

const resendApiKey: string = functions.config().mail.resend.api_key;

export const sendEmail = async ({
  req: {body},
}: {
  req: express.Request;
}): Promise<DocumentData> => {
  const {from, to, subject, html, text} = body;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({from, to, subject, html, text}),
  });

  if (!response.ok) {
    throw new Error(
      // eslint-disable-next-line max-len
      `Response not ok. Status ${response.status}. Message ${response.statusText}.`,
    );
  }

  return (await response.json()) as DocumentData;
};
