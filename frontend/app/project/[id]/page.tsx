import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/public-api";
import { ProjectDetailPage } from "@/components/portfolio/project-detail-page";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) notFound();

  const portfolio = await getPublicPortfolio();
  const allMedia = [...portfolio.images, ...portfolio.videos];
  const item = allMedia.find((m) => m.id === id);
  if (!item) notFound();

  const related = allMedia
    .filter((m) => m.id !== item.id && item.category && m.category === item.category)
    .slice(0, 3);

  return (
    <ProjectDetailPage
      item={item}
      brandName={portfolio.brand_name}
      contactEmail={portfolio.contact_email}
      related={related}
    />
  );
}
