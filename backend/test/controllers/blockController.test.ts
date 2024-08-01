import express, { Express } from "express";
import request from "supertest";
import { errorHandler } from "../../src/middlewares/errorHandler";
import blockRoutes from "../../src/routes/blockRoutes";
import * as blockService from "../../src/services/blockService";
import { connect_to_db, disconnect_from_db } from "../../src/utils/db";
import * as solanaConnection from "../../src/utils/solanaConnection";
jest.mock("../../src/services/blockService");
jest.mock("../../src/utils/solanaConnection");
const mockBlock = (slot: number) => ({
    slot: slot,
    blockHeight: slot - 1,
    blockTime: "2023-01-01T00:00:00.000Z",
    blockhash: "mockBlockhash",
    parentSlot: slot - 1,
    tx_sigs: ["mockSignature1", "mockSignature2"],
});

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

        it("should return a block with correct properties", async () => {
            const slot = 123;
            const expectedBlock = mockBlock(slot);
            (blockService.fetchBlockWithRetries as jest.Mock).mockResolvedValue(expectedBlock);

            const response = await request(app).get(`/blocks/${slot}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("blockHeight", expectedBlock.blockHeight);
            expect(response.body).toHaveProperty("blockTime", expectedBlock.blockTime);
            expect(response.body).toHaveProperty("blockhash", expectedBlock.blockhash);
            expect(response.body).toHaveProperty("parentSlot", expectedBlock.parentSlot);
            expect(response.body).toHaveProperty("slot", expectedBlock.slot);
            expect(response.body).toHaveProperty("tx_sigs", expectedBlock.tx_sigs);
        });
    });

    describe("getBlocks", () => {
        it("should return 400 for invalid query parameters", async () => {
            const response = await request(app).get("/blocks?end=abc");
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return a list of blocks with correct length and end slot", async () => {
            const expectedBlocks = [mockBlock(1), mockBlock(2), mockBlock(3), mockBlock(4), mockBlock(5)];
            (blockService.fetchBlockWithRetries as jest.Mock).mockImplementation((slot) =>
                Promise.resolve(mockBlock(slot))
            );
            jest.spyOn(solanaConnection.connection, "getBlocks").mockResolvedValue(
                expectedBlocks.map((block) => block.slot)
            );
            const response = await request(app).get("/blocks?end=5");
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(5);
            expect(response.body[response.body.length - 1].slot).toBe(expectedBlocks[expectedBlocks.length - 1].slot);
        });

        it("should return a list of blocks with correct properties", async () => {
            const expectedBlocks = [mockBlock(1), mockBlock(2), mockBlock(3), mockBlock(4), mockBlock(5)];
            (blockService.fetchBlockWithRetries as jest.Mock).mockImplementation((slot) =>
                Promise.resolve(mockBlock(slot))
            );
            jest.spyOn(solanaConnection.connection, "getBlocks").mockResolvedValue(
                expectedBlocks.map((block) => block.slot)
            );
            const response = await request(app).get("/blocks?end=5");
            expect(response.statusCode).toBe(200);

            expect(response.body[0]).toHaveProperty("blockHeight", expectedBlocks[0].blockHeight);
            expect(response.body[0]).toHaveProperty("blockTime", expectedBlocks[0].blockTime);
            expect(response.body[0]).toHaveProperty("blockhash", expectedBlocks[0].blockhash);
            expect(response.body[0]).toHaveProperty("parentSlot", expectedBlocks[0].parentSlot);
            expect(response.body[0]).toHaveProperty("slot", expectedBlocks[0].slot);
            expect(response.body[0]).toHaveProperty("tx_sigs", expectedBlocks[0].tx_sigs);
        });
    });
});

afterAll((done) => {
    disconnect_from_db();
    done();
});
