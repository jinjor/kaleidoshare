import React, { useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Settings } from "../domain/settings";
// @ts-ignore
import { schema } from "virtual:settings-schema";
import { env } from "../domain/env";

const tabSize = 2;

export type SettingsEditorController = {
  save(): void;
};

const SettingEditor = React.memo(
  (props: {
    settings: Settings;
    onApply: (json: any) => void;
    onReady: (controller: SettingsEditorController) => void;
  }) => {
    const { settings, onApply, onReady } = props;
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
      let json: any;
      try {
        json = JSON.parse(editor.getValue());
      } catch (e) {
        return;
      }
      const monaco = monacoRef.current!;
      const markers = monaco.editor.getModelMarkers({ owner: "json" });
      if (markers.length > 0) {
        return;
      }
      onApply(json);
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
