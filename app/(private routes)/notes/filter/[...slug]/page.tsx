import type { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";

import { fetchNotes } from "@/lib/api/serverApi";
import { openGraphImage, siteUrl } from "@/lib/metadata";
import type { NoteTag } from "@/types/note";
import NotesClient from "./Notes.client";

interface NotesPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

const tags: NoteTag[] = ["Todo", "Work", "Personal", "Meeting", "Shopping"];

export async function generateMetadata({
  params,
}: NotesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const filter = tags.includes(slug[0] as NoteTag) ? slug[0] : "All";
  const title = `${filter} notes | NoteHub`;
  const description =
    filter === "All"
      ? "Browse, search, and manage all your notes in NoteHub."
      : `Browse, search, and manage your ${filter} notes in NoteHub.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: new URL(
        `/notes/filter/${slug.map(encodeURIComponent).join("/")}`,
        siteUrl,
      ).toString(),
      images: [openGraphImage],
    },
  };
}

export default async function NotesPage({ params }: NotesPageProps) {
  const { slug } = await params;

  const selectedTag = slug[0];

  const tag: NoteTag | undefined = tags.includes(selectedTag as NoteTag)
    ? (selectedTag as NoteTag)
    : undefined;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", "", 1, tag],
    queryFn: () =>
      fetchNotes({
        page: 1,
        perPage: 12,
        search: "",
        tag,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={tag} />
    </HydrationBoundary>
  );
}
