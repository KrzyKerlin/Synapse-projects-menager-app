function fmtDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return (
    d.toLocaleDateString("pl-PL", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
  );
}

module.exports = { fmtDate, fmtDateTime };
