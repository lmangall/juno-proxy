import * as express from "express";
import {firestore} from "firebase-admin";
import DocumentData = firestore.DocumentData;

export const sendEmail = async ({
  req,
}: {
  req: express.Request;
}): Promise<DocumentData> => {
  
  const {body} = req;
  
  try {
    console.log("🚀 EMAIL FUNCTION STARTED - GUARANTEED VERSION");
    console.log("📧 Request body:", JSON.stringify(body || {}, null, 2));
    console.log("📧 Request headers:", JSON.stringify(req.headers || {}, null, 2));
    
    // Absolutely guarantee we return something
    const response = {
      status: "success",
      message: "Email function reached successfully",
      timestamp: new Date().toISOString(),
      receivedData: body || {},
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'unknown'
    };
    
    console.log("✅ About to return response:", JSON.stringify(response, null, 2));
    
    return response as DocumentData;
    
  } catch (error) {
    console.error("❌ Error in email function:", error);
    
    // Even if there's an error, return a proper response instead of throwing
    return {
      status: "error",
      message: "Function had an error but handled it",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    } as DocumentData;
  }
};