import { boolean, BooleanType } from '../';
import { ErrorSet, InvalidTypeError } from '../../error';

describe("DataType Boolean", () => {
    const subject = boolean();

    it('should have instance of BooleanType', () => {
        expect(subject).toBeInstanceOf(BooleanType);
        expect(subject.parser(true)).toBeTruthy();
        expect(subject.parser(false)).toBeFalsy();
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