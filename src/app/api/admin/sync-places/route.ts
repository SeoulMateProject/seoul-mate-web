import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SEOUL_OPEN_API_BASE_URL =
  process.env.SEOUL_OPEN_API_BASE_URL ?? "https://openapi.seoul.go.kr:8088";
const SEOUL_OPEN_API_KEY = process.env.SEOUL_OPEN_API_KEY;
const SEOUL_TOUR_PLACE_SERVICE = process.env.SEOUL_TOUR_PLACE_SERVICE ?? "SeoulTouristAttractions";

const ADMIN_SYNC_SECRET = process.env.ADMIN_SYNC_SECRET;

type SeoulTourRow = {
  [key: string]: unknown;
};

async function fetchSeoulTourPage(start: number, end: number): Promise<SeoulTourRow[]> {
  if (!SEOUL_OPEN_API_KEY) {
    throw new Error("SEOUL_OPEN_API_KEY is not set");
  }

  const url = `${SEOUL_OPEN_API_BASE_URL}/${SEOUL_OPEN_API_KEY}/json/${SEOUL_TOUR_PLACE_SERVICE}/${start}/${end}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Seoul OpenAPI request failed with status ${res.status}`);
  }

  const json = (await res.json()) as Record<string, unknown>;
  const serviceRoot = json[SEOUL_TOUR_PLACE_SERVICE];
  const rows: SeoulTourRow[] = serviceRoot?.row ?? [];

  return rows;
}

function mapRowToPlaceData(row: SeoulTourRow) {
  // 필드명은 OA-21050 스키마에 맞게 조정 필요
  const externalId = String(row["고유번호"] ?? "");
  const name = (row["상호명"] as string | undefined) ?? "";

  if (!externalId || !name) {
    return null;
  }

  const district = (row["구명"] as string | undefined) ?? undefined;

  const address = (row["주소"] as string | undefined) ?? undefined;
  const newAddress = (row["신주소"] as string | undefined) ?? undefined;
  const phone = (row["전화번호"] as string | undefined) ?? undefined;
  const website = (row["웹사이트"] as string | undefined) ?? undefined;
  const openingHours = (row["이용시간"] as string | undefined) ?? undefined;
  const openDays = (row["운영요일"] as string | undefined) ?? undefined;
  const closedDays = (row["휴무일"] as string | undefined) ?? undefined;
  const transportInfo = (row["교통정보"] as string | undefined) ?? undefined;
  const tagsRaw = (row["태그"] as string | undefined) ?? "";
  const accessibility = (row["장애인편의시설"] as string | undefined) ?? undefined;

  const tags =
    tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean) ?? [];

  return {
    externalId,
    name,
    district,
    address,
    newAddress,
    phone,
    website,
    openingHours,
    openDays,
    closedDays,
    transportInfo,
    tags,
    accessibility,
  };
}

export async function POST(request: Request) {
  if (ADMIN_SYNC_SECRET) {
    const headerSecret = request.headers.get("x-admin-secret");
    if (headerSecret !== ADMIN_SYNC_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const PAGE_SIZE = 500;
  let start = 1;
  let totalUpserted = 0;

  while (true) {
    const end = start + PAGE_SIZE - 1;

    const rows = await fetchSeoulTourPage(start, end);

    if (!rows.length) {
      break;
    }

    const mapped = rows
      .map(mapRowToPlaceData)
      .filter((row): row is NonNullable<ReturnType<typeof mapRowToPlaceData>> => row !== null);

    for (const place of mapped) {
      await prisma.place.upsert({
        where: {
          externalId: place.externalId,
        },
        update: {
          name: place.name,
          district: place.district,
          address: place.address,
          newAddress: place.newAddress,
          phone: place.phone,
          website: place.website,
          openingHours: place.openingHours,
          openDays: place.openDays,
          closedDays: place.closedDays,
          transportInfo: place.transportInfo,
          tags: place.tags,
          accessibility: place.accessibility,
        },
        create: {
          externalId: place.externalId,
          name: place.name,
          district: place.district,
          address: place.address,
          newAddress: place.newAddress,
          phone: place.phone,
          website: place.website,
          openingHours: place.openingHours,
          openDays: place.openDays,
          closedDays: place.closedDays,
          transportInfo: place.transportInfo,
          tags: place.tags,
          accessibility: place.accessibility,
        },
      });

      totalUpserted += 1;
    }

    if (rows.length < PAGE_SIZE) {
      break;
    }

    start += PAGE_SIZE;
  }

  return NextResponse.json({
    service: SEOUL_TOUR_PLACE_SERVICE,
    upserted: totalUpserted,
  });
}
