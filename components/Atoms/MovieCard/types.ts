export interface MovieProps {
  id: string;
  rank: number;
  image: string;
  title: string;
  rating: string;
  releasedYear: string;
  isHighlighted?: boolean;
  isHighlightedRowMovie?: boolean;
}

export interface MovieCardProps extends MovieProps {
  loading?: boolean;
  handleHighlight: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => void;
}
