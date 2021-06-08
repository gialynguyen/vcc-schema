import { Types } from "../../datatype";
import { InvalidTypeError } from "../errors";

describe("Error Errors", () => {
    describe("InvalidTypeError", () => {
        it('Should have instance of InvalidTypeError', () => {
            InvalidTypeError.setDefaultMessage = "Set default message outside";
            const subject = new InvalidTypeError({expectedType: Types.string, receivedType: Types.number});

            expect(InvalidTypeError.is(subject)).toBeTruthy();
            expect(subject.error.message).toEqual("Set default message outside");
        });

        describe("Without default message", () => {
            const subject = new InvalidTypeError({expectedType: Types.string, receivedType: Types.number});
            expect(subject.error.message).toEqual(`Expected ${Types.string}, received ${Types.number}`);
        });

        describe("With default message", () => {
            const subject = new InvalidTypeError({expectedType: Types.string, receivedType: Types.number, message: "Default message"});
            expect(subject.error.message).toEqual("Default message");
        });
    });
});
