const API_BASE_URL = "http://localhost:3000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include", // 👈 send cookies
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    const errorBody = isJson ? await res.json() : await res.text();
    const error = new Error(
      (isJson && errorBody?.error) || errorBody || "Request failed"
    );
    error.status = res.status;
    error.body = errorBody;
    throw error;
  }

  return isJson ? res.json() : res.text();
}

// Specific API calls
export function fetchMe() {
  return request("/auth/me");
}

export function logoutRequest() {
  return request("/auth/logout", {
    method: "POST",
  });
}

export { API_BASE_URL };
