import { determineTxStatus } from "../../src/utils/determineTxStatus";

describe("determineTxStatus", () => {
    it('returns "failed" for transactions with "Err" in status', () => {
        expect(determineTxStatus({ status: { Err: {} } })).toBe("failed");
    });

    it('returns "success" for transactions with "Ok" in status', () => {
        expect(determineTxStatus({ status: { Ok: {} } })).toBe("success");
    });

    it('returns "failed" for transactions with undefined or null meta', () => {
        expect(determineTxStatus(null)).toBe("failed");
    });
});
