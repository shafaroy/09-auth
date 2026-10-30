"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";

import { fetchNotes } from "@/lib/api/clientApi";
import type { NoteTag } from "@/types/note";

import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";

import css from "./NotesPage.module.css";

const PER_PAGE = 12;

interface NotesClientProps {
  tag?: NoteTag;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const { data, isPending, isError } = useQuery({
    queryKey: ["notes", search, page, tag],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        search,
        tag,
      }),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });

  const handleSearch = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  return (
    <main className={css.app} aria-label="Notes">
      <div className={css.toolbar}>
        <SearchBox value={inputValue} onChange={handleSearch} />

        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}

        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </div>

      {isPending && <p>Loading, please wait...</p>}

      {isError && <p>Something went wrong.</p>}

      {data && !isPending && !isError && <NoteList notes={data.notes} />}
    </main>
  );
}
