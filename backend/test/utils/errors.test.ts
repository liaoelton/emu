import { CustomError, NotFoundError, ValidationError } from "../../src/utils/errors";

describe("CustomError", () => {
    it("should correctly set message and default statusCode", () => {
        const error = new CustomError("Custom error message");
        expect(error.message).toBe("Custom error message");
        expect(error.statusCode).toBe(500);
        expect(error.name).toBe("CustomError");
    });
});

describe("ValidationError", () => {
    it("should correctly set message and statusCode to 400", () => {
        const error = new ValidationError("Validation error message");
        expect(error.message).toBe("Validation error message");
        expect(error.statusCode).toBe(400);
        expect(error.name).toBe("ValidationError");
    });
});

describe("NotFoundError", () => {
    it("should correctly set message and statusCode to 404", () => {
        const error = new NotFoundError("Not found error message");
        expect(error.message).toBe("Not found error message");
        expect(error.statusCode).toBe(404);
        expect(error.name).toBe("NotFoundError");
    });
});
