import React, { useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Settings } from "../domain/settings";
// @ts-ignore
import { schema } from "virtual:settings-schema";
import { env } from "../domain/env";
import Ajv from "ajv";
const ajv = new Ajv();
const validate = ajv.compile(schema);

const tabSize = 2;

export type SettingsEditorController = {
  save(): void;
};

const SettingEditor = React.memo(
  (props: {
    settings: Settings;
    onChange: () => void;
    onApply: (json: any) => void;
    onReady: (controller: SettingsEditorController) => void;
  }) => {
    const { settings, onChange, onApply, onReady } = props;
    const monacoRef = useRef<Monaco | null>(null);
    const editorRef = useRef<any | null>(null);
    function handleEditorWillMount(monaco: Monaco) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: window.location.href,
            fileMatch: ["*"],
            schema,
          },
        ],
      });
    }
    function handleEditorDidMount(editor: any, monaco: Monaco) {
      editorRef.current = editor;
      monacoRef.current = monaco;
      onReady({
        save,
      });
    }
    function save() {
      const editor = editorRef.current!;
      editor.getAction("editor.action.formatDocument").run();
      try {
        const json = JSON.parse(editor.getValue());
        if (validate(json)) {
          onApply(json);
        }
      } catch (e) {
        // noop
      }
    }
    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      if (
        event.key === "s" &&
        (env.os === "mac" ? event.metaKey : event.ctrlKey)
      ) {
        event.stopPropagation();
        event.preventDefault();
        save();
      }
    }
    return (
      <div tabIndex={0} onKeyDown={handleKeyDown}>
        <Editor
          height="500px"
          theme="vs-dark"
          defaultLanguage="json"
          defaultValue={JSON.stringify(settings, null, tabSize)}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onChange={onChange}
          options={{
            contextmenu: false,
            scrollBeyondLastLine: false,
            tabSize,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    );
  }
);
export default SettingEditor;
