import process from "node:process";
import readline from "node:readline";

export const ACP_PROTOCOL_VERSION = 1;

const JSONRPC_VERSION = "2.0";
const RPC_METHOD_NOT_FOUND = -32601;
const RPC_INVALID_PARAMS = -32602;
const RPC_INTERNAL_ERROR = -32603;
const ACP_METHOD_INITIALIZE = "initialize";
const ACP_METHOD_AUTHENTICATE = "authenticate";
const ACP_METHOD_SESSION_NEW = "session/new";
const ACP_METHOD_SESSION_SET_CONFIG = "session/set_config_option";
const ACP_METHOD_SESSION_PROMPT = "session/prompt";
const ACP_METHOD_SESSION_CANCEL = "session/cancel";
const ACP_METHOD_SESSION_UPDATE = "session/update";

export class ACPServerBase {
  constructor(options = {}) {
    this.stdin = options.stdin ?? process.stdin;
    this.stdout = options.stdout ?? process.stdout;
    this.readline = readline.createInterface({ input: this.stdin });
    this.sessions = new Map();
    this.supportedConfigOptions = Array.isArray(options.supportedConfigOptions)
      ? [...options.supportedConfigOptions]
      : [];
  }

  start() {
    this.readline.on("line", (line) => {
      void this.handleACPLine(line);
    });
    this.readline.on("close", () => {
      void this.handleStdinClose();
    });
  }

  async handleACPLine(line) {
    if (line.trim() === "") {
      return;
    }
    let message;
    try {
      message = JSON.parse(line);
    } catch (error) {
      this.writeError(null, RPC_INVALID_PARAMS, `invalid json: ${String(error)}`);
      return;
    }
    if (!isRecord(message)) {
      this.writeError(null, RPC_INVALID_PARAMS, "invalid request");
      return;
    }
    const method = normalizeString(message.method);
    if (method === "") {
      this.writeError(message.id ?? null, RPC_INVALID_PARAMS, "missing method");
      return;
    }

    try {
      const result = await this.handleACPRequest(method, message.params);
      this.write({
        jsonrpc: JSONRPC_VERSION,
        id: message.id ?? null,
        result,
      });
    } catch (error) {
      const code = error instanceof JsonRpcFailure ? error.code : RPC_INTERNAL_ERROR;
      const messageText = error instanceof Error ? error.message : String(error);
      this.writeError(message.id ?? null, code, messageText);
    }
  }

  async handleACPRequest(method, params) {
    switch (method) {
      case ACP_METHOD_INITIALIZE:
        return {
          protocolVersion: ACP_PROTOCOL_VERSION,
          authMethods: [],
        };
      case ACP_METHOD_AUTHENTICATE:
        return {};
      case ACP_METHOD_SESSION_NEW:
        return this.createSession(params);
      case ACP_METHOD_SESSION_SET_CONFIG:
        return this.setSessionConfig(params);
      case ACP_METHOD_SESSION_PROMPT:
        return this.runPrompt(params);
      case ACP_METHOD_SESSION_CANCEL:
        return this.cancelPrompt(params);
      default:
        throw new JsonRpcFailure(
          RPC_METHOD_NOT_FOUND,
          `unsupported ACP method: ${method}`,
        );
    }
  }

  async createSession(params) {
    const payload = asObject(params, "session/new params");
    const created = await this.createSessionState(payload);
    const sessionId = normalizeString(created?.sessionId);
    if (sessionId === "") {
      throw new JsonRpcFailure(RPC_INVALID_PARAMS, "session/new returned empty sessionId");
    }
    this.sessions.set(sessionId, created.session);
    return {
      sessionId,
      configOptions: this.supportedConfigOptions.map((id) => ({ id })),
    };
  }

  setSessionConfig(params) {
    const payload = asObject(params, "session/set_config_option params");
    const session = this.getSession(payload.sessionId);
    const configId = normalizeString(payload.configId);
    if (!this.supportedConfigOptions.includes(configId)) {
      return {};
    }
    session.options = this.applySessionConfig(session, configId, payload.value);
    return {};
  }

  async runPrompt(params) {
    const payload = asObject(params, "session/prompt params");
    const session = this.getSession(payload.sessionId);
    return this.runSessionPrompt(session, payload);
  }

  async cancelPrompt(params) {
    const payload = asObject(params, "session/cancel params");
    const session = this.getSession(payload.sessionId);
    return this.cancelSessionPrompt(session, payload);
  }

  getSession(sessionId) {
    const key = normalizeString(sessionId);
    const session = this.sessions.get(key);
    if (!session) {
      throw new JsonRpcFailure(RPC_INVALID_PARAMS, `unknown sessionId: ${sessionId}`);
    }
    return session;
  }

  notifySessionUpdate(sessionId, update) {
    this.write({
      jsonrpc: JSONRPC_VERSION,
      method: ACP_METHOD_SESSION_UPDATE,
      params: {
        sessionId,
        update,
      },
    });
  }

  write(message) {
    this.stdout.write(`${JSON.stringify(message)}\n`);
  }

  writeError(id, code, message) {
    this.write({
      jsonrpc: JSONRPC_VERSION,
      id,
      error: {
        code,
        message,
      },
    });
  }

  async handleStdinClose() {}

  async createSessionState(_payload) {
    throw new Error("createSessionState is not implemented");
  }

  applySessionConfig(session, _configId, _value) {
    return session.options;
  }

  async runSessionPrompt(_session, _payload) {
    throw new Error("runSessionPrompt is not implemented");
  }

  async cancelSessionPrompt(_session, _payload) {
    return {};
  }
}

export class JsonRpcFailure extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function asObject(value, label) {
  if (!isRecord(value)) {
    throw new JsonRpcFailure(RPC_INVALID_PARAMS, `invalid ${label}`);
  }
  return value;
}

export function collectACPText(content) {
  if (!Array.isArray(content)) {
    return "";
  }
  const parts = [];
  for (const item of content) {
    if (!isRecord(item)) {
      continue;
    }
    if (item.type !== "text" || typeof item.text !== "string") {
      continue;
    }
    if (item.text !== "") {
      parts.push(item.text);
    }
  }
  return parts.join("\n");
}

export function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function pickString(source, ...keys) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value !== "string") {
      continue;
    }
    const text = value.trim();
    if (text !== "") {
      return text;
    }
  }
  return null;
}

export function pickValue(source, ...keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key];
    }
  }
  return null;
}
