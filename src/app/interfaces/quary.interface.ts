export interface PrismaFindManyArgc {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[] | string;
  [key: string]: unknown;
}

export interface PrismaCountArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[] | string;
  [key: string]: unknown;

}

export interface PrismaModelDelegate {
  findMany(args: any): Promise<any[]>;
  count(args: any): Promise<number>;

}

export interface IQuaryParams {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortORder?: `asc` | `desc`;
  fields?: string;
  includes?: string;
  [key: string]: string | undefined;
}

export interface IQuaryConfig {
  searchableFields?: string[];
  filterableFields?: string[];
}