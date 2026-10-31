import type { MessageKey, Messages } from "./messages/en";

export type { MessageKey, Messages };
export type TranslateVars = Record<string, string | number>;
export type Translate = (key: MessageKey, vars?: TranslateVars) => string;

export const createTranslate =
  (messages: Messages): Translate =>
  (key, vars) =>
    messages[key].replace(/\{(\w+)\}/g, (match, name: string) => (vars && name in vars ? String(vars[name]) : match));
