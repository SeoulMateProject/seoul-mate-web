export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface Diary {
  id: string;
  userId: string;
  placeId: string;
  title: string;
  content: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiaryWithLikeScrap extends Diary {
  liked: boolean;
  scrapped: boolean;
}
