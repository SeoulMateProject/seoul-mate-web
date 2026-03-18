"use client";

import Image from "next/image";
import type { DistrictCode } from "../api/types";
import { SEOUL_DISTRICTS } from "../constants/districts";

interface SeoulDistrictMapProps {
  selected?: DistrictCode;
  onSelect?(district: DistrictCode | null): void;
}

interface PositionedDistrict {
  code: DistrictCode;
  label: string;
  colStart: number;
  colSpan?: number;
  rowStart: number;
  rowSpan?: number;
}

// 대략적인 배치만 맞춘 지도형 레이아웃 (Figma 지도 느낌)
const positionedDistricts: PositionedDistrict[] = [
  { code: "도봉구", label: "도봉구", rowStart: 1, colStart: 4 },
  { code: "노원구", label: "노원구", rowStart: 1, colStart: 5 },
  { code: "강북구", label: "강북구", rowStart: 2, colStart: 4 },
  { code: "성북구", label: "성북구", rowStart: 2, colStart: 3 },
  { code: "중랑구", label: "중랑구", rowStart: 2, colStart: 5 },
  { code: "은평구", label: "은평구", rowStart: 2, colStart: 1 },
  { code: "서대문구", label: "서대문구", rowStart: 2, colStart: 2 },
  { code: "종로구", label: "종로구", rowStart: 3, colStart: 2 },
  { code: "중구", label: "중구", rowStart: 3, colStart: 3 },
  { code: "동대문구", label: "동대문구", rowStart: 3, colStart: 4 },
  { code: "성동구", label: "성동구", rowStart: 3, colStart: 5 },
  { code: "마포구", label: "마포구", rowStart: 4, colStart: 1 },
  { code: "용산구", label: "용산구", rowStart: 4, colStart: 2 },
  { code: "광진구", label: "광진구", rowStart: 4, colStart: 5 },
  { code: "양천구", label: "양천구", rowStart: 5, colStart: 1 },
  { code: "영등포구", label: "영등포구", rowStart: 5, colStart: 2 },
  { code: "동작구", label: "동작구", rowStart: 5, colStart: 3 },
  { code: "강남구", label: "강남구", rowStart: 5, colStart: 4 },
  { code: "송파구", label: "송파구", rowStart: 5, colStart: 5 },
  { code: "구로구", label: "구로구", rowStart: 6, colStart: 1 },
  { code: "금천구", label: "금천구", rowStart: 6, colStart: 2 },
  { code: "관악구", label: "관악구", rowStart: 6, colStart: 3 },
  { code: "서초구", label: "서초구", rowStart: 6, colStart: 4 },
  { code: "강서구", label: "강서구", rowStart: 4, colStart: 1 },
  { code: "강동구", label: "강동구", rowStart: 6, colStart: 5 },
];

const ALL_DISTRICT_CODES = new Set(SEOUL_DISTRICTS.map((d) => d.code));

export function SeoulDistrictMap({ selected, onSelect }: SeoulDistrictMapProps) {
  const handleClick = (code: DistrictCode) => {
    if (!onSelect) return;
    if (selected === code) {
      onSelect(null);
      return;
    }
    onSelect(code);
  };

  return (
    <div className="w-full">
      <div className="relative mx-auto aspect-square max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/icons/seoul-district-map.png"
            alt="서울시 구 지도"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-contain"
          />
        </div>

        <div className="relative grid h-full w-full grid-cols-5 grid-rows-6 gap-1 p-3">
          {positionedDistricts
            .filter((d) => ALL_DISTRICT_CODES.has(d.code))
            .map((d) => {
              const isActive = selected === d.code;
              return (
                <button
                  key={d.code}
                  type="button"
                  className={`flex items-center justify-center rounded-md border text-[11px] leading-none transition-colors ${
                    isActive
                      ? "border-[#0D00A4] bg-[#0D00A4] text-white shadow-sm"
                      : "border-zinc-200 bg-white/90 text-zinc-700 hover:border-[#0D00A4]/50"
                  }`}
                  style={{
                    gridColumnStart: d.colStart,
                    gridRowStart: d.rowStart,
                    gridColumnEnd: d.colSpan ? `span ${d.colSpan}` : undefined,
                    gridRowEnd: d.rowSpan ? `span ${d.rowSpan}` : undefined,
                  }}
                  onClick={() => handleClick(d.code)}
                >
                  {d.label}
                </button>
              );
            })}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500">
        지도를 눌러 구를 선택하면 해당 지역의 장소를 보여줄게요.
      </p>
    </div>
  );
}
