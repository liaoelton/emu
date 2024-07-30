import express, { Express } from "express";
import request from "supertest";
import { errorHandler } from "../../src/middlewares/errorHandler";
import blockRoutes from "../../src/routes/blockRoutes";
import { connect_to_db, disconnect_from_db } from "../../src/utils/db";

describe("BlockController", () => {
    let app: Express;

    beforeAll(async () => {
        app = express();
        app.use(express.json());
        app.use("/blocks", blockRoutes);
        app.use(errorHandler);
        await connect_to_db();
    });

    describe("getBlock", () => {
        it("should return 400 for an invalid slot number", async () => {
            const response = await request(app).get("/blocks/not-a-number");
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("getBlocks", () => {
        it("should return 400 for invalid query parameters", async () => {
            const response = await request(app).get("/blocks?end=abc");
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });
});

afterAll((done) => {
    disconnect_from_db();
    done();
});
