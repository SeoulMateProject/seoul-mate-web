import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { XMLParser } from "fast-xml-parser";

const SEOUL_OPEN_API_BASE_URL =
  process.env.SEOUL_OPEN_API_BASE_URL ?? "http://openapi.seoul.go.kr:8088";
const SEOUL_OPEN_API_KEY = process.env.SEOUL_OPEN_API_KEY;
const SEOUL_TOUR_PLACE_SERVICE = process.env.SEOUL_TOUR_PLACE_SERVICE ?? "TbVwAttractions";

const ADMIN_SYNC_SECRET = process.env.ADMIN_SYNC_SECRET;

type SeoulTourRow = {
  [key: string]: unknown;
};

async function fetchSeoulTourPage(
  start: number,
  end: number,
  debug = false,
): Promise<SeoulTourRow[]> {
  if (!SEOUL_OPEN_API_KEY) {
    throw new Error("SEOUL_OPEN_API_KEY is not set");
  }

  const url = `${SEOUL_OPEN_API_BASE_URL}/${SEOUL_OPEN_API_KEY}/xml/${SEOUL_TOUR_PLACE_SERVICE}/${start}/${end}/`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Seoul OpenAPI request failed with status ${res.status}`);
  }

  const xmlText = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    // OpenAPI는 태그명 그대로 쓰는 경우가 많아서 attributeNamePrefix 기본 유지
  });

  const parsed = parser.parse(xmlText) as Record<string, unknown>;

  const serviceRoot = parsed?.[SEOUL_TOUR_PLACE_SERVICE] as Record<string, unknown> | undefined;
  const rowsNode = serviceRoot?.row as unknown;

  const rows = (() => {
    if (!rowsNode) return [];
    if (Array.isArray(rowsNode)) return rowsNode as SeoulTourRow[];
    return [rowsNode as SeoulTourRow];
  })();

  if (debug) {
    console.log("[sync-places][debug] url:", url);
    console.log("[sync-places][debug] root keys:", Object.keys(parsed ?? {}));
    console.log("[sync-places][debug] serviceRoot exists:", !!serviceRoot);
    if (serviceRoot)
      console.log("[sync-places][debug] serviceRoot keys:", Object.keys(serviceRoot));
    console.log("[sync-places][debug] rowCount:", rows.length);
  }

  return rows;
}

function mapRowToPlaceData(row: SeoulTourRow) {
  // openapi/seoul.go.kr TbVwAttractions(xlm) 응답은 필드명이 영문/코드 형태일 수 있음.
  // 기존 OA-21050(한글 키)도 같이 지원하도록 “가능한 키를 여러 개” 매핑합니다.
  const externalId = String(row["고유번호"] ?? row["POST_SN"] ?? "");
  const name =
    (row["상호명"] as string | undefined) ??
    (row["POST_SJ"] as string | undefined) ??
    (row["POST_NM"] as string | undefined) ??
    "";

  if (!externalId || !name) {
    return null;
  }

  const district =
    (row["구명"] as string | undefined) ??
    (row["GU_NM"] as string | undefined) ??
    (row["SIGUNGU_NM"] as string | undefined) ??
    (() => {
      // xml 응답에서 구명이 별도 키로 오지 않을 때를 대비한 간단 휴리스틱
      // 예: "GU_NM", "SIGUNGU_NM" 대신 다른 코드명으로 내려오는 경우
      for (const [key, value] of Object.entries(row)) {
        if (typeof value !== "string") continue;
        const upperKey = key.toUpperCase();
        if (!upperKey.includes("GU")) continue;
        if (!value.includes("구")) continue;
        return value;
      }
      return undefined;
    })();
  const address =
    (row["주소"] as string | undefined) ?? (row["ADDRESS"] as string | undefined) ?? undefined;
  const newAddress =
    (row["신주소"] as string | undefined) ??
    (row["NEW_ADDRESS"] as string | undefined) ??
    undefined;
  const phone =
    (row["전화번호"] as string | undefined) ??
    (row["CMMN_TELNO"] as string | undefined) ??
    undefined;
  const website =
    (row["웹사이트"] as string | undefined) ??
    (row["CMMN_HMPG_URL"] as string | undefined) ??
    undefined;
  const openingHours =
    (row["이용시간"] as string | undefined) ??
    (row["CMMN_USE_TIME"] as string | undefined) ??
    undefined;
  const openDays =
    (row["운영요일"] as string | undefined) ??
    (row["OPEN_DAYS"] as string | undefined) ??
    undefined;
  const closedDays =
    (row["휴무일"] as string | undefined) ??
    (row["CLOSED_DAYS"] as string | undefined) ??
    undefined;
  const transportInfo =
    (row["교통정보"] as string | undefined) ??
    (row["SUBWAY_INFO"] as string | undefined) ??
    undefined;
  const tagsRaw = (row["태그"] as string | undefined) ?? (row["TAG"] as string | undefined) ?? "";
  const accessibility =
    (row["장애인편의시설"] as string | undefined) ??
    (row["BF_DESC"] as string | undefined) ??
    undefined;

  const tags = String(tagsRaw)
    .replace(/\|/g, ",")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

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
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get("debug") === "1";
  const onlyFirstPage = searchParams.get("onlyFirstPage") === "1";

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

    const rows = await fetchSeoulTourPage(start, end, debug && start === 1);

    if (debug && start === 1) {
      const sample = rows[0] ?? null;
      const mappedPreview = sample
        ? [mapRowToPlaceData(sample)].filter(
            (row): row is NonNullable<ReturnType<typeof mapRowToPlaceData>> => row !== null,
          )
        : [];

      const districtCandidates =
        sample && typeof sample === "object"
          ? Object.entries(sample as Record<string, unknown>)
              .filter(([, value]) => typeof value === "string" && value.includes("구"))
              .map(([key, value]) => ({ key, value }))
          : [];

      return NextResponse.json({
        page: { start, end },
        rowCount: rows.length,
        sampleRowKeys: sample ? Object.keys(sample).slice(0, 50) : [],
        mappedCount: mappedPreview.length,
        sampleMapped: mappedPreview[0] ?? null,
        districtCandidates: districtCandidates.slice(0, 10),
      });
    }

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

    if (onlyFirstPage) {
      break;
    }

    start += PAGE_SIZE;
  }

  return NextResponse.json({
    service: SEOUL_TOUR_PLACE_SERVICE,
    upserted: totalUpserted,
  });
}
