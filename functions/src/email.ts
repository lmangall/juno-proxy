import * as express from "express";
import {firestore} from "firebase-admin";
import DocumentData = firestore.DocumentData;

const mailgunApiKey: string = process.env.MAILGUN_API_KEY!;

export const sendEmail = async ({
  req,
}: {
  req: express.Request;
}): Promise<DocumentData> => {
  
  const {body} = req;
  const {from, to, subject, html, text} = body;

  console.log("EMAIL FUNCTION STARTED");
  console.log("Sending email:", {from, to, subject});
  console.log("Mailgun API Key present:", !!mailgunApiKey);

  // Validate required fields
  if (!from || !to || !subject || (!html && !text)) {
    const error = "Missing required fields: from, to, subject, and either html or text";
    console.error("❌", error);
    throw new Error(error);
  }

  try {
    // Create form data using URLSearchParams
    const params = new URLSearchParams();
    params.append("from", from);
    params.append("to", to);
    params.append("subject", subject);
    
    // Add content - prioritize html if available
    if (html) {
      params.append("html", html);
    }
    if (text) {
      params.append("text", text);
    }

    console.log("📤 Making request to Mailgun API...");

    const response = await fetch("https://api.eu.mailgun.net/v3/futura.now/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`,
      },
      body: params.toString(),
    });

    console.log("📬 Mailgun response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Mailgun API error:", errorText);
      
      throw new Error(
        `Mailgun API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const mailgunResult = await response.json() as {id?: string; message?: string};
    console.log("✅ Mailgun success:", mailgunResult);

    // Return a comprehensive response
    return {
      success: true,
      message: "Email sent successfully",
      timestamp: new Date().toISOString(),
      mailgunResponse: {
        id: mailgunResult.id || 'unknown',
        message: mailgunResult.message || 'Email queued'
      },
      emailDetails: {
        from,
        to,
        subject,
        hasHtml: !!html,
        hasText: !!text
      }
    } as DocumentData;

  } catch (error) {
    console.error("❌ Error in sendEmail function:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      emailDetails: {
        from,
        to,
        subject,
        hasHtml: !!html,
        hasText: !!text
      }
    } as DocumentData;
  }
};