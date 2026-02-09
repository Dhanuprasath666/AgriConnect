function stableHash(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isAfterOrEqual(dateA, dateB) {
  return new Date(dateA).getTime() >= new Date(dateB).getTime();
}

export function simulateEarningsFromListings({ items, now = new Date() }) {
  const dayStart = startOfDay(now);
  const monthStart = startOfMonth(now);

  let total = 0;
  let today = 0;
  let month = 0;

  for (const item of items || []) {
    const price = Number(item.pricePerKg ?? item.price ?? 0);
    const qty = Number(item.quantityKg ?? item.quantity ?? 0);
    if (!Number.isFinite(price) || !Number.isFinite(qty) || qty <= 0) continue;

    const createdAt = item.createdAt?.toDate?.() || item.createdAt || null;
    const createdAtDate = createdAt ? new Date(createdAt) : null;

    const seedKey = `${item.id || ""}|${now.toISOString().slice(0, 10)}`;
    const seed = stableHash(seedKey) % 1000;

    const soldRatio = 0.08 + (seed / 1000) * 0.22; // 8% - 30%
    const soldQty = Math.max(0, qty * soldRatio);

    const discountPercent = Number(item.discountPercent ?? 0);
    const discountFactor =
      item.isUrgentDeal && Number.isFinite(discountPercent)
        ? Math.max(0.5, 1 - discountPercent / 100)
        : 1;

    const amount = soldQty * price * discountFactor;
    total += amount;

    if (createdAtDate && isAfterOrEqual(createdAtDate, monthStart)) {
      month += amount;
    }
    if (createdAtDate && isAfterOrEqual(createdAtDate, dayStart)) {
      today += amount;
    }
  }

  return {
    totalEarnings: Math.round(total),
    todayEarnings: Math.round(today),
    monthlyEarnings: Math.round(month),
    updatedAt: now,
    source: "simulated_from_listings",
  };
}

