import { Connection, TransactionSignature, VersionedTransactionResponse } from "@solana/web3.js";
import Transaction from "../models/transaction";
import { determineTxStatus } from "../utils/determineTxStatus";

const formatTransactionResponse = (transaction: any): any => {
    const { meta, transaction: transactionData, version } = transaction;
    const txStatus = determineTxStatus(meta);
    return {
        txStatus,
        slot: transaction.slot,
        blockTime: transaction.blockTime,
        meta: meta,
        transaction: transactionData,
        version: version,
    };
};

export const findOrCreateTransactionBySignature = async (
    connection: Connection,
    signature: TransactionSignature
): Promise<any> => {
    console.log("Searching for transaction with signature", signature);
    let transactionInfo = await Transaction.findOne({ signatures: signature }).exec();
    if (transactionInfo) {
        console.log("Transaction found in DB");
    } else {
        console.log("Transaction not found in DB, fetching from RPC");
        const transaction = (await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0,
        })) as VersionedTransactionResponse;

        if (!transaction) {
            console.log("Transaction not found");
            return null;
        }

        const transactionData = {
            signatures: transaction.transaction.signatures,
            slot: transaction.slot,
            blockTime: transaction.blockTime ? new Date(transaction.blockTime * 1000).toISOString() : null,
            meta: transaction.meta,
            transaction: transaction.transaction,
            version: transaction.version,
        };
        transactionInfo = new Transaction(transactionData);
        await transactionInfo.save();
    }

    return formatTransactionResponse(transactionInfo);
};
