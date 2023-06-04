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
  return { info, setError, setMessage };
}

export default function MessageBar() {
  const context = useContext(MessageContext)!;
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (context.info != null) {
      setShow(true);
      const timeout = setTimeout(
        () => {
          setShow(false);
        },
        context.info.type === "error" ? 5000 : 3000
      );
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [context.info]);
  const message = context.info?.message ?? "";
  const { info } = context;
  return (
    <div
      className={["message-bar", info?.type ?? "", show ? "show" : ""].join(
        " "
      )}
    >
      <div className="message-bar-inner">
        <p style={{ margin: 0 }}>{message}</p>
        <button
          className="button"
          style={{ border: "none", marginRight: -16 }}
          onClick={() => setShow(false)}
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
