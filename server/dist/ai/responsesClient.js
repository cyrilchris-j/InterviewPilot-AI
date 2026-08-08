import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { AiError } from "./aiError.js";
/**
 * Thin wrapper over the OpenAI Responses API.
 *
 * Structured outputs are enforced with a strict JSON schema derived from a
 * Zod schema, so every call returns validated, typed JSON. Streaming is
 * supported through {@link stream} and can be exposed per-service later.
 */
export class OpenAIResponsesClient {
    model;
    client;
    constructor(apiKey, model) {
        this.model = model;
        this.client = new OpenAI({ apiKey, maxRetries: 0, timeout: 3000 });
    }
    get modelName() {
        return this.model;
    }
    async create(request) {
        try {
            const response = await this.client.responses.parse({
                model: this.model,
                instructions: request.instructions,
                input: request.input,
                text: { format: zodTextFormat(request.schema, request.name) }
            });
            const parsed = response.output_parsed;
            if (parsed === null || parsed === undefined) {
                throw new AiError(`Structured output "${request.name}" returned no parseable content.`);
            }
            return parsed;
        }
        catch (error) {
            if (error instanceof AiError)
                throw error;
            throw new AiError(`OpenAI Responses API request "${request.name}" failed.`, error);
        }
    }
    /**
     * Streams output text deltas from the model. Intended for future UI
     * streaming; the interview flow currently uses the non-streaming path.
     */
    async *stream(request) {
        try {
            const stream = this.client.responses.stream({
                model: this.model,
                instructions: request.instructions,
                input: request.input
            });
            for await (const event of stream) {
                if (event.type === "response.output_text.delta") {
                    yield event.delta;
                }
            }
        }
        catch (error) {
            throw new AiError("OpenAI Responses API stream failed.", error);
        }
    }
}
