/**
 * Parses JSON from a potential markdown-wrapped LLM response.
 */
export const parseLLMResponse = (rawText) => {
  try {
    // Attempt to parse directly first
    return JSON.parse(rawText);
  } catch (e) {
    // If it fails, look for JSON blocks in markdown
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (innerError) {
        console.error("Failed to parse JSON within markdown block", innerError);
      }
    }
  }
  
  // Last resort: find anything that looks like a JSON object/array
  const braceMatch = rawText.match(/[\{\[]([\s\S]*)[\}\]]/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch (finalError) {
      console.error("Failed to parse JSON using brace matching", finalError);
    }
  }

  throw new Error("Could not parse JSON from LLM response");
};
