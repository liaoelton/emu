export type Transaction = {
    index?: number;
    sig?: number;
    txStatus: string;
    signature: string;
    slot: number;
    blockTime: number;
    meta: {
        err: any;
        fee: number;
        preBalances: number[];
        postBalances: number[];
        innerInstructions: any[];
        logMessages: string[];
        preTokenBalances: any[];
        postTokenBalances: any[];
        rewards: any[];
        status: {
            Ok: any;
        };
    };
    transaction: {
        message: {
            accountKeys: string[];
            header: {
                numReadonlySignedAccounts: number;
                numReadonlyUnsignedAccounts: number;
                numRequiredSignatures: number;
            };
            instructions: {
                accounts: number[];
                data: string;
                programIdIndex: number;
            }[];
            recentBlockhash: string;
        };
        signatures: string[];
    };
};
