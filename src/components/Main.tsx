/** Page body column. */
export default function Main({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-3xl px-4 pt-4 pb-12">{children}</main>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="my-2 text-2xl font-bold">{children}</h1>;
}
