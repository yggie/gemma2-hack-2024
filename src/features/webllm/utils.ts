export function cleanLLMJson(json: string) {
  return json
    .replace(/^```json/, "")
    .replace(/```$/, "")
    .replaceAll(/,\s*\]/g, "]")
    .replaceAll(/,\s*}/g, "}");
}
