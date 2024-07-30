export class CustomError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = "CustomError";
        this.statusCode = statusCode;
    }
}

export class ValidationError extends CustomError {
    constructor(message: string) {
        super(message, 400);
        this.name = "ValidationError";
    }
}

export class NotFoundError extends CustomError {
    constructor(message: string) {
        super(message, 404);
        this.name = "NotFoundError";
    }
}
