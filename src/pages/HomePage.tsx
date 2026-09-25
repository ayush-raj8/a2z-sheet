import { Link } from 'react-router-dom';

const sheets = [
  {
    to: '/dsa',
    title: 'A2Z DSA Roadmap',
    blurb: '455 DSA topics with blogs, progress, and company chips mapped via LeetCode links.',
    tag: 'Practice',
  },
  {
    to: '/dsa/companies',
    title: 'Company-wise DSA',
    blurb: '470 companies from LC frequency lists — filter by window, jump into A2Z blogs when mapped.',
    tag: 'Interview',
  },
  {
    to: '/lld',
    title: 'Java → OOP → LLD',
    blurb: 'Interview-ready path from Java fundamentals through SOLID, patterns, and LLD.',
    tag: 'Learn',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">a2z sheets</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Pick a track
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          DSA practice and OOPs/LLD learning share this site, but load as separate bundles so
          neither slows the other down.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sheets.map((sheet) => (
            <Link
              key={sheet.to}
              to={sheet.to}
              className="group rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-600"
            >
              <span className="text-xs uppercase tracking-wider text-zinc-500">{sheet.tag}</span>
              <h2 className="mt-2 text-xl font-medium group-hover:text-white">{sheet.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{sheet.blurb}</p>
              <span className="mt-4 inline-block text-sm text-zinc-300">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
