# Mục lục

- [Giới thiệu](#giới-thiệu)
- [Cài đặt](#cài-đặt)
- [Trường hợp sử dụng tổng quát](#trường-hợp-sử-dụng-tổng-quát)
- [Const](#const)
- [String](#string)
- [Number](#number)
- [Mixed (Object)](#mixed)
  - [.children](#children)
  - [.pick](#pick)
  - [.omit](#omit)
  - [.modifiers](#modifiers)
  - [.pickAndModifers](#pickandmodifers)
  - [.pickBy](#pickby)
  - [.omitBy](#omitby)
- [Array](#array)
  - [.noempty](#noempty)
- [OneOf](#OneOf)
- [Boolean](#boolean)
- [Date](#date)
- [Null](#null)
- [Undefined](#undefined)
- [Unknown](#unknown)
- [Any](#any)
- [Record](#record)
- [Tuples](#tuples)
- [Enum](#enum)
- [Custom](#custom)
- [BaseType](#basetype)
- [ErrorSubject](#errorsubject)
- [ErrorSet](#errorset)

# Giới thiệu

VCC-Schema (VC-S) là một thư viện có nhiệm vụ `normalize` và `validate` dữ liệu được xây dựng cốt lõi bằng Typescript. Điều này cung cấp sẵn chế độ `safe-type` trong quá trình phát triển phần mềm.

VC-S sử dụng thuật ngữ `SchemaType` khi muốn đề cập đến một kiểu dữ liệu bất kỳ: String SchemaType, Number SchemaType, ...

Khi khai báo hoặc sử dụng một SchemaType, một Typescript Static Type sẽ được tự động được bao hàm tương ứng với SchemaType đó.

# Cài đặt

```
npm install vcc-schema
```

<span style="font-weight: bold;">Important: </span> Cần phải đảm bảo chế độ `strict` trong ts.config phải luôn được kích hoạt.

# Trường hợp sử dụng tổng quát

Khởi tạo một SchemaType, chúng ta sẽ bắt đầu với những thứ đơn giản nhất:

```ts
import { string } from "vcc-schema";

const name = string();

name.parser("Gialynguyen"); // "Gialynguyen"
name.parser(3); // throw ErrorSet
```

Tiếp theo là một SchemaType phức tạp hơn:

```ts
import { mixed, string } from "vcc-schema";

const Customer = mixed({
  name: string(),
});

Customer.parser({
  name: "Gialynguyen",
}); // { name: "Gialynguyen" }

type CustomerType = ValueType<typeof Customer>; // { name: string }
```

# Const

```ts
import { constant, ValueType } from "vcc-schema";

const ConstantSchema = constant("Gialynguyen");

type ConstantType = ValueType<typeof ConstantSchema>; // "Gialynguyen"
```

# String

```ts
import { string } from "vcc-schema";

string();
string().max(5);
string().min(5);
string().min(3).max(7);
string().length(7);
string().email();
string().url();
string().regex(/gialy/g);
string().noempty();
```

##### Tuỳ chỉnh ErrorMessage:

```ts
import { string } from "vcc-schema";

string().email("Vui lòng nhập một email hợp lệ");
```

# Number

```ts
import { number } from "vcc-schema";

number();
number().max(5);
number().min(5);
number().min(3).max(7);
number().equal(7);
```

##### Tuỳ chỉnh ErrorMessage:

```ts
import { number } from "vcc-schema";

number().max(5, "Vui lòng nhập một số không vượt quá 5");
```

# Mixed (Object)

```ts
import { mixed, string, number } from "vcc-schema";

const Customer = mixed({
  name: string().min(5),
  age: number().min(18),
});
```

### `.children`

Là một `getter` để truy cập giá trị của các SchemaType con bên trong.

```ts
Customer.children.name;
```

### `.pick`

```ts
import { mixed, string, number } from "vcc-schema";

const User = mixed({
  name: string(),
  address: mixed({
    detail: string(),
  }),
});

const UserAddress = User.pick(["address"]);

/*
	mixed({
		address: mixed({
			detail: string()
		})
	})
*/
```

### `.omit`

```ts
import { mixed, string, number } from "vcc-schema";

const User = mixed({
  name: string(),
  address: mixed({
    detail: string(),
  }),
});

const UserAddress = User.pick(["name"]);

/*
	mixed({
		address: mixed({
			detail: string()
		})
	})
*/
```

### `.modifiers`

```ts
import { mixed, string, number, ValueType } from "vcc-schema";

const UserSchema = mixed({
  name: string(),
  age: number(),
});

const CreateUserSchema = UserSchema.modifiers({
  name: (name) => name.optional(),
});

type CreateUserType = ValueType<typeof CreateUserSchema>;
/*
	type CreateUserType = {
		name: string | undefined;
		age: number;
	}
*/
```

### `.pickAndModifers`

```ts
import { mixed, string, number, ValueType } from "vcc-schema";

const UserSchema = mixed({
  name: string(),
  age: number(),
  email: string(),
});

const UpdateUserSchema = UserSchema.pickAndModifers({
  name: (name) => name.optional(),
  age: true,
});

type UpdateUserPayload = ValueType<typeof UpdateUserSchema>;
/*
	type UpdateUserPayload = {
		name: string | undefined;
    age: string;
	}
*/
```

### `.pickBy`

```ts
import { mixed, string, number, ValueType } from "vcc-schema";

const UserSchema = mixed({
  name: string(),
  age: number(),
  email: string(),
  address: {
    name: string(),
    detail: string(),
  },
});

const UpdateUserSchema = UserSchema.pickBy({
  name: true,
  age: true,
  address: {
    name: true,
  },
});

type UpdateUserPayload = ValueType<typeof UpdateUserSchema>;
/*
	type UpdateUserPayload = {
		name: string;
    age: string;
    address: {
      name: string;
    }
	}
*/
```

### `.omitBy`

```ts
import { mixed, string, number, ValueType } from "vcc-schema";

const UserSchema = mixed({
  name: string(),
  age: number(),
  email: string(),
  address: {
    name: string(),
    detail: string(),
  },
});

const omitSchema = UserSchema.omitBy({
  name: true,
  address: {
    name: true,
  },
});

type OmitPayload = ValueType<typeof omitSchema>;
/*
	type OmitPayload = {
	  name: string;
    email: string;
    address: {
      detail: string;
    }
	}
*/
```

# Array

```ts
import { array } from "vcc-schema";

const stringArray = array(string());

// Hoặc có thể viết theo cách tương tự như sau:

const stringArray = string().array();
```

### `.noempty`

Sử dụng hàm này nếu muốn đảm bảo mảng có ít nhất 1 phần tử

```ts
import { array } from "vcc-schema";

const stringArray = string().array().noempty();
```

### `.min` / `.max` / `.length`

```ts
const lengthStringArray = array(string()).length(5);
const maxStringArray = array(string()).max(5);
const minStringArray = array(string()).min(5);
```

# OneOf

Ý nghĩa tương tự như toán tử `OR`.

Khi nhận `input` vào, VC-S sẽ kiểm tra mỗi SchemaType theo thứ tự và sẽ trả về giá trị đầu tiên hợp lệ, hoặc sẽ trả về lỗi nếu các SchemaType đều cho kết quả không hợp lệ.

```ts
const stringOrNumber = oneOf([string(), number()]);

stringOrNumber.parse("foo"); // passes
stringOrNumber.parse(14); // passes
```

# Boolean

```ts
import { boolean } from "vcc-schema";

const isBoolean = boolean();
```

# Date

```ts
import { date } from "vcc-schema";

const isDate = date();
const isISODateString = date("ISO"); // khi thực hiện các quá trình, một `string` có format chuẩn ISO Date sẽ được cho là valid, và kết quả trả về sẽ là 1 object `Date` tương ứng.
```

# Null

```ts
import { nullable } from "vcc-schema";

const isNull = nullable();
```

# Undefined

```ts
import { undefined } from "vcc-schema";

const isUndefined = undefined();
```

# Unknown

Tất cả `data` đều `valid` đối với `Unknown` SchemaType.

```ts
import { unknown } from "vcc-schema";

const isUknown = unknown();
```

# Any

`Any` SchemaType sẽ cho phép những `data` có `giá trị` (khác null và undefined) là `valid`.

```ts
import { any } from "vcc-schema";

const isAny = any();
```

# Record (Cập nhật sau)

# Tuples

```ts
import { tuples, number, string, array, ValueType } from "vcc-schema";

const tuplesSchema = tuples([
  number("Vui lòng nhập một số"),
  string(),
  array(string()),
  tuples([string()]),
]);

const result = tuplesSchema.parser([
  1,
  "gialynguyen",
  ["address", "age"],
  ["name"],
]);

type T = ValueType<typeof tuplesSchema>;
/*
 T = [number, string, string[], [string]]
*/
```

# Enum (Cập nhật sau)

# Custom (Cập nhật sau)

# BaseType

BaseType là một `abstract class`, nó là nền tảng để xây dựng các SchemaType khác.

Một số interface cần lưu ý:

### `ParserContext`

- paths: (default: []) Đường dẫn khởi đầu.

- tryParser: (default: false) Nếu giá trị là `true`, nếu `data` được đưa vào không valid, một ErrorSet sẽ được throw. Ngược lại, nếu giá trị là `false`, error sẽ được bỏ qua và giá trị trả về sẽ là `undefined`.

- deepTryParser: (default: false) tương tự như `tryParser`. Nhưng `tryParser` chỉ có tác động đến cấp độ ngoài cùng của một SchemaType, còn `deepTryParser` thì tác động sẽ được đệ quy đến các cấp con được lồng sâu bên trong.

- nestedParser: (default: false) Nếu giá trị là `true`, điều này cho biết quá trình đang được thực hiện ở một SchemaType cấp độ con nằm bên trong một SchemaType khác. Ngược lại nếu là `false` thì đồng nghĩa với quá trình đang được thực thi ở SchemaType cấp độ ngoài ngoài cùng. Điều khác biệt ở đây là: nếu phát sinh lỗi, thì nếu `nestedParser` là `true` thì một `SubjectError` hoặc `Array<SubjectError>` sẽ được `return` thay vì `throw` ra một `ErrorSet`.

- throwOnFirstError: (default: false) Nếu giá trị là `true`, các quá trình sẽ dừng lại khi một error (ErrorSubject) được phát hiện. Ngược lại, nếu là `false`, tất cả các error(ErrorSubject) được phát hiện sẽ được tổng hợp thành một ErrorSet sau khi quá trình hoàn tất.

```
{
	paths?: (string | number)[];
	tryParser?: boolean;
	deepTryParser?: boolean;
	nestedParser?: boolean;
	throwOnFirstError?: boolean;
}
```

Các method cốt lõi được bao hàm trong BaseType:

### `.parser`

`parser(data: unknown, ctx?: ParserContext): T`

Khi muốn kiểm tra `data` có `valid` so với một SchemaType hay không, hàm `parser` sẽ giúp làm điều đó. Nếu nó `valid`, hàm sẽ trả về `data` một cách nguyên vẹn. Nếu không, hàm sẽ throw ra một error(ErrorSet) nếu `tryParser` bên trong ctx là `false`, ngược lại sẽ trả về `undefined` .

### `.strictParser(data: unknown, ctx?: Omit<ParserContext, "throwOnFirstError">): Partial<T>`

Tương tự như `.parser`, nhưng trong `ctx`, `throwOnFirstError` sẽ luôn có giá trị là `true`

### `.tryParser(data: unknown, ctx?: Omit<ParserContext, "tryParser">): DeepPartial<T>`

Tương tự như `.parser`, nhưng trong `ctx`, `tryParser` sẽ luôn có giá trị là `true`.

### `.tryDeepParser(data: unknown, ctx?: Omit<ParserContext, "tryParser" | "deepTryParser">): T`

Tương tự như `.parser`, nhưng trong `ctx`, `tryParser` và `deepTryParser` sẽ luôn có giá trị là `true`.

### `.validate(data: unknown): { success: true; data: T } | { success: false; error: ErrorSet }`

Khi muốn kiểm tra `data` có `valid` so với một SchemaType hay không, nhưng không mong muốn `throw` ra một ErrorSet, hàm `validate` sẽ giúp làm điều đó.

### `.optional(): OneOfType<[this, UndefinedType]>`

Hàm `.optional` sẽ giúp bạn sinh ra một [`OneOf`](#oneof) SchemaType bao gồm SchemaType hiện tại và [Undefined](#undefined) SchemaType.

### `.nullable(): OneOfType<[this, NullType]>`

Hàm `.optional` sẽ giúp bạn sinh ra một [`OneOf`](#oneof) SchemaType bao gồm SchemaType hiện tại và [Null](#null) SchemaType.

### `.nullish(): OneOfType<[this, NullType, UndefinedType]>`

Hàm `.nullish` sẽ giúp bạn sinh ra một [`OneOf`](#oneof) SchemaType bao gồm SchemaType hiện tại, [Null](#null) và [Undefined](#undefined) SchemaType.

### `.default(defaultValue: Type | () => Type)`

Hàm `.default` sẽ trả về giá trị mặc định tương ứng với kiểu dữ liễu của SchemaType khi có lỗi sinh ra trong các quá trình.

# ErrorSubject

# ErrorSet
