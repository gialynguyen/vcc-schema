import { string, StringType } from '../';
import { ErrorSet, InvalidTypeError, TooBigError, TooSmallError, IncorrectSizeError, InvalidStringFormat } from '../../error';

describe("DataType String", () => {
  const subject = string();

  it('should have instance of NullType', () => {
    expect(subject).toBeInstanceOf(StringType);
    expect(subject.parser('stringType')).toEqual('stringType')
  });

  it('should throw an InvalidTypeError error', () => {
    try {
        subject.parser(null)
    } catch (err) {
        expect(err).toBeInstanceOf(ErrorSet);
        expect(err.errors[0]).toBeInstanceOf(InvalidTypeError);
    }
  });

  describe('Max', () => {
    const subject = string().max(7);
    expect(subject).toBeInstanceOf(StringType);
    expect(subject.parser('1234567').length).toBeLessThanOrEqual(7)

    it('should throw a TooBigError error', () => {
        try {
            subject.parser('12345678')
        } catch (err) {
            expect(err).toBeInstanceOf(ErrorSet);
            expect(err.errors[0]).toBeInstanceOf(TooBigError);
        }
    });
  });

  describe('Min', () => {
    const subject = string().min(7);
    expect(subject).toBeInstanceOf(StringType);
    expect(subject.parser('1234567').length).toBeGreaterThanOrEqual(7)

    it('should throw a TooSmallError error', () => {
        try {
            subject.parser('123456')
        } catch (err) {
            expect(err).toBeInstanceOf(ErrorSet);
            expect(err.errors[0]).toBeInstanceOf(TooSmallError);
        }
    });
  });

  describe('Length', () => {
    const subject = string().length(7);
    expect(subject).toBeInstanceOf(StringType);
    expect(subject.parser('1234567').length).toBe(7)

    it('should throw an IncorrectSizeError error', () => {
        try {
            subject.parser('123456')
        } catch (err) {
            expect(err).toBeInstanceOf(ErrorSet);
            expect(err.errors[0]).toBeInstanceOf(IncorrectSizeError);
        }
    });
  });

  describe('Email', () => {
    const subject = string().email();
    expect(subject).toBeInstanceOf(StringType);
    expect(subject.parser('email@gmail.com')).toEqual('email@gmail.com');

    it('should throw an InvalidStringFormat error', () => {
        try {
            subject.parser('invalidTypeEmail')
        } catch (err) {
            expect(err).toBeInstanceOf(ErrorSet);
            expect(err.errors[0]).toBeInstanceOf(InvalidStringFormat);
        }
    });
  });
});
