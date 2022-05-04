export type movieResponseType = {
  id: string,
  title:string,
  poster_path: string,
  release_date: string,
  vote_average: string
}

export interface MoviesListProps {
  sortBy: "asc" | "desc";
  maxLimit?: number;
}

export interface GridSpecsProps {
  rowCount: number;
  rowHeight: number;
  columnCount: number;
  columnWidth: number;
}
