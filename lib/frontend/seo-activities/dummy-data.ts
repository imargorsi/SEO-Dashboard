import type {
  TSeoActivityBacklink,
  TSeoActivityBlog,
  TSeoActivityType,
  TSeoActivityTypeCounts,
  TSeoActivityWebChange,
} from "@/types/seo-activity.types";

/** Dummy rows for UI preview until sheet sync lands. */
export const DUMMY_SEO_ACTIVITY_BLOGS: TSeoActivityBlog[] = [
  {
    id: "blog-1",
    projectName: "MTC",
    title: "How To Improve Local SEO Rankings In 2026",
    url: "https://example.com/blog/local-seo-2026",
    occurredOn: "2026-06-02",
  },
  {
    id: "blog-2",
    projectName: "Pets",
    title: "Pet Care Tips For Summer Weather",
    url: "https://example.com/blog/pet-care-summer",
    occurredOn: "2026-06-05",
  },
  {
    id: "blog-3",
    projectName: "MTC",
    title: "Google Maps Optimization Checklist",
    url: "https://example.com/blog/maps-checklist",
    occurredOn: "2026-06-08",
  },
  {
    id: "blog-4",
    projectName: "Acme",
    title: "Content Clusters That Drive Organic Traffic",
    url: "https://example.com/blog/content-clusters",
    occurredOn: "2026-06-11",
  },
  {
    id: "blog-5",
    projectName: "Pets",
    title: "Best Dog Food Brands Compared",
    url: "https://example.com/blog/dog-food-brands",
    occurredOn: "2026-07-02",
  },
  {
    id: "blog-6",
    projectName: "MTC",
    title: "Technical SEO Audit For Ecommerce Sites",
    url: "https://example.com/blog/tech-seo-audit",
    occurredOn: "2026-07-08",
  },
  {
    id: "blog-7",
    projectName: "Acme",
    title: "Link Building Strategies That Still Work",
    url: "https://example.com/blog/link-building",
    occurredOn: "2026-07-14",
  },
  {
    id: "blog-8",
    projectName: "Pets",
    title: "How To Rank A Pet Store Website",
    url: "https://example.com/blog/pet-store-seo",
    occurredOn: "2026-07-20",
  },
];

export const DUMMY_SEO_ACTIVITY_BACKLINKS: TSeoActivityBacklink[] = [
  {
    id: "bl-1",
    projectName: "MTC",
    url: "https://news.example.com/partner-feature",
    anchorText: "Multi Tech Marketing",
    occurredOn: "2026-06-03",
  },
  {
    id: "bl-2",
    projectName: "Pets",
    url: "https://directory.example.com/pets",
    anchorText: "Best Pet Clinic",
    occurredOn: "2026-06-06",
  },
  {
    id: "bl-3",
    projectName: "MTC",
    url: "https://blog.partner.com/guest-post",
    anchorText: "SEO Agency In Riyadh",
    occurredOn: "2026-06-09",
  },
  {
    id: "bl-4",
    projectName: "Acme",
    url: "https://resources.example.org/list",
    anchorText: "Acme Services",
    occurredOn: "2026-06-12",
  },
  {
    id: "bl-5",
    projectName: "Pets",
    url: "https://reviews.example.com/pets-clinic",
    anchorText: "Trusted Pet Care",
    occurredOn: "2026-07-03",
  },
  {
    id: "bl-6",
    projectName: "MTC",
    url: "https://mag.example.com/interview",
    anchorText: "Digital Growth Experts",
    occurredOn: "2026-07-10",
  },
  {
    id: "bl-7",
    projectName: "Acme",
    url: "https://forum.example.net/thread/seo",
    anchorText: "Click Here",
    occurredOn: "2026-07-18",
  },
];

export const DUMMY_SEO_ACTIVITY_WEB_CHANGES: TSeoActivityWebChange[] = [
  {
    id: "wc-1",
    projectName: "MTC",
    url: "https://multitech.sa/services",
    details: "Updated H1 And Meta Description On Services Page",
    occurredOn: "2026-06-04",
  },
  {
    id: "wc-2",
    projectName: "Pets",
    url: "https://pets.example.com/contact",
    details: "Added Schema Markup For Local Business",
    occurredOn: "2026-06-07",
  },
  {
    id: "wc-3",
    projectName: "MTC",
    url: "https://multitech.sa/",
    details: "Fixed Broken Internal Links On Homepage",
    occurredOn: "2026-06-10",
  },
  {
    id: "wc-4",
    projectName: "Acme",
    url: "https://acme.example.com/about",
    details: "Improved Page Speed By Compressing Images",
    occurredOn: "2026-06-13",
  },
  {
    id: "wc-5",
    projectName: "Pets",
    url: "https://pets.example.com/services",
    details: "Rewrote Service Page Copy For Target Keywords",
    occurredOn: "2026-07-05",
  },
  {
    id: "wc-6",
    projectName: "MTC",
    url: "https://multitech.sa/blog",
    details: "Added Breadcrumb Navigation",
    occurredOn: "2026-07-11",
  },
  {
    id: "wc-7",
    projectName: "Acme",
    url: "https://acme.example.com/pricing",
    details: "Updated Pricing Table Layout",
    occurredOn: "2026-07-16",
  },
  {
    id: "wc-8",
    projectName: "Pets",
    url: "https://pets.example.com/",
    details: "Added FAQ Section With Structured Data",
    occurredOn: "2026-07-21",
  },
];

export function getDummySeoActivityCounts(): TSeoActivityTypeCounts {
  return {
    blogs: DUMMY_SEO_ACTIVITY_BLOGS.length,
    backlinks: DUMMY_SEO_ACTIVITY_BACKLINKS.length,
    web_changes: DUMMY_SEO_ACTIVITY_WEB_CHANGES.length,
  };
}

export function getDummySeoActivitiesByType(
  type: TSeoActivityType,
): readonly TSeoActivityBlog[] | readonly TSeoActivityBacklink[] | readonly TSeoActivityWebChange[] {
  if (type === "blogs") return DUMMY_SEO_ACTIVITY_BLOGS;
  if (type === "backlinks") return DUMMY_SEO_ACTIVITY_BACKLINKS;
  return DUMMY_SEO_ACTIVITY_WEB_CHANGES;
}
