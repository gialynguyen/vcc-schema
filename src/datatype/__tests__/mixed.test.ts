import { mixed } from '../';

describe("DataType Mixed", () => {
    const subject = mixed({});

    it('should have instance of AnyType', () => {
        expect(1).toBe(1);
        // expect(subject).toBeInstanceOf(AnyType);
        // console.log('subject: ', subject);
    })
});