/*
 * The body of a Japanese share page (src/app/ja/): link previews read its
 * Japanese metadata, and people are forwarded at once to the page itself,
 * shown in Japanese. Without JavaScript, a link takes them there.
 */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function JaSharePage({ path }: { path: string }) {
  const target = `${basePath}${path}?lang=ja`;
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <script
        dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(target)} + location.hash);` }}
      />
      <a href={target}>{target}</a>
    </main>
  );
}
