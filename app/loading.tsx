export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-maroon-100" aria-busy="true">
      <div className="h-full w-1/3 animate-pulse bg-maroon-700" />
    </div>
  );
}
