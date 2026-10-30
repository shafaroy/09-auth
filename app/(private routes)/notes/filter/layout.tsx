import type { ReactNode } from "react";
import css from "./LayoutNotes.module.css";

interface LayoutNotesProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function LayoutNotes({ children, sidebar }: LayoutNotesProps) {
  return (
    <section className={css.container}>
      <aside className={css.sidebar}>{sidebar}</aside>
      <div className={css.notesWrapper}>{children}</div>
    </section>
  );
}
