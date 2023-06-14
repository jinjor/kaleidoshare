import React, { useEffect } from "react";
import { html } from "../doc/tutorial.ja.md";
import "github-markdown-css/github-markdown-dark.css";
import "prism-themes/themes/prism-vsc-dark-plus.min.css";
import Prism from "prismjs";

export default function Tutorial() {
  useEffect(() => {
    Prism.highlightAll();
  }, []);
  return (
    <div className="horizontal-center">
      <div
        className="markdown-body container"
        style={{ padding: "40px 20px 100px", boxSizing: "border-box" }}
        dangerouslySetInnerHTML={{ __html: html }}
      ></div>
    </div>
  );
}
