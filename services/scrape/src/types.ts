export type FacebookPageImportData = {
  pageId: string;
  pageUrl: string;
  name: string;
  about: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  state: string;
  category: string;
  addressLine: string;
  profilePictureUrl: string;
  coverPhotoUrl: string;
  photoUrls: string[];
  postSnippets: string[];
};

export type WebsitePageDump = {
  url: string;
  title: string;
  h1: string;
  metaDescription: string;
  bodyText: string;
  headings: string[];
};

export type WebsiteScrapeData = {
  siteUrl: string;
  name: string;
  tagline: string;
  about: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  state: string;
  addressLine: string;
  services: string[];
  pagesVisited: string[];
  pageSummaries: WebsitePageDump[];
  logoUrl: string;
  imageUrls: string[];
  socialLinks: string[];
};
