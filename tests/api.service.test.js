jest.mock("axios", () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

describe("api service", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetModules();
  });

  function loadApiInstance() {
    const axios = require("axios");
    const api = require("../services/api").default;
    const instance = axios.create.mock.results[0].value;
    return { api, instance };
  }

  test("adds admin token in request interceptor", () => {
    localStorage.setItem("admin_token", "abc123");
    const { api, instance } = loadApiInstance();

    const requestInterceptor = instance.interceptors.request.use.mock.calls[0][0];
    const nextConfig = requestInterceptor({ headers: {} });

    expect(nextConfig.headers.Authorization).toBe("Bearer abc123");
    expect(api).toBeDefined();
  });

  test("clears auth storage on unauthorized response", async () => {
    localStorage.setItem("admin_token", "token");
    localStorage.setItem("admin_user", JSON.stringify({ id: "1" }));
    window.history.pushState({}, "", "/login");
    const { instance } = loadApiInstance();

    const responseErrorInterceptor = instance.interceptors.response.use.mock.calls[0][1];
    const error = { response: { status: 401, data: { message: "not authorized" } } };

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    expect(localStorage.getItem("admin_token")).toBeNull();
    expect(localStorage.getItem("admin_user")).toBeNull();
  });
});
