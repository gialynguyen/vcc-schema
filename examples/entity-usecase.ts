
// const UserEntitySchema = mixed({
// 	name: string(),
// 	age: number(),
// 	address: mixed().array(),
// });

// const userDetailDto = createMapper(UserEntitySchema.deepPartial(), () => {});

// const createUserSchema = UserEntitySchema
// 	.pickAndExtend({
// 		name: (name) => name,
// 		age: (age) => age,
// 		address: (address) => address.min(1, { message: "Vui lòng" })
// 	})