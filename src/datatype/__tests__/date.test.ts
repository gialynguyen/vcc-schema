import { date, DateType } from '../';
import { ErrorSet, InvalidTypeError } from '../../error';

describe("DataType Date", () => {
    const subject = date();

    it('should have instance of DateType', () => {
        expect(subject).toBeInstanceOf(DateType);
        const dateData = new Date();
        expect(subject.parser(dateData)).toEqual(dateData);
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