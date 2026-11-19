import { siteOgImage } from "@/components/OgCards";

// Required by static export (output: "export") for a route handler.
export const dynamic = "force-static";

export function GET() {
  return siteOgImage("en");
}
