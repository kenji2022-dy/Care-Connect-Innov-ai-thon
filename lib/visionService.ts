import { GoogleGenerativeAI } from "@google/generative-ai";

export async function transcribePrescriptionBase64(base64Image: string) {
  // Replace with env-var in production
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey) {
    throw new Error('Missing generative API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in env.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Choose a multimodal model; adapt name if your SDK expects another model id
  // Define the transcription generation config once when creating the model.
  const transcriptionGenerationConfig = {
    temperature: 0.0,
    response_mime_type: 'application/json',
    response_schema: {
      type: 'object',
      properties: {
        patientInfo: {
          type: 'object',
          properties: { name: { type: 'string' }, details: { type: 'string' } },
        },
        prescriptionDate: { type: 'string' },
        clinicInfo: { type: 'object', properties: { name: { type: 'string' } } },
        medications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              dosage: { type: 'string' },
              usedFor: { type: 'string'},

            },
            required: ['name'],
          },
        },
        additionalAdvice: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              item: { type: 'string' },
              dosage: { type: 'string' },
              usedFor:{ type: 'string'},
            },
            required: ['item'],
          },
        },
        disclaimer: { type: 'string' },
      },
    },
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro", generationConfig: transcriptionGenerationConfig });

  // Build the structured request that many Gemini SDKs accept. This mirrors the
  // payload you provided: contents with inline image and a strict system instruction.
  // NOTE: generation_config has been moved to the model initialization to avoid
  // the 'oneof field already set' SDK error.
  const requestPayload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Transcribe this prescription according to the schema.' },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Image,
            },
          },
        ],
      },
    ],
    system_instruction: {
      parts: [
        {
          text:
            "You are a specialized AI assistant for medical prescription transcription. Your one and only task is to analyze the provided image and extract the text exactly as seen, populating the provided JSON schema. In JSON schema, there is a 'usedFor' property, fill what the tablet is used for which diseases-list all. If a field is not present, return null for that field.",
        },
      ],
    },
  }

  // Call the model. Many SDKs accept an object; if your installed SDK does not,
  // adapt this to the correct method signature. This uses the same high-level
  // `generateContent` used elsewhere in the codebase.
  const result = await model.generateContent(requestPayload as any)
  const text = result.response?.text?.() ?? result.response?.toString?.() ?? ''
  return text
}
