import { ErrorCode } from '../type';

describe("Error Type", () => {
    it("Must be InvalidType", () => {
        expect(ErrorCode.invalid_type).toEqual('invalid_type');
    })

    it("Must be TooSmall", () => {
        expect(ErrorCode.too_small).toEqual('too_small');
    })

    it("Must be TooBig", () => {
        expect(ErrorCode.too_big).toEqual('too_big');
    })

    it("Must be NotEqual", () => {
        expect(ErrorCode.not_equal).toEqual('not_equal');
    })

    it("Must be NoEmpty", () => {
        expect(ErrorCode.no_empty).toEqual('no_empty');
    })

    it("Must be InvalidField", () => {
        expect(ErrorCode.invalid_field).toEqual('invalid_field');
    })

    it("Must be InvalidStringFormat", () => {
        expect(ErrorCode.invalid_string_format).toEqual('invalid_string_format');
    })

    it("Must be CustomerError", () => {
        expect(ErrorCode.custom_error).toEqual('custom_error');
    })
});