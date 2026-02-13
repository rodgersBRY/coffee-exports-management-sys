type Props = {
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (nextPage: number) => void;
};

export function PaginationBar({
  page,
  pageSize,
  total,
  hasNext,
  hasPrev,
  onPageChange
}: Props): React.JSX.Element {
  return (
    <div className="inline">
      <span className="tag">Total: {total}</span>
      <span className="tag">Page size: {pageSize}</span>
      <button className="ghost" disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span className="tag">Page {page}</span>
      <button className="ghost" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
