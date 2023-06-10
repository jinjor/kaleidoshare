import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppError } from "../domain/error";

type InfoType = "success" | "error";
type Info = {
  type: InfoType;
  message: string;
};
type ErrorInfo = {
  message: string;
};
type MessageContext = {
  info: Info | null;
  setError: (info: ErrorInfo) => void;
  setMessage: (message: string, type?: InfoType) => void;
  clear: () => void;
};

export const MessageContext = createContext<MessageContext | null>(null);

export function useMessage(): MessageContext {
  const [info, setInfo] = useState<Info | null>(null);
  const setError = useCallback((info: ErrorInfo) => {
    if (info instanceof AppError) {
      setInfo({ type: "error", message: info.message });
    } else {
      // TODO: 本当はここでエラーをサーバーに送信する
      setInfo({ type: "error", message: "Unexpected error" });
    }
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
  const context = useContext(MessageContext)!;
  const show = context.info != null;
  const [type, setType] = useState<InfoType | null>(null);
  useEffect(() => {
    if (context.info != null) {
      setType(context.info.type);
      const timeout = setTimeout(() => {
        context.clear();
      }, 4000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [context.info]);
  const message = context.info?.message ?? "";
  return (
    <div className={["message-bar", type ?? "", show ? "show" : ""].join(" ")}>
      <div className="message-bar-inner">
        <p style={{ margin: 0 }}>{message}</p>
        <button
          className="button"
          style={{ border: "none", marginRight: -16 }}
          onClick={() => context.clear()}
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
