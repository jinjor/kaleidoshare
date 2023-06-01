import { Output } from "./output.mjs";
import { Settings } from "./settings.mjs";

export type Content = {
  id: string;
  settings: Settings;
  output: Output;
};
