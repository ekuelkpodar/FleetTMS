export function toPaginationParams(query: any) {
  const page = Math.max(parseInt(query.page as string, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(query.pageSize as string, 10) || 20, 1), 100);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
