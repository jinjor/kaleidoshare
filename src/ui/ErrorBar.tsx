import React, { createContext, useCallback, useContext, useState } from "react";

type ErrorInfo = {
  message: string;
};

type ErrorContext = {
  info: ErrorInfo | null;
  setError: (info: ErrorInfo | null) => void;
};

export const ErrorContext = createContext<ErrorContext | null>(null);

export function useError(): ErrorContext {
  const [info, setInfo] = useState<ErrorInfo | null>(null);
  const setError = useCallback((info: ErrorInfo | null) => {
    setInfo(info);
  }, []);
  return { info, setError };
}

export default function ErrorBar() {
  const context = useContext(ErrorContext);
  if (context?.info == null) {
    return null;
  }
  const { info, setError } = context;
  return (
    <div
      className="horizontal-center"
      style={{
        position: "absolute",
        backgroundColor: "#834",
        width: "100%",
        zIndex: 2,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p style={{ margin: "12px 0" }}>{info.message}</p>
        <button
          className="button"
          style={{ border: "none" }}
          onClick={() => setError(null)}
        >
          <svg viewBox="0 0 1 1" style={{ width: "12px", height: "12px" }}>
            <path
              d="M 0 0 L 1 1 M 0 1 L 1 0"
              stroke="#eee"
              strokeWidth={0.1}
              fill="none"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
