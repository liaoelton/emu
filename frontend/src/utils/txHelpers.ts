import { Transaction } from "@/types/Transaction";
import { checkIfInstructionParser, ParserType, SolanaFMParser } from "@solanafm/explorer-kit";
import { getProgramIdl } from "@solanafm/explorer-kit-idls";

export async function parseTransaction(programId: string, ixData: string) {
    try {
        const SFMIdlItem = await getProgramIdl(programId);
        if (!SFMIdlItem) {
            throw new Error(`No IDL found for program ID: ${programId}`);
        }

        const parser = new SolanaFMParser(SFMIdlItem, programId);
        const instructionParser = parser.createParser(ParserType.INSTRUCTION);

        if (!instructionParser || !checkIfInstructionParser(instructionParser)) {
            throw new Error(`Failed to create a valid instruction parser for program ID: ${programId}`);
        }

        const decodedData = instructionParser.parseInstructions(ixData);
        return { SFMIdlItem, decodedData };
    } catch (error) {
        console.error(`Error parsing transaction: ${(error as Error).message}`);
        return { SFMIdlItem: null, decodedData: null };
    }
}

export const getTxInstructions = async (
    transaction: Transaction | null
): Promise<{ ixs: any[]; programs: Record<string, string> }> => {
    if (!transaction) {
        return { ixs: [], programs: {} };
    }
    const accountKeys = transaction.transaction.message.accountKeys;
    const instructions = transaction.transaction.message.instructions;
    const innerInstructions = transaction.meta.innerInstructions;
    const programs: Record<string, string> = {};
    const ixs = await Promise.all(
        instructions.map(async (instruction, ixIndex) => {
            const parsedResult = await parseTransaction(accountKeys[instruction.programIdIndex], instruction.data);
            const SFMIdlItem = parsedResult?.SFMIdlItem || null;
            const decodedData = parsedResult?.decodedData || null;

            if (SFMIdlItem && typeof SFMIdlItem.idl !== "string") {
                programs[SFMIdlItem.programId] = (SFMIdlItem.idl as any).name;
            }

            const instructionData = {
                ...decodedData,
                index: ixIndex,
                accounts: instruction.accounts.map((accountIndex: number) => accountKeys[accountIndex]),
                idl_name: (SFMIdlItem?.idl as any).name,
                idl_program_id: SFMIdlItem?.programId,
            };

            if (innerInstructions.some((inner: any) => inner.index === ixIndex)) {
                const inner_ixs = await Promise.all(
                    innerInstructions.flatMap((inner: any) =>
                        inner.instructions.map(async (inner_ix: any) => {
                            const innerParsedResult = await parseTransaction(
                                accountKeys[inner_ix.programIdIndex],
                                inner_ix.data
                            );
                            const innerSFMIdlItem = innerParsedResult?.SFMIdlItem || null;
                            const innerDecodedData = innerParsedResult?.decodedData || null;

                            if (innerSFMIdlItem) {
                                programs[innerSFMIdlItem.programId] = (innerSFMIdlItem.idl as any).name;
                            }

                            return {
                                ...innerDecodedData,
                                idl_name: (innerSFMIdlItem?.idl as any).name,
                                idl_program_id: innerSFMIdlItem?.programId,
                                accounts: inner_ix.accounts.map((accountIndex: number) => accountKeys[accountIndex]),
                            };
                        })
                    )
                );
                return { ...instructionData, inner: inner_ixs };
            }

            return instructionData;
        })
    );

    return { ixs, programs };
};
