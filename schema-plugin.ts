import * as tsj from "ts-json-schema-generator";

export default function schemaPlugin() {
  const virtualModuleId = "virtual:settings-schema";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  const path = "src/domain/settings.ts";
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
        const schema = tsj.createGenerator({ path }).createSchema(type);
        return `export const schema = ${JSON.stringify(schema)};`;
      }
    },
  };
}
