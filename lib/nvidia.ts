interface AIServiceResult {
  service: string;
  problem: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  explanation: string;
}

const SYSTEM_PROMPT = `You are a service identification assistant for a local services cooperative platform.
Given a customer's problem description, identify the most appropriate service category and provide structured information.

Available services: Plumbing, Electrical, AC Repair, Cleaning, Carpentry

You MUST respond with ONLY a valid JSON object in this exact format:
{
  "service": "one of: Plumbing, Electrical, AC Repair, Cleaning, Carpentry",
  "problem": "brief summary of the specific problem",
  "urgency": "LOW or MEDIUM or HIGH",
  "explanation": "brief explanation of why this service was identified"
}

Do not include any other text, markdown formatting, or code blocks. Only the JSON object.`;

export async function identifyService(
  description: string
): Promise<AIServiceResult | null> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  const baseUrl =
    process.env.NVIDIA_NIM_BASE_URL || "https://integrate.api.nvidia.com/v1";

  if (!apiKey) {
    console.warn("NVIDIA NIM API key not configured. AI Help unavailable.");
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: description },
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error("NVIDIA NIM API error:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) return null;

    // Parse JSON from the response
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const result: AIServiceResult = JSON.parse(cleaned);

    // Validate the service name
    const validServices = [
      "Plumbing",
      "Electrical",
      "AC Repair",
      "Cleaning",
      "Carpentry",
    ];
    if (!validServices.includes(result.service)) {
      result.service =
        validServices.find((s) =>
          result.service.toLowerCase().includes(s.toLowerCase())
        ) || result.service;
    }

    // Validate urgency
    if (!["LOW", "MEDIUM", "HIGH"].includes(result.urgency)) {
      result.urgency = "MEDIUM";
    }

    return result;
  } catch (error) {
    console.error("AI service identification error:", error);
    return null;
  }
}

export function isAIConfigured(): boolean {
  return !!process.env.NVIDIA_NIM_API_KEY;
}
