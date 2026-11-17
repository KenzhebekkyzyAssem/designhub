import { NextRequest, NextResponse } from "next/server";

const categoryQueries: Record<string, string> = {
  all: "creative design",
  websites: "website design",
  "ui/ux": "mobile app design",
  branding: "brand identity design",
  typography: "typography graphic design",
  colors: "color palette design",
  interior: "modern interior design",
  photography: "creative photography",
};

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Pexels API key is missing." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category")?.toLowerCase() || "all";
    const search = searchParams.get("search")?.trim();
    const page = searchParams.get("page") || "1";

    const query =
      search || categoryQueries[category] || categoryQueries.all;

    const pexelsUrl = new URL("https://api.pexels.com/v1/search");

    pexelsUrl.searchParams.set("query", query);
    pexelsUrl.searchParams.set("per_page", "20");
    pexelsUrl.searchParams.set("page", page);

    const response = await fetch(pexelsUrl.toString(), {
      headers: {
        Authorization: apiKey,
      },
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Pexels API error:", errorText);

      return NextResponse.json(
        { error: "Failed to load inspiration." },
        { status: response.status }
      );
    }

    const data = await response.json();

    const inspirations = data.photos.map(
      (photo: {
        id: number;
        width: number;
        height: number;
        url: string;
        photographer: string;
        photographer_url: string;
        alt: string;
        src: {
          large: string;
          large2x: string;
          medium: string;
        };
      }) => ({
        id: photo.id,
        title: photo.alt || "Creative inspiration",
        image: photo.src.large,
        width: photo.width,
        height: photo.height,

        photographer: {
          name: photo.photographer,
          url: photo.photographer_url,
        },

        pexelsUrl: photo.url,
      })
    );

    return NextResponse.json({
      inspirations,
      page: data.page,
      perPage: data.per_page,
      totalResults: data.total_results,
      nextPage: data.next_page ?? null,
      previousPage: data.prev_page ?? null,
    });
  } catch (error) {
    console.error("Inspiration API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}