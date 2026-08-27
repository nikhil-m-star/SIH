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

const MODELS = [
  "meta/llama-3.2-11b-vision-instruct",
  "meta/llama-3.2-90b-vision-instruct",
];

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

  for (const model of MODELS) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: description },
          ],
          temperature: 0.1,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        console.error(`NVIDIA NIM model ${model} error:`, response.status);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) continue;

      // Extract JSON substring if wrapped in any text/markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const result: AIServiceResult = JSON.parse(jsonMatch[0]);

      // Validate the service name
      const validServices = [
        "Plumbing",
        "Electrical",
        "AC Repair",
        "Cleaning",
        "Carpentry",
      ];
      
      const matched = validServices.find(
        (s) => s.toLowerCase() === (result.service || "").toLowerCase()
      ) || validServices.find(
        (s) => (result.service || "").toLowerCase().includes(s.toLowerCase())
      );

      result.service = matched || "Plumbing";

      // Validate urgency
      if (!["LOW", "MEDIUM", "HIGH"].includes(result.urgency)) {
        result.urgency = "MEDIUM";
      }

      return result;
    } catch (error) {
      console.error(`AI service identification error with ${model}:`, error);
    }
  }

  return null;
}

export function isAIConfigured(): boolean {
  return !!process.env.NVIDIA_NIM_API_KEY;
}
