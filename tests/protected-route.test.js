import { render, screen, waitFor } from "@testing-library/react";
import ProtectedRoute from "../components/ProtectedRoute";

const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("redirects to login when token is missing", async () => {
    render(
      <ProtectedRoute>
        <div>dashboard content</div>
      </ProtectedRoute>
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  test("renders children when token exists", async () => {
    localStorage.setItem("admin_token", "token-1");

    render(
      <ProtectedRoute>
        <div>dashboard content</div>
      </ProtectedRoute>
    );

    expect(await screen.findByText("dashboard content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
