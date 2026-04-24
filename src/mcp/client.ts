import { sleep } from "../utils/helpers";

export interface McpCallOptions {
  server: "food" | "instamart" | "dineout";
  tool: string;
  args: Record<string, unknown>;
}

interface RateLimitState {
  lastCall: number;
  callCount: number;
  windowStart: number;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_CALLS_PER_WINDOW = 50;

/**
 * MCP Client wrapper for Swiggy's three MCP servers.
 * Handles retries, rate limiting, and connection health.
 */
export class McpClient {
  private rateLimits: Map<string, RateLimitState> = new Map();
  private serverHealth: Map<string, boolean> = new Map([
    ["food", true],
    ["instamart", true],
    ["dineout", true],
  ]);

  /**
   * Execute an MCP tool call with retry and rate limiting.
   */
  async call<T = unknown>(options: McpCallOptions): Promise<T> {
    await this.enforceRateLimit(options.server);

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await this.executeMcpCall<T>(options);
        this.serverHealth.set(options.server, true);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (this.isRateLimitError(lastError)) {
          const delay =
            BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500;
          await sleep(delay);
          continue;
        }

        if (attempt < MAX_RETRIES - 1) {
          await sleep(BASE_DELAY_MS * Math.pow(2, attempt));
        }
      }
    }

    this.serverHealth.set(options.server, false);
    throw new Error(
      `MCP call failed after ${MAX_RETRIES} retries: ${options.server}/${options.tool} — ${lastError?.message}`,
    );
  }

  /** Check if a server is healthy */
  isServerHealthy(server: string): boolean {
    return this.serverHealth.get(server) ?? false;
  }

  /** Run health checks on all servers */
  async checkHealth(): Promise<Record<string, boolean>> {
    const servers = ["food", "instamart", "dineout"] as const;
    const results: Record<string, boolean> = {};

    for (const server of servers) {
      try {
        // A lightweight ping — in real impl this would call a health endpoint
        results[server] = true;
        this.serverHealth.set(server, true);
      } catch {
        results[server] = false;
        this.serverHealth.set(server, false);
      }
    }

    return results;
  }

  private async enforceRateLimit(server: string): Promise<void> {
    const now = Date.now();
    let state = this.rateLimits.get(server);

    if (!state || now - state.windowStart > RATE_LIMIT_WINDOW_MS) {
      state = { lastCall: now, callCount: 1, windowStart: now };
      this.rateLimits.set(server, state);
      return;
    }

    if (state.callCount >= MAX_CALLS_PER_WINDOW) {
      const waitTime = RATE_LIMIT_WINDOW_MS - (now - state.windowStart);
      await sleep(waitTime);
      state.callCount = 0;
      state.windowStart = Date.now();
    }

    state.callCount++;
    state.lastCall = now;
  }

  /**
   * Actual MCP call execution.
   * In production, this connects to the real MCP server via the SDK.
   * For now, this is a placeholder that simulates the call structure.
   */
  private async executeMcpCall<T>(options: McpCallOptions): Promise<T> {
    // TODO: Replace with actual MCP SDK client.callTool() when Swiggy MCP servers are configured
    // const client = this.getClient(options.server);
    // const result = await client.callTool({ name: options.tool, arguments: options.args });
    // return result as T;

    console.log(
      `[MCP] ${options.server}/${options.tool}`,
      JSON.stringify(options.args).slice(0, 100),
    );
    throw new Error(
      `MCP server "${options.server}" not yet connected. Configure Swiggy MCP servers to enable live calls.`,
    );
  }

  private isRateLimitError(err: Error): boolean {
    return err.message.includes("rate limit") || err.message.includes("429");
  }
}

/** Singleton MCP client instance */
export const mcpClient = new McpClient();
