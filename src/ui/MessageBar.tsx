import React, { createContext, useCallback, useContext, useState } from "react";

type InfoType = "success" | "error";
type Info = {
  type: InfoType;
  message: string;
};
type ErrorInfo = {
  message: string;
};
type MessageContext = {
  info: ErrorInfo | null;
  setError: (info: ErrorInfo) => void;
  setMessage: (message: string, type?: InfoType) => void;
  clear: () => void;
};

export const MessageContext = createContext<MessageContext | null>(null);

export function useMessage(): MessageContext {
  const [info, setInfo] = useState<Info | null>(null);
  const setError = useCallback((info: ErrorInfo) => {
    setInfo({ type: "error", message: info.message });
  }, []);
  const setMessage = useCallback(
    (message: string, type: InfoType = "success") => {
      setInfo({ type, message: message });
    },
    []
  );
  const clear = useCallback(() => {
    setInfo(null);
  }, []);
  return { info, setError, setMessage, clear };
}

export default function MessageBar() {
  const context = useContext(MessageContext);
  if (context?.info == null) {
    return null;
  }
  const { info, clear } = context;
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
          onClick={() => clear()}
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
