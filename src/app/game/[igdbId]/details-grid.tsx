import type { IGDBGameDetail } from "@/src/lib/igdb";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y) return iso;
  if (m && d) return `${MONTHS[m - 1]} ${d}, ${y}`;
  return String(y);
}

function scoreClass(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-amber-400";
  if (score >= 50) return "text-orange-400";
  return "text-red-400";
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="text-xs text-white/70 bg-white/6 px-2.5 py-1 rounded-lg border border-white/8"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-white/6 last:border-b-0 last:pb-0">
      <div className="text-[11px] font-medium uppercase tracking-wider text-white/35 mb-1.5">
        {label}
      </div>
      <div className="text-sm text-white/80">{children}</div>
    </div>
  );
}

function ScoreStat({ label, value }: { label: string; value: number }) {
  const v = Math.round(value);
  return (
    <div className="flex-1 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-center">
      <div className={`text-2xl font-bold leading-none ${scoreClass(v)}`}>
        {v}
      </div>
      <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
        {label}
      </div>
    </div>
  );
}

export function DetailsGrid({ detail }: { detail: IGDBGameDetail }) {
  const developers = detail.companies
    .filter((c) => c.roles.includes("developer"))
    .map((c) => c.name);
  const publishers = detail.companies
    .filter((c) => c.roles.includes("publisher"))
    .map((c) => c.name);

  const critics = detail.aggregatedRating;
  const players = detail.userRating ?? detail.totalRating;
  const hasScores = critics != null || players != null;

  const rows: { label: string; node: React.ReactNode }[] = [];

  if (developers.length)
    rows.push({ label: "Developer", node: <Chips items={developers} /> });
  if (publishers.length)
    rows.push({ label: "Publisher", node: <Chips items={publishers} /> });
  if (detail.releaseDate)
    rows.push({
      label: "Released",
      node: <span className="text-white/80">{formatDate(detail.releaseDate)}</span>,
    });
  if (detail.platforms.length)
    rows.push({
      label: "Platforms",
      node: <Chips items={detail.platforms.map((p) => p.name)} />,
    });
  if (detail.gameModes.length)
    rows.push({ label: "Game modes", node: <Chips items={detail.gameModes} /> });
  if (detail.playerPerspectives.length)
    rows.push({
      label: "Perspective",
      node: <Chips items={detail.playerPerspectives} />,
    });
  if (detail.themes.length)
    rows.push({ label: "Themes", node: <Chips items={detail.themes} /> });
  if (detail.gameEngines.length)
    rows.push({ label: "Engine", node: <Chips items={detail.gameEngines} /> });
  if (detail.ageRatings.length)
    rows.push({
      label: "Age ratings",
      node: (
        <Chips items={detail.ageRatings.map((a) => `${a.system} ${a.label}`)} />
      ),
    });
  if (detail.alternativeNames.length)
    rows.push({
      label: "Also known as",
      node: (
        <span className="text-white/60">
          {detail.alternativeNames.slice(0, 6).join(", ")}
        </span>
      ),
    });

  if (!hasScores && rows.length === 0) return null;

  return (
    <div className="bg-white/3 rounded-2xl border border-white/8 p-5 sm:p-6">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
        Game details
      </h2>

      {hasScores && (
        <div className="flex gap-2 mb-4">
          {critics != null && <ScoreStat label="Critics" value={critics} />}
          {players != null && <ScoreStat label="Players" value={players} />}
        </div>
      )}

      {rows.map((r) => (
        <Row key={r.label} label={r.label}>
          {r.node}
        </Row>
      ))}
    </div>
  );
}
