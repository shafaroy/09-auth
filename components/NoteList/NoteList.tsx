"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteNote } from "@/lib/api/clientApi";
import type { Note } from "@/types/note";

import css from "./NoteList.module.css";

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <>
      <ul className={css.list}>
        {notes.map((note) => (
          <li key={note.id} className={css.listItem}>
            <h3 className={css.title}>{note.title}</h3>

            <p className={css.content}>{note.content}</p>

            <div className={css.footer}>
              <span className={css.tag}>{note.tag}</span>

              <Link href={`/notes/${note.id}`} className={css.link}>
                View details
              </Link>

              <button
                type="button"
                className={css.button}
                onClick={() => handleDelete(note.id)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {deleteMutation.isError && (
        <p>Could not delete note. Please try again.</p>
      )}
    </>
  );
}
