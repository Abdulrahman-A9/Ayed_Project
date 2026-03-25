import { PublicPortfolioPage } from "@/components/portfolio/public-portfolio-page";
import { getPublicPortfolio } from "@/lib/public-api";

export default async function Home() {
  const portfolio = await getPublicPortfolio();

  return <PublicPortfolioPage portfolio={portfolio} />;
}
