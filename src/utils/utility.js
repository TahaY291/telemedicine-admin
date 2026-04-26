
export const getInitials = (name = "", fallback = "?") =>
    (name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("") || fallback;


export const getDisplayName = (user, fallback = "User") =>
    user?.username || fallback;
export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// ── 2. Today's label (e.g. "Monday, Apr 19") ─────────────────────────────────
// Used in: DoctorDashboard (as a module-level const)
// Used in: PatientDashboard (inside useMemo as `today`)
export const todayLabel = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "short",
  day: "numeric",
});