import type { DistrictCode } from "../api/types";

export interface DistrictMeta {
  code: DistrictCode;
  label: string;
}

export const SEOUL_DISTRICTS: DistrictMeta[] = [
  { code: "종로구", label: "종로구" },
  { code: "중구", label: "중구" },
  { code: "용산구", label: "용산구" },
  { code: "성동구", label: "성동구" },
  { code: "광진구", label: "광진구" },
  { code: "동대문구", label: "동대문구" },
  { code: "중랑구", label: "중랑구" },
  { code: "성북구", label: "성북구" },
  { code: "강북구", label: "강북구" },
  { code: "도봉구", label: "도봉구" },
  { code: "노원구", label: "노원구" },
  { code: "은평구", label: "은평구" },
  { code: "서대문구", label: "서대문구" },
  { code: "마포구", label: "마포구" },
  { code: "양천구", label: "양천구" },
  { code: "강서구", label: "강서구" },
  { code: "구로구", label: "구로구" },
  { code: "금천구", label: "금천구" },
  { code: "영등포구", label: "영등포구" },
  { code: "동작구", label: "동작구" },
  { code: "관악구", label: "관악구" },
  { code: "서초구", label: "서초구" },
  { code: "강남구", label: "강남구" },
  { code: "송파구", label: "송파구" },
  { code: "강동구", label: "강동구" },
];
