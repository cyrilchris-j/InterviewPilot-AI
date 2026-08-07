export function validateBody(schema) {
    return (request, _response, next) => {
        const parsed = schema.safeParse(request.body);
        if (!parsed.success) {
            next(parsed.error);
            return;
        }
        request.body = parsed.data;
        next();
    };
}
