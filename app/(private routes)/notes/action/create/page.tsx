import type { Metadata } from "next";
import NoteForm from "@/components/NoteForm/NoteForm";
import { openGraphImage, siteUrl } from "@/lib/metadata";
import css from "./CreateNote.module.css";

export const metadata: Metadata = {
  title: "Create note | NoteHub",
  description:
    "Create a new note in NoteHub. Your draft is saved automatically so you can finish it later.",
  openGraph: {
    title: "Create note | NoteHub",
    description:
      "Create a new note in NoteHub. Your draft is saved automatically so you can finish it later.",
    url: new URL("/notes/action/create", siteUrl).toString(),
    images: [openGraphImage],
  },
};

export default function CreateNote() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <NoteForm />
      </div>
    </main>
  );
}
