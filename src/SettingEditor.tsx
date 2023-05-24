import React, { useRef } from "react";
import Editor from "@monaco-editor/react";

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
  if (typeof json.numObjects !== "number" || json.numObjects < 0) {
    return false;
  }
  return true;
}

export default function SettingEditor(props: { onApply: (json: any) => void }) {
  const { onApply } = props;
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
      <Editor
        height="200px"
        defaultLanguage="json"
        defaultValue="{}"
        onMount={handleEditorDidMount}
        options={{
          contextmenu: false,
        }}
      />
    </div>
  );
}
