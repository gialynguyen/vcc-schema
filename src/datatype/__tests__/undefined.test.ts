import { undefined as undefinedType, UndefinedType } from '../';
import { ErrorSet, InvalidTypeError } from '../../error';

describe("DataType Undefined", () => {
    const subject = undefinedType();

    it('should have instance of UndefinedType', () => {
        expect(subject).toBeInstanceOf(UndefinedType);
        expect(subject.parser(undefined)).toBeUndefined();
    });

    it('should throw an InvalidTypeError error', () => {
        try {
            subject.parser(null)
        } catch (err) {
            expect(err).toBeInstanceOf(ErrorSet);
            expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
        }
    });
});