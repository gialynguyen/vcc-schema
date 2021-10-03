export const enumFromArray = <T extends string, U extends [T, ...T[]]>(
  items: U
): { [k in U[number]]: k } => {
  const obj: any = {};
  for (const item of items) {
    obj[item] = item;
  }

  return obj as any;
};
