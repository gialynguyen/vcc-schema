import { array, string, ArrayType } from '../';
import { ErrorSet, InvalidTypeError } from '../../error';

describe("DataType Array", () => {
    const subject = array(string());

    it('should have instance of ArrayType', () => {
        expect(subject).toBeInstanceOf(ArrayType);

        const dataParser = ["1"];
        expect(subject.parser(dataParser)).toEqual(dataParser);
    });

    it('should throw an invalid error type', () => {
        try {
            subject.parser(null)
        } catch (err) {
            expect(err).toBeInstanceOf(ErrorSet);
            expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
        }
    });
});
