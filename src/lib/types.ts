export interface PopularGame {
  igdbId: number;
  title: string;
  coverImageId: string | null;
  genres: string | null;
}

export interface UserGameRow {
  id: string;
  category: string;
  gameId: string;
  igdbId: number;
  title: string;
  slug: string;
  coverImageId: string | null;
  genre: string | null;
  updatedAt: Date;
}
