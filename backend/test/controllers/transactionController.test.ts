import {
    GetVersionedBlockConfig,
    GetVersionedTransactionConfig,
    VersionedBlockResponse,
    VersionedTransactionResponse,
} from "@solana/web3.js";
import express, { Express } from "express";
import request from "supertest";
import { errorHandler } from "../../src/middlewares/errorHandler";
import Transaction from "../../src/models/transaction";
import transactionRoutes from "../../src/routes/transactionRoutes";
import * as blockService from "../../src/services/blockService";
import { connect_to_db, disconnect_from_db } from "../../src/utils/db";
import * as solanaConnection from "../../src/utils/solanaConnection";
jest.mock("../../src/utils/solanaConnection");
jest.mock("../../src/services/blockService");
const mockBlock = (slot: number) => ({
    slot: slot,
    blockHeight: slot - 1,
    blockTime: "2023-01-01T00:00:00.000Z",
    blockhash: "mockBlockhash",
    parentSlot: slot - 1,
    tx_sigs: ["1", "2", "3"],
});

const mockTransaction = (signature: string) => ({
    signature: [signature],
    slot: 123,
    blockTime: 1672531200,
    meta: {
        logMessages: ["log1", "log2"],
        status: { Ok: null },
        fee: 5000,
        computeUnitsConsumed: 1000,
    },
    version: 0,
    transaction: {
        signatures: [signature],
        message: {
            version: "1",
            accountKeys: ["key1", "key2"],
            instructions: [],
            recentBlockhash: "blockhash",
            header: {
                numRequiredSignatures: 1,
                numReadonlySignedAccounts: 0,
                numReadonlyUnsignedAccounts: 1,
            },
            staticAccountKeys: [],
            compiledInstructions: [],
            addressTableLookups: [],
            getAccountKeys: () => ({
                staticAccountKeys: [],
                accountKeysFromLookups: [],
            }),
            isAccountSigner: () => false,
            isAccountWritable: () => false,
            isProgramId: () => false,
            programIds: [],
            getVersion: () => "1",
            nonProgramIds: [],
            serialize: () => Buffer.from([]),
        },
    },
});

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
        afterEach(async () => {
            await Transaction.deleteMany({});
        });

        it("should return 400 for an invalid signature", async () => {
            const invalidSignature = "invalidSignature123";
            const response = await request(app).get(`/transactions/${invalidSignature}`);
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it("should return a transaction with correct properties", async () => {
            const signature = "3vQzT1J2X5G7H9K8L2M1N4P6Q8R7S5T6U9V2W3X4Y5Z6";
            const expectedTransaction = mockTransaction(signature);
            jest.spyOn(solanaConnection.connection, "getTransaction").mockImplementation(
                (
                    signature: string,
                    rawConfig: GetVersionedTransactionConfig
                ): Promise<VersionedTransactionResponse> => {
                    const transaction = mockTransaction(signature);
                    return Promise.resolve(transaction as unknown as VersionedTransactionResponse);
                }
            );
            const response = await request(app).get(`/transactions/${signature}`);
            console.log(response.body);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("slot", expectedTransaction.slot);
        });

        it("should increase the transaction count in the database by 1", async () => {
            const initialCount = await Transaction.countDocuments().exec();

            const signature = "3vQzT1J2X5G7H9K8L2M1N4P6Q8R7S5T6U9V2W3X4Y5Z6";
            jest.spyOn(solanaConnection.connection, "getTransaction").mockImplementation(
                (
                    signature: string,
                    rawConfig: GetVersionedTransactionConfig
                ): Promise<VersionedTransactionResponse> => {
                    const transaction = mockTransaction(signature);
                    return Promise.resolve(transaction as unknown as VersionedTransactionResponse);
                }
            );

            await request(app).get(`/transactions/${signature}`);

            const finalCount = await Transaction.countDocuments().exec();
            expect(finalCount).toBe(initialCount + 1);
        });
    });

    describe("getTransactions", () => {
        afterEach(async () => {
            await Transaction.deleteMany({});
        });

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

        it("should return a list of transactions with correct properties", async () => {
            const expectedTransactions = [mockTransaction("1"), mockTransaction("2"), mockTransaction("3")];
            (blockService.fetchBlockWithRetries as jest.Mock).mockImplementation((slot) =>
                Promise.resolve(mockBlock(slot))
            );
            jest.spyOn(solanaConnection.connection, "getBlock").mockImplementation(
                (slot: number, rawConfig: GetVersionedBlockConfig): Promise<VersionedBlockResponse> => {
                    const block = {
                        slot: slot,
                        blockHeight: slot - 1,
                        blockTime: "2023-01-01T00:00:00.000Z",
                        blockhash: "mockBlockhash",
                        parentSlot: slot - 1,
                        tx_sigs: ["1", "2", "3"],
                    };
                    return Promise.resolve(block as unknown as VersionedBlockResponse);
                }
            );
            jest.spyOn(solanaConnection.connection, "getTransaction").mockImplementation(
                (
                    signature: string,
                    rawConfig: GetVersionedTransactionConfig
                ): Promise<VersionedTransactionResponse> => {
                    const transaction = mockTransaction(signature);
                    return Promise.resolve(transaction as unknown as VersionedTransactionResponse);
                }
            );

            const response = await request(app).get("/transactions?block=1&page=1&limit=3");
            expect(response.statusCode).toBe(200);
            expect(response.body.transactions).toHaveLength(3);
            expect(response.body.transactions.map((tx: any) => tx.transaction.signatures).sort()).toEqual(
                expectedTransactions.map((tx: any) => tx.transaction.signatures).sort()
            );
        });
    });

    afterAll(async () => {
        await disconnect_from_db();
    });
});
