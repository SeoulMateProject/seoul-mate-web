export type DistrictCode =
  | "종로구"
  | "중구"
  | "용산구"
  | "성동구"
  | "광진구"
  | "동대문구"
  | "중랑구"
  | "성북구"
  | "강북구"
  | "도봉구"
  | "노원구"
  | "은평구"
  | "서대문구"
  | "마포구"
  | "양천구"
  | "강서구"
  | "구로구"
  | "금천구"
  | "영등포구"
  | "동작구"
  | "관악구"
  | "서초구"
  | "강남구"
  | "송파구"
  | "강동구";

export interface Place {
  id: string;
  externalId: string | null;
  name: string;
  district: DistrictCode | null;
  address: string | null;
  newAddress: string | null;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  openDays: string | null;
  closedDays: string | null;
  transportInfo: string | null;
  tags: string[];
  accessibility: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset?: number;
}
