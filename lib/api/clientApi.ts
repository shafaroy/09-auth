import { api } from "./api";
import type {
  CreateNoteParams,
  FetchNotesParams,
  FetchNotesResponse,
  Note,
} from "@/types/note";

import type { User } from "@/types/user";

export async function fetchNotes({
  page,
  perPage,
  search = "",
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const response = await api.get<FetchNotesResponse>("/notes", {
    params: { page, perPage, search, ...(tag ? { tag } : {}) },
  });
  return response.data;
}

export async function createNote(newNote: CreateNoteParams): Promise<Note> {
  const response = await api.post<Note>("/notes", newNote);
  return response.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const response = await api.delete<Note>(`/notes/${id}`);
  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${id}`);
  return response.data;
}
export async function register(data: RegisterRequest): Promise<User> {
  const response = await api.post<User>("/auth/register", data);
  return response.data;
}
type RegisterRequest = {
  email: string;
  password: string;
};
type LoginRequest = {
  email: string;
  password: string;
};

export async function login(data: LoginRequest): Promise<User> {
  const response = await api.post<User>("/auth/login", data);
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function checkSession(): Promise<boolean> {
  const response = await api.get<{ success: boolean }>("/auth/session");

  return response.data.success;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/users/me");
  return response.data;
}

export async function updateMe(data: { username: string }): Promise<User> {
  const response = await api.patch<User>("/users/me", data);
  return response.data;
}
