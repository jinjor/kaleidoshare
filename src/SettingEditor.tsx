import React from "react";
import Editor from "@monaco-editor/react";

export default function SettingEditor(props: {}) {
  const {} = props;
  function handleEditorChange(value, event) {
    console.log(value);
  }
  return (
    <>
      <Editor
        height="200px"
        defaultLanguage="json"
        defaultValue="{}"
        onChange={handleEditorChange}
      />
    </>
  );
}
