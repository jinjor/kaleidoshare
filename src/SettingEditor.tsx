import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import { Settings } from "./World";

// TODO: JSON Schema にする
function isJsonValid(json: any) {
  if (typeof json !== "object") {
    return false;
  }
  if (json === null) {
    return false;
  }
  if (Array.isArray(json)) {
    return false;
  }
  return true;
}

const SettingEditor = React.memo(
  (props: { settings: Settings; onApply: (json: any) => void }) => {
    const { settings, onApply } = props;
    const editorRef = useRef<any | null>(null);

    function handleEditorDidMount(editor: any) {
      editorRef.current = editor;
    }
    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      // TODO: OS によって切り替える
      if (event.key === "s" && (event.ctrlKey || event.metaKey)) {
        event.stopPropagation();
        event.preventDefault();
        const editor = editorRef.current!;
        try {
          const json = JSON.parse(editor.getValue());
          if (isJsonValid(json)) {
            onApply(json);
          }
          editor.getAction("editor.action.formatDocument").run();
        } catch (e) {
          console.log(e);
        }
      }
    }
    // TODO: feature flag 化
    if (location.origin !== "http://localhost:5173") {
      return <></>;
    }
    return (
      <div tabIndex={0} onKeyDown={handleKeyDown}>
        <div>Settings</div>
        <Editor
          height="400px"
          theme="vs-dark"
          defaultLanguage="json"
          defaultValue={JSON.stringify(settings, null, 4)}
          onMount={handleEditorDidMount}
          options={{
            contextmenu: false,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    );
  }
);
export default SettingEditor;
