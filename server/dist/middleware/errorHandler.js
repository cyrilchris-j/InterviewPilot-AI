export const errorHandler = (error, _request, response, _next) => {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    response.status(400).json({
        reply: message,
        done: false
    });
};
