"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

import { updateMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";

import css from "./EditProfilePage.module.css";

export default function EditProfilePage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const updatedUser = await updateMe({
        username: username.trim(),
      });

      setUser(updatedUser);
      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Update failed")
          : "Update failed",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    router.push("/profile");
  }

  if (!user) {
    return (
      <main className={css.mainContent}>
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        {user.avatar && (
          <Image
            src={user.avatar}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />
        )}

        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>

            <input
              id="username"
              type="text"
              className={css.input}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <p>Email: {user.email}</p>

          <div className={css.actions}>
            <button
              type="submit"
              className={css.saveButton}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              className={css.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>

          {error && <p role="alert">{error}</p>}
        </form>
      </div>
    </main>
  );
}
