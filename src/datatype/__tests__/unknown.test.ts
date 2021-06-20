import { unknown, UnknownType } from '../';

describe("DataType Unknown", () => {
    const subject = unknown();

    it('should have instance of UnknownType', () => {
        expect(subject).toBeInstanceOf(UnknownType);
        expect(subject.parser('this value has unknown type')).toEqual('this value has unknown type')
    });
});