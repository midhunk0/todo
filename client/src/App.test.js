// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { describe, test, expect } from "vitest";

describe("App Routing", () => {
  const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  test("redirects from '/' to '/login'", () => {
    renderWithRouter(<App />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test("renders Login component at /login", () => {
    window.history.pushState({}, "Login page", "/login");
    renderWithRouter(<App />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test("renders Register component at /register", () => {
    window.history.pushState({}, "Register page", "/register");
    renderWithRouter(<App />);
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  test("renders Todo component at /todo", () => {
    window.history.pushState({}, "Todo page", "/todo");
    renderWithRouter(<App />);
    expect(screen.getByText(/todo/i)).toBeInTheDocument();
  });

  test("renders Trash component at /trash", () => {
    window.history.pushState({}, "Trash page", "/trash");
    renderWithRouter(<App />);
    expect(screen.getByText(/trash/i)).toBeInTheDocument();
  });

  test("renders ToastContainer with correct styles", () => {
    renderWithRouter(<App />);
    const toastContainer = screen.getByRole("alert");
    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer).toHaveStyle({
      background: "#00D7FF",
      borderRadius: "25px",
    });
  });
});
