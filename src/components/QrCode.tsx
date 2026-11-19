import QRCode from "qrcode";

/**
 * A QR code as inline SVG. Server-only: the code is computed at build time,
 * so the browser gets plain markup and no QR library.
 */
export default function QrCode({
  value,
  label,
  labelledBy,
  className,
}: {
  value: string;
  /** The accessible name; or give `labelledBy`, the id of an element holding it. */
  label?: string;
  labelledBy?: string;
  className?: string;
}) {
  const { size, data } = QRCode.create(value, { errorCorrectionLevel: "M" }).modules;
  const MARGIN = 2;

  // One path: each run of dark modules in a row becomes a single rectangle.
  let d = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!data[y * size + x]) continue;
      let w = 1;
      while (x + w < size && data[y * size + x + w]) w++;
      d += `M${x + MARGIN} ${y + MARGIN}h${w}v1h-${w}z`;
      x += w - 1;
    }
  }

  const full = size + MARGIN * 2;
  return (
    <svg viewBox={`0 0 ${full} ${full}`} className={className} shapeRendering="crispEdges" role="img" aria-label={label} aria-labelledby={labelledBy}>
      <rect width={full} height={full} fill="#fff" />
      <path d={d} fill="#000" />
    </svg>
  );
}
