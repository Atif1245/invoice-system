import { GoogleGenerativeAI } from "@google/generative-ai";

// Converts a File object to the generative parts structure
async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export const processImageWithGemini = async (file, apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
     throw new Error("Missing API Key. Please paste your Google AI API Key into the sidebar box.");
  }
  const genAI = new GoogleGenerativeAI(apiKey.trim());
  // use the fast flash model specialized in visual reasoning
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a professional supply chain data extraction assistant processing purchase orders and invoices.

FIRST: Analyze the image. Is it a legible Invoice, Purchase Order, Receipt, or Financial Document?
If the image is NOT a valid financial document (e.g. it's a person, an animal, a random object), or if the text is completely unreadable, you MUST return exactly this JSON and nothing else:
{
  "isInvoice": false,
  "error": "Explain why it was rejected (e.g., 'This appears to be a picture of a dog, not a valid document' or 'The text is too blurry to read')."
}

If the image IS a valid invoice or purchase order, return exactly valid JSON matching this exact schema:
{
  "isInvoice": true,
  "poNumber": "Extracted PO Number as string",
  "date": "Extracted Date as string (DD-MM-YYYY)",
  "company": "Company / Vendor Name as string",
  "lineItems": [
    {
      "sNo": "Serial number as string",
      "catPartNo": "Catalog/Part Number as string",
      "nomenclature": "Description/Nomenclature of the item as string",
      "country": "Country of origin as string",
      "spareTypes": "Spare Types as string",
      "brand": "Brand as string",
      "au": "Account Unit or Unit of Measure (A/U) as string",
      "qty": "Quantity as a string",
      "rate": "Rate or Unit Price including or excluding GST as a string",
      "total": "Total amount for this specific line item as a string",
      "naNo": "NA No & Date as string"
    }
  ],
  "tax": "Extracted total tax/GST amount as a string",
  "total": "Extracted grand total invoice/PO amount as a string"
}
Do not include any markdown formatting, backticks, or explanation. Only return raw valid JSON.`;

  const imagePart = await fileToGenerativePart(file);

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    try {
      // Primary Strip
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      return JSON.parse(cleanJson);
    } catch (parseError) {
      // Fallback regex to just find the curly braces anywhere in the string
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error("AI did not return correct JSON formatting. Raw text was: " + responseText.slice(0,100));
    }
  } catch (apiError) {
    if (apiError.message && apiError.message.includes("API key not valid")) {
      throw new Error("Your API Key is invalid. Please make sure you copied the full key exactly with no spaces.");
    }
    throw apiError;
  }
};
