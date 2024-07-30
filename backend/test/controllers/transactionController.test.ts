import express, { Express } from "express";
import request from "supertest";
import { errorHandler } from "../../src/middlewares/errorHandler";
import transactionRoutes from "../../src/routes/transactionRoutes";
import { connect_to_db, disconnect_from_db } from "../../src/utils/db";

describe("TransactionController", () => {
    let app: Express;

    beforeAll(async () => {
        app = express();
        app.use(express.json());
        app.use("/transactions", transactionRoutes);
        app.use(errorHandler);
        await connect_to_db();
    });

    describe("getTransaction", () => {
        it("should return 400 for an invalid signature", async () => {
            const invalidSignature = "invalidSignature123";
            const response = await request(app).get(`/transactions/${invalidSignature}`);
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("getTransactions", () => {
        it("should return 400 for an invalid block parameter", async () => {
            const response = await request(app).get("/transactions?block=not-a-number&page=1&limit=10");
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 for an invalid page parameter", async () => {
            const response = await request(app).get("/transactions?block=1&page=-1&limit=10");
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return 400 for an invalid limit parameter", async () => {
            const response = await request(app).get("/transactions?block=1&page=1&limit=0");
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    afterAll(async () => {
        await disconnect_from_db();
    });
});
