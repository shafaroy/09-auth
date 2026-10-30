import type { Metadata } from "next";
import { cache } from "react";
import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";

import { fetchNoteById } from "@/lib/api/serverApi";
import { openGraphImage, siteUrl } from "@/lib/metadata";
import NoteDetailsClient from "./NoteDetails.client";

interface NoteDetailsPageProps {
  params: Promise<{ id: string }>;
}

const getNote = cache(async (id: string) => {
  try {
    return await fetchNoteById(id);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }
    throw error;
  }
});

export async function generateMetadata({
  params,
}: NoteDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const note = await getNote(id);
  const title = `${note.title} | NoteHub`;
  const description =
    note.content.trim().slice(0, 160) ||
    `Read the note "${note.title}" in NoteHub.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: new URL(`/notes/${encodeURIComponent(id)}`, siteUrl).toString(),
      images: [openGraphImage],
    },
  };
}

export default async function NoteDetailsPage({
  params,
}: NoteDetailsPageProps) {
  const { id } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["note", id],
    queryFn: () => getNote(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
