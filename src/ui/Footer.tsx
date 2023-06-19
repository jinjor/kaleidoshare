import React from "react";

const Footer = () => (
  <footer className="horizontal-center" style={{ marginTop: "auto" }}>
    <div
      className="container"
      style={{
        display: "flex",
        gap: 10,
        padding: 15,
        fontSize: 12,
        color: "#999",
      }}
    >
      <div>
        Copyright © 2023-present{" "}
        <a
          href="https://twitter.com/jinjor"
          target="_blank"
          rel="noopener noreferrer"
        >
          @jinjor
        </a>
      </div>
      <a
        style={{ marginLeft: "auto" }}
        href="https://github.com/jinjor/kaleidoshare"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
      <a
        href="https://twitter.com/kaleidoshare"
        target="_blank"
        rel="noopener noreferrer"
      >
        Twitter
      </a>
    </div>
  </footer>
);
export default Footer;
