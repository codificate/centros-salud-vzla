export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mb-4 h-11 w-full animate-pulse rounded-lg bg-slate-100" />
      <ul className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="h-24 animate-pulse rounded-lg border border-slate-200 bg-white"
          />
        ))}
      </ul>
    </main>
  );
}
