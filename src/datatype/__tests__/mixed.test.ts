import { mixed, MixedType, string, StringType, number } from '../';
import { ErrorSet, InvalidTypeError, InvalidFieldError, TooBigError } from '../../error';

describe("DataType Mixed", () => {
    const subject = mixed({
        name: string(),
        age: number(),
        company: mixed({
            name: string()
        })
    });

    it('should have instance of MixedType', () => {
        const mixedValue = { name: 'Người Da Màu', age: 24, company: { name: '3dacam' } };
        expect(subject).toBeInstanceOf(MixedType);
        expect(subject.children['name']).toBeInstanceOf(StringType);
        expect(subject.parser(mixedValue)).toEqual(mixedValue);
        expect(subject.parser({ age: 24 }, { tryParser: true, paths: [] }).name).toBeUndefined();
        expect(subject.parser({ age: 20, company: {} }, { deepTryParser: true, tryParser: true, paths: [] }).company.name).toBeUndefined();
    });

    describe('with errors', () => {
        it('should throw an InvalidTypeError error', () => {
            const subject = mixed({
                name: string()
            }, { error: "The value must be an object" });

            try {
                subject.parser(null);
            } catch (err) {
                expect(err).toBeInstanceOf(ErrorSet);
                expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
                expect(err.errors[0].error.message).toEqual('The value must be an object');
            }
        });

        it('should throw an InvalidFieldError error', () => {
            const subject = mixed({
                name: string()
            });

            try {
                subject.parser({ age: 24 });
            } catch (err) {
                expect(err.errors[0]).toBeInstanceOf(InvalidFieldError);
            }
        });
    });

    describe('pick', () => {
        it('should have instance of MixedType', () => {
            const pickSubject = subject.pick(['name']);
            expect(pickSubject).toBeInstanceOf(MixedType);
            expect(pickSubject.parser({ name: 'pick' })['name']).toEqual('pick');
        })
    });

    describe('omit', () => {
        it('should have instance of MixedType', () => {
            const pickSubject = subject.omit(['name']);
            expect(pickSubject).toBeInstanceOf(MixedType);
            expect(pickSubject.parser({ age: 24, company: { name: '3dacam' } })['age']).toBe(24);
        })
    });

    describe('modifiers', () => {
        it('should have instance of MixedType', () => {
            const modifiersSubject = subject.modifiers({ age: (age) => age.max(7) });
            expect(modifiersSubject).toBeInstanceOf(MixedType);
            expect(modifiersSubject.parser({ name: 'modifiers', age: 7, company: { name: '3dacam' } })['age']).toBe(7);

            try {
                modifiersSubject.parser({ name: 'modifiers', age: 24, company: { name: '3dacam' } });
            } catch (err) {
                expect(err.errors[0]).toBeInstanceOf(TooBigError);
            }
        })
    });

    describe('pickAndModifers', () => {
        it('should have instance of MixedType', () => {
            const pickAndModifersSubject = subject.pickAndModifers({ age: (age) => age.max(7) });
            expect(pickAndModifersSubject).toBeInstanceOf(MixedType);
            expect(pickAndModifersSubject.parser({ age: 7 })['age']).toBe(7);
            expect(pickAndModifersSubject).not.toContain('name');

            try {
                pickAndModifersSubject.parser({ age: 24 });
            } catch (err) {
                expect(err.errors[0]).toBeInstanceOf(TooBigError);
            }
        })
    });

    describe('strict', () => {
        it('should have instance of MixedType', () => {
            const strictSubject = subject.strict(false);
            expect(strictSubject).toBeInstanceOf(MixedType);
        })

        it('should throw an InvalidFieldError error', () => {
            const strictSubject = subject.strict(true);
            try {
                strictSubject.parser({ major: 'Software engineer' });
            } catch (err) {
                expect(err.errors[0]).toBeInstanceOf(InvalidFieldError);
            }
        });
    });
});