import { cookies } from "next/headers";
import { api } from "./api";

import type { FetchNotesParams, FetchNotesResponse, Note } from "@/types/note";
import type { User } from "@/types/user";
export async function fetchNotes({
  page,
  perPage,
  search = "",
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const cookieStore = await cookies();

  const response = await api.get<FetchNotesResponse>("/notes", {
    headers: {
      Cookie: cookieStore.toString(),
    },
    params: {
      page,
      perPage,
      search,
      ...(tag ? { tag } : {}),
    },
  });

  return response.data;
}
export async function fetchNoteById(id: string): Promise<Note> {
  const cookieStore = await cookies();

  const response = await api.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
}
export async function getMe(): Promise<User> {
  const cookieStore = await cookies();

  const response = await api.get<User>("/users/me", {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
}
export async function checkSession() {
  const cookieStore = await cookies();

  const response = await api.get<{ success: boolean }>("/auth/session", {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response;
}
