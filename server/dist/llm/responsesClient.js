import { config } from "../config.js";
export class ResponsesClient {
    get enabled() {
        return Boolean(config.openaiApiKey);
    }
    async structured(name, instructions, input, schema) {
        if (!this.enabled)
            return undefined;
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.openaiApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: config.openaiModel,
                instructions,
                input: JSON.stringify(input),
                text: {
                    format: {
                        type: "json_schema",
                        name,
                        strict: true,
                        schema
                    }
                }
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI Responses API failed: ${response.status} ${errorText}`);
        }
        const payload = (await response.json());
        const text = payload.output_text ?? payload.output?.flatMap((item) => item.content ?? []).find((content) => content.text)?.text;
        if (!text) {
            return undefined;
        }
        return JSON.parse(text);
    }
}
