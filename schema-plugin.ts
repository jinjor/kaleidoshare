import { resolve } from "path";
import * as TJS from "typescript-json-schema";

export default function schemaPlugin() {
  const virtualModuleId = "virtual:settings-schema";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "schema-plugin",
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const program = TJS.getProgramFromFiles([
          resolve("src/domain/settings.ts"),
        ]);
        const schema = TJS.generateSchema(program, "Settings");
        return `export const schema = ${JSON.stringify(schema)};`;
      }
    },
  };
}
