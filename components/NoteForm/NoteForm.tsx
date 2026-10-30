"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createNote } from "@/lib/api/clientApi";
import { useNoteStore } from "@/lib/store/noteStore";
import type { NoteDraft, NoteTag } from "@/types/note";
import css from "./NoteForm.module.css";

const validationSchema: Yup.ObjectSchema<NoteDraft> = Yup.object({
  title: Yup.string()
    .trim()
    .min(3, "Title must contain at least 3 characters")
    .max(50, "Title must contain at most 50 characters")
    .required("Title is required"),
  content: Yup.string()
    .trim()
    .max(500, "Content must contain at most 500 characters")
    .defined(),
  tag: Yup.mixed<NoteTag>()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"])
    .required("Tag is required"),
});

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useNoteStore((state) => state.draft);
  const setDraft = useNoteStore((state) => state.setDraft);
  const clearDraft = useNoteStore((state) => state.clearDraft);
  const [errors, setErrors] = useState<
    Partial<Record<keyof NoteDraft, string>>
  >({});

  // Mount uncontrolled fields after the browser restores the persisted draft.
  const isHydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      clearDraft();
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push("/notes/filter/all");
    },
  });

  async function formAction(formData: FormData): Promise<void> {
    setErrors({});

    let values: NoteDraft;
    try {
      values = await validationSchema.validate(
        {
          title: formData.get("title"),
          content: formData.get("content"),
          tag: formData.get("tag"),
        },
        { abortEarly: false },
      );
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const fieldErrors: Partial<Record<keyof NoteDraft, string>> = {};
        for (const issue of error.inner) {
          if (
            issue.path === "title" ||
            issue.path === "content" ||
            issue.path === "tag"
          ) {
            fieldErrors[issue.path] ??= issue.message;
          }
        }
        setErrors(fieldErrors);
        return;
      }
      throw error;
    }

    // React Query exposes mutation errors below; failed requests keep the draft.
    await createMutation.mutateAsync(values).catch(() => {});
  }

  if (!isHydrated) {
    return <p role="status">Loading draft...</p>;
  }

  return (
    <form action={formAction} className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          className={css.input}
          id="title"
          name="title"
          type="text"
          defaultValue={draft.title}
          onChange={(event) => setDraft({ title: event.target.value })}
          required
          minLength={3}
          maxLength={50}
          disabled={createMutation.isPending}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <p id="title-error" className={css.error}>
            {errors.title}
          </p>
        )}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          className={css.textarea}
          id="content"
          name="content"
          rows={8}
          defaultValue={draft.content}
          onChange={(event) => setDraft({ content: event.target.value })}
          maxLength={500}
          disabled={createMutation.isPending}
          aria-invalid={Boolean(errors.content)}
          aria-describedby={errors.content ? "content-error" : undefined}
        />
        {errors.content && (
          <p id="content-error" className={css.error}>
            {errors.content}
          </p>
        )}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          className={css.select}
          id="tag"
          name="tag"
          defaultValue={draft.tag}
          onChange={(event) => setDraft({ tag: event.target.value as NoteTag })}
          disabled={createMutation.isPending}
          aria-invalid={Boolean(errors.tag)}
          aria-describedby={errors.tag ? "tag-error" : undefined}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
        {errors.tag && (
          <p id="tag-error" className={css.error}>
            {errors.tag}
          </p>
        )}
      </div>

      {createMutation.isError && (
        <p role="alert" className={css.error}>
          Could not create note. Please try again.
        </p>
      )}

      <div className={css.actions}>
        <button
          className={css.cancelButton}
          type="button"
          onClick={() => router.back()}
          disabled={createMutation.isPending}
        >
          Cancel
        </button>
        <button
          className={css.submitButton}
          type="submit"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Creating..." : "Create note"}
        </button>
      </div>
    </form>
  );
}
