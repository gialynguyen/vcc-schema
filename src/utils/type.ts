import { isArray, isDate, isNull } from "hardcore-react-utils";

export const typeOf = (raw: any) => {
  let receiveType: string = typeof raw;
  if (receiveType === "object") {
    if (isArray(raw)) receiveType = "array";
    if (isDate(raw)) receiveType = "date";
    if (isNull(raw)) receiveType = "null";
  }

  return receiveType;
};
