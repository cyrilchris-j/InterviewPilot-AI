export const requestLogger = (request, _response, next) => {
    const started = Date.now();
    request.on("close", () => {
        const elapsed = Date.now() - started;
        console.log(`${request.method} ${request.path} ${elapsed}ms`);
    });
    next();
};
