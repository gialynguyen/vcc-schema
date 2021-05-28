export const joinFieldPath = (paths: string[]) =>
  paths.join(".").replace(/\.\[/g, "[");
