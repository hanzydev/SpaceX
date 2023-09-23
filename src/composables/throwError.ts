class ErrorWithStatusCode extends Error {
    statusCode: number;

    constructor(statusCode: number, message?: string) {
        super(message);
        this.statusCode = statusCode;
    }
}

export default function (statusCode: number, message?: string) {
    throw new ErrorWithStatusCode(statusCode, message);
}
