"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { register } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";

import css from "./SignUpPage.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const user = await register({ email, password });

      setUser(user);
      router.push("/profile");
      router.refresh();
    } catch (err) {
      console.error("Registration error:", err);

      if (axios.isAxiosError(err)) {
        console.log("Status:", err.response?.status);
        console.log("Response:", err.response?.data);

        setError(err.response?.data?.message ?? "Registration failed");
      } else {
        setError("Registration failed");
      }
    }
  }
  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Sign up</h1>

      <form className={css.form} onSubmit={handleSubmit}>
        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            className={css.input}
            required
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            className={css.input}
            required
          />
        </div>

        <div className={css.actions}>
          <button
            type="submit"
            className={css.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </div>

        {error && <p className={css.error}>{error}</p>}
      </form>
    </main>
  );
}
