import { getCatalogDeals } from "@/lib/deals";
import { DealGrid } from "@/components/deal-grid";
import { Pagination } from "@/components/pagination";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { deals, pagination } = await getCatalogDeals({ page });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Bons plans tennis
      </h1>
      <DealGrid deals={deals} />
      <Pagination currentPage={pagination.current_page} totalPages={pagination.total_pages} />
    </main>
  );
}
