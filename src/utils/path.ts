import { isNumber } from "vcc-utils";

export const joinFieldPath = (paths: (string | number)[]): string =>
  paths.reduce((pathsString, path, index) => {
    let pathString = path;
    const isIndex = isNumber(pathString);

    if (isIndex) {
      pathString = `[${pathString}]`;
    }

    if (index === 0) return pathString;

    return `${pathsString}${isIndex ? pathString : `.${pathString}`}`;
  }, "") as string;
