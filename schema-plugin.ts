import { resolve } from "path";
import * as TJS from "typescript-json-schema";

export default function schemaPlugin() {
  const virtualModuleId = "virtual:settings-schema";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  const sourceFile = resolve("src/domain/settings.ts");
  const type = "Settings";

  return {
    name: "schema-plugin",
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const program = TJS.getProgramFromFiles([sourceFile], {
          strictNullChecks: true,
        });
        const schema = TJS.generateSchema(program, type, {
          ref: false,
          noExtraProps: true,
          required: true,
        });
        return `export const schema = ${JSON.stringify(schema)};`;
      }
    },
  };
}
