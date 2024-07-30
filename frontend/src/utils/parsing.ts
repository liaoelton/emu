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
