import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../app/login/page";
import api from "../services/api";

const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

jest.mock("../services/api", () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("logs in and redirects to dashboard", async () => {
    api.post.mockResolvedValueOnce({
      data: { token: "token-1", user: { name: "Admin" } },
    });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "admin@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/admin/login", {
      email: "admin@test.com",
      password: "password123",
    }));
    expect(localStorage.getItem("admin_token")).toBe("token-1");
    expect(localStorage.getItem("admin_user")).toBe(JSON.stringify({ name: "Admin" }));
    expect(replace).toHaveBeenCalledWith("/dashboard");
  });

  test("shows server error message on failed login", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid email or password" } },
    });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "bad@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
