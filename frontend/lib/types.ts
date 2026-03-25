export type Service = {
  id: number;
  title: string;
  description: string;
  short_label: string;
  sort_order: number;
  is_published: boolean;
  icon?: string;
};

export type MediaType = "image" | "video";

export type AdminMediaAsset = {
  id: number;
  media_type: MediaType;
  title: string;
  description: string;
  original_filename: string;
  file_key: string;
  thumbnail_key: string;
  file_url: string;
  thumbnail_url: string;
  mime_type: string;
  size_bytes: number;
  duration_seconds?: number | null;
  width?: number | null;
  height?: number | null;
  featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at?: string;
  category?: string;
  project_client?: string;
  project_location?: string;
};

export type Testimonial = {
  id: number;
  client_name: string;
  client_role: string;
  quote: string;
  rating: number;
  sort_order: number;
  is_published: boolean;
  client_photo_url?: string;
};

export type AdminAnnouncement = {
  id: number;
  badge: string;
  title: string;
  body: string;
  cta_label: string;
  cta_url: string;
  starts_at?: string | null;
  ends_at?: string | null;
  is_published: boolean;
};

export type ContactSubmission = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string;
};

export type PortfolioSite = {
  id: number;
  brand_name: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_body: string;
  services_title: string;
  contact_email: string;
  contact_phone: string;
  base_city: string;
  instagram_url: string;
  youtube_url: string;
  tiktok_url: string;
  whatsapp_url: string;
  twitter_url?: string;
  snapchat_url?: string;
  meta_title: string;
  meta_description: string;
};

export type PortfolioPayload = PortfolioSite & {
  services: Service[];
  images: AdminMediaAsset[];
  videos: AdminMediaAsset[];
  announcements: AdminAnnouncement[];
  testimonials: Testimonial[];
};

export type ContactFormFields = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};