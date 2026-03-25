import { demoPortfolio } from "@/lib/demo-content";
import type { ContactFormFields, PortfolioPayload } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export async function getPublicPortfolio(): Promise<PortfolioPayload> {
  try {
    const response = await fetch(`${API_BASE}/public/portfolio/`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return demoPortfolio;
    }

    const data = await response.json();
    if (!data || !("brand_name" in data)) {
      return demoPortfolio;
    }

    return data as PortfolioPayload;
  } catch {
    return demoPortfolio;
  }
}

export async function submitContactForm(values: ContactFormFields) {
  const response = await fetch(`${API_BASE}/public/contact/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("Contact request failed");
  }

  return response.json();
}