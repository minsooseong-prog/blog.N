export type Post = {
  id: number;
  author: string;
  title: string | null;
  content: string;
  created_at: string;
};

export type PostListResult = {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
};
