const API_PREFIX = "/api";

export default class ApiResource {
  getJson(url: string): Promise<unknown> {
    return this.getJsonWithParams(url, null);
  }

  async getJsonWithParams(url: string, params?: Record<string, string> | null): Promise<unknown> {
    let apiUrl = url.startsWith(API_PREFIX) ? url : API_PREFIX + url;
    if (params) {
      const sep = apiUrl.includes("?") ? "&" : "?";
      apiUrl += sep + new URLSearchParams(params).toString();
    }
    const res = await fetch(apiUrl, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}
