import express, { Express } from "express";
import request from "supertest";
import { errorHandler } from "../../src/middlewares/errorHandler";
import searchRoutes from "../../src/routes/searchRoutes";
import { connect_to_db, disconnect_from_db } from "../../src/utils/db";

describe("SearchController", () => {
    let app: Express;

    beforeAll(async () => {
        app = express();
        app.use(express.json());
        app.use("/search", searchRoutes);
        app.use(errorHandler);
        await connect_to_db();
    });

    describe("search", () => {
        it("should return 400 for an invalid query format", async () => {
            const invalidQuery = "not-a-valid-format";
            const response = await request(app).get(`/search/${invalidQuery}`);
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    afterAll(async () => {
        await disconnect_from_db();
    });
});
