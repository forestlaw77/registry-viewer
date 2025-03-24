import { NextRequest, NextResponse } from "next/server";

const REGISTRY_URL = process.env.NEXT_PUBLIC_REGISTRY_URL || "http://localhost:5000";

/**
 * Removes sensitive or unnecessary headers from a request.
 *
 * @param headers - The original Headers object from the client request.
 * @returns A new Headers object with sensitive headers (e.g., Host, Authorization) removed.
 */
const sanitizeHeaders = (headers: Headers): Headers => {
  const sanitizedHeaders = new Headers(headers);
  sanitizedHeaders.delete("Host");
  sanitizedHeaders.delete("Authorization");
  return sanitizedHeaders;
};

/**
 * Constructs the URL for the registry and retrieves sanitized headers.
 *
 * @param req - The incoming Next.js request object.
 * @returns An object containing the constructed registry URL and sanitized headers.
 */
const buildRegistryUrl = (
  req: NextRequest
): { url: string; headers: Headers } => {
  let registryPath = req.nextUrl.pathname.replace(/^\/api\/proxy/, "");
  if (!registryPath) {
    registryPath = "/";
  }
  const url = `${REGISTRY_URL}/v2${registryPath}`;
  const headers = sanitizeHeaders(new Headers(req.headers));
  return { url, headers };
};

/**
 * Handles errors that occur during a fetch operation, logs the error,
 * and generates a NextResponse object with a 500 status code.
 *
 * @param error - The error object or value that occurred during the operation.
 * @param message - A custom error message to log alongside the error details.
 * @returns A NextResponse object indicating an internal server error.
 */
const handleErrorResponse = (error: unknown, message: string): NextResponse => {
  if (error instanceof Error) {
    console.error(message, error.message);
  } else {
    console.error(message, error);
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

/**
 * Adds custom headers to a request.
 *
 * @param req - The incoming Next.js request object.
 * @returns A new Headers object with custom headers appended.
 */
const getCustomHeaders = (req: NextRequest): Headers => {
  const headers = new Headers(req.headers);
  headers.set("X-Custom-Header", "my-custom-value");
  return headers;
};

/**
 * Processes the response from the registry, logging any errors if applicable,
 * and transparently returns the response body and headers.
 *
 * @param response - The Response object from the fetch operation.
 * @returns A NextResponse object containing the response body, headers, and status code.
 */
const handleFetchResponse = async (
  response: Response
): Promise<NextResponse> => {
  if (!response.ok) {
    console.error("Registry API error:", response.status, response.statusText);
    return NextResponse.json(
      { error: response.statusText || "Failed to fetch from registry" },
      { status: response.status }
    );
  }
  return new NextResponse(response.body, {
    headers: response.headers,
    status: response.status,
  });
};

/**
 * Logs the incoming request details for debugging purposes.
 *
 * @param req - The incoming Next.js request object.
 * @param method - The HTTP method of the request (e.g., GET, POST).
 */
const logRequest = (req: NextRequest, method: string) => {
  console.log(`[${method}] API Called: ${req.nextUrl.pathname}`);
};

/**
 * Logs the fetch operation details for debugging purposes.
 *
 * @param url - The URL being fetched.
 * @param method - The HTTP method of the fetch operation (e.g., GET, POST).
 */
const logFetch = (url: string, method: string) => {
  console.log(`[${method}] Fetching from: ${url}`);
};

/**
 * Logs the response details for debugging purposes.
 *
 * @param response - The Response object from the fetch operation.
 * @param method - The HTTP method of the fetch operation (e.g., GET, POST).
 */
const logResponse = (response: Response, method: string) => {
  console.log(`[${method}] Response Status: ${response.status}`);
};

/**
 * Simple fetch request to the registry with the specified HTTP method, headers, and optional body.
 *
 * @param method - The HTTP method to use for the fetch request (e.g., GET, POST, PUT, DELETE).
 * @param url - The registry URL to send the request to.
 * @param headers - The headers to include in the fetch request.
 * @param body - Optional request body for POST and PUT operations.
 * @returns A promise that resolves to the registry's response or error details.
 */
const simpleFetch = async (
  method: string,
  url: string,
  headers: Headers,
  body?: string | null
) => {
  try {
    const response = await fetch(url, { method, headers, body });
    logResponse(response, method);
    return await handleFetchResponse(response);
  } catch (error) {
    return handleErrorResponse(error, `[${method}] Fetch error`);
  }
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Performs a fetch request to the registry with the specified HTTP method, headers, and optional body.
 *
 * @param method - The HTTP method to use for the fetch request (e.g., GET, POST, PUT, DELETE).
 * @param url - The registry URL to send the request to.
 * @param headers - The headers to include in the fetch request.
 * @param body - Optional request body for POST and PUT operations.
 * @returns A NextResponse object containing the registry's response or error details.
 */
const performFetch = async (
  method: string,
  url: string,
  headers: Headers,
  body?: string | null
): Promise<NextResponse> => {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount <= maxRetries) {
    try {
      console.log("1 Request Headers:", [...headers.entries()]);
      const response = await fetch(url, { method, headers, body });
      console.log("2 Request Headers:", [...headers.entries()]);
      if (response.status === 304) {
        console.warn(
          `[${method}] Cache miss occurred for ${url}. Retrying... (${
            retryCount + 1
          }/${maxRetries})`
        );
        retryCount++;
        if (retryCount > maxRetries) {
          return NextResponse.json(
            { error: "Cache miss after max retries." },
            { status: 404 }
          );
        }
        await wait(1000); // wait 1 second
        continue; // retry
      }
      //const data = await response.json();
      //return NextResponse.json(data, { status: response.status });
      logResponse(response, method);
      return await handleFetchResponse(response);
    } catch (error) {
      if (retryCount >= maxRetries) {
        return handleErrorResponse(
          error,
          `[${method}] Fetch error after max retries`
        );
      }
      console.warn(
        `[${method}] Error encountered. Retrying... (${
          retryCount + 1
        }/${maxRetries})`
      );
      retryCount++;
    }
  }
  // fallback
  return NextResponse.json(
    { error: "Unexpected error during fetch." },
    { status: 500 }
  );
};

/**
 * Handles GET requests by forwarding them to the registry and returning the response.
 *
 * @param req - The incoming Next.js request object.
 * @returns A NextResponse object containing the registry's response or error details.
 */
export const GET = async (req: NextRequest): Promise<NextResponse> => {
  logRequest(req, "GET");
  const { url, headers } = buildRegistryUrl(req);
  logFetch(url, "GET");
  //return await performFetch("GET", url, headers);
  return await simpleFetch("GET", url, headers);
};

/**
 * Handles POST requests by forwarding them to the registry and returning the response.
 *
 * @param req - The incoming Next.js request object.
 * @returns A NextResponse object containing the registry's response or error details.
 */
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  logRequest(req, "POST");
  const { url, headers } = buildRegistryUrl(req);
  const body = await req.text();
  logFetch(url, "POST");
  return await simpleFetch("POST", url, headers);
};

/**
 * Handles PUT requests by forwarding them to the registry and returning the response.
 *
 * @param req - The incoming Next.js request object.
 * @returns A NextResponse object containing the registry's response or error details.
 */
export const PUT = async (req: NextRequest): Promise<NextResponse> => {
  logRequest(req, "PUT");
  const { url, headers } = buildRegistryUrl(req);
  const body = await req.text();
  logFetch(url, "PUT");
  return await simpleFetch("PUT", url, headers, body);
};

/**
 * Handles DELETE requests by forwarding them to the registry and returning the response.
 *
 * @param req - The incoming Next.js request object.
 * @returns A NextResponse object containing the registry's response or error details.
 */
export const DELETE = async (req: NextRequest): Promise<NextResponse> => {
  logRequest(req, "DELETE");
  const { url, headers } = buildRegistryUrl(req);
  logFetch(url, "DELETE");
  return await simpleFetch("DELETE", url, headers);
};
