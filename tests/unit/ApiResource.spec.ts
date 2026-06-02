import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from "vitest";
import ApiResource from "@/common/ApiResource";

describe("ApiResource", () => {
  let fetchMock: MockInstance;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("no params -- /api prefix added, no ? appended", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const resource = new ApiResource();
    await resource.getJson("/users");
    expect(fetchMock).toHaveBeenCalledWith("/api/users", { headers: { Accept: "application/json" } });
  });

  it("non-null params -- serialized as query string", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const resource = new ApiResource();
    await resource.getJsonWithParams("/users", { name: "Bill", age: "25" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/users?name=Bill&age=25",
      { headers: { Accept: "application/json" } }
    );
  });

  it("URL already starting with /api -- prefix not doubled", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const resource = new ApiResource();
    await resource.getJson("/api/users");
    expect(fetchMock).toHaveBeenCalledWith("/api/users", { headers: { Accept: "application/json" } });
  });

  it("non-ok response -- throws with HTTP status", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });
    const resource = new ApiResource();
    await expect(resource.getJson("/missing")).rejects.toThrow("HTTP 404");
  });

  it("URL already has query string -- & separator used, not ?", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const resource = new ApiResource();
    await resource.getJsonWithParams("/users?active=true", { page: "2" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/users?active=true&page=2",
      { headers: { Accept: "application/json" } }
    );
  });
});
