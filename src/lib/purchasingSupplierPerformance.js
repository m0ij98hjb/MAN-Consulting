/* ══════════════════════════════════════════════════════════════
   Supplier Performance System — computed on demand (client-side,
   one-time reads) from real purchaseOrders/warehouseReceipts/quotations
   data. purchasingSuppliers itself only stores a manual self-rating,
   so this derives an objective score instead of relying on it.
   ══════════════════════════════════════════════════════════════ */
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function parseWarrantyMonths(text) {
  const m = String(text || '').match(/(\d+)\s*(month|شهر|شهور)/i);
  if (m) return Number(m[1]);
  const y = String(text || '').match(/(\d+)\s*(year|سنة|سنوات)/i);
  if (y) return Number(y[1]) * 12;
  return String(text || '').trim() ? 6 : 0; // some warranty text but no parseable duration
}

export const BADGES = {
  PREFERRED: 'preferred',
  APPROVED: 'approved',
  WATCHLIST: 'watchlist',
  BLACKLISTED: 'blacklisted',
  UNRATED: 'unrated',
};

export function badgeForScore(score, orderCount) {
  if (orderCount === 0) return BADGES.UNRATED;
  if (score >= 85) return BADGES.PREFERRED;
  if (score >= 65) return BADGES.APPROVED;
  if (score >= 40) return BADGES.WATCHLIST;
  return BADGES.BLACKLISTED;
}

export async function computeAllSupplierPerformance() {
  const [ordersSnap, receiptsSnap] = await Promise.all([
    getDocs(collection(db, 'purchaseOrders')),
    getDocs(collection(db, 'warehouseReceipts')),
  ]);
  const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const receipts = receiptsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const receiptByRequestId = Object.fromEntries(receipts.map(r => [r.requestId, r]));

  const uniqueRequestIds = [...new Set(orders.map(o => o.requestId).filter(Boolean))];
  const quotationsByRequestId = {};
  await Promise.all(uniqueRequestIds.map(async (requestId) => {
    const snap = await getDocs(collection(db, 'purchaseRFQs', requestId, 'quotations'));
    quotationsByRequestId[requestId] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }));

  const bySupplier = {};
  for (const order of orders) {
    if (!order.supplierId) continue;
    if (!bySupplier[order.supplierId]) {
      bySupplier[order.supplierId] = { orders: [], deliveryDelays: [], lateCount: 0, shortageTotal: 0, orderedTotal: 0, priceRatios: [], warrantyMonths: [] };
    }
    const entry = bySupplier[order.supplierId];
    entry.orders.push(order);

    const receipt = receiptByRequestId[order.requestId];
    if (receipt?.receivedAt?.seconds && order.issuedAt?.seconds) {
      const actualDays = (receipt.receivedAt.seconds - order.issuedAt.seconds) / 86400;
      entry.deliveryDelays.push(actualDays);
    }
    if (receipt?.items) {
      for (const it of receipt.items) {
        entry.orderedTotal += Number(it.orderedQty) || 0;
        entry.shortageTotal += Number(it.shortageQty) || 0;
      }
    }

    const quotations = quotationsByRequestId[order.requestId] || [];
    const mine = quotations.find(q => q.supplierId === order.supplierId || q.id === order.supplierId);
    if (mine && quotations.length > 1) {
      const avgPrice = quotations.reduce((s, q) => s + (Number(q.price) || 0), 0) / quotations.length;
      if (avgPrice > 0) entry.priceRatios.push((avgPrice - (Number(mine.price) || 0)) / avgPrice);
      if (mine.warranty) entry.warrantyMonths.push(parseWarrantyMonths(mine.warranty));
    } else if (mine?.warranty) {
      entry.warrantyMonths.push(parseWarrantyMonths(mine.warranty));
    }
  }

  const result = {};
  for (const [supplierId, e] of Object.entries(bySupplier)) {
    const orderCount = e.orders.length;
    const avgDelay = e.deliveryDelays.length ? e.deliveryDelays.reduce((a, b) => a + b, 0) / e.deliveryDelays.length : null;
    const deliverySpeedScore = avgDelay === null ? 60 : Math.max(0, Math.min(100, 100 - Math.max(0, avgDelay - 7) * 8));
    const returnRatePct = e.orderedTotal > 0 ? (e.shortageTotal / e.orderedTotal) * 100 : 0;
    const qualityScore = Math.max(0, 100 - returnRatePct * 2);
    const avgPriceRatio = e.priceRatios.length ? e.priceRatios.reduce((a, b) => a + b, 0) / e.priceRatios.length : 0;
    const priceCompetitiveness = Math.max(0, Math.min(100, 50 + avgPriceRatio * 200));
    const avgWarrantyMonths = e.warrantyMonths.length ? e.warrantyMonths.reduce((a, b) => a + b, 0) / e.warrantyMonths.length : 0;
    const warrantyScore = Math.max(0, Math.min(100, (avgWarrantyMonths / 24) * 100));
    const lateCount = e.deliveryDelays.filter(d => d > 10).length;

    const overallScore = Math.round(
      deliverySpeedScore * 0.25 + qualityScore * 0.3 + priceCompetitiveness * 0.25 + warrantyScore * 0.1
      + Math.min(10, orderCount * 2) - lateCount * 5
    );
    const clampedScore = Math.max(0, Math.min(100, overallScore));

    result[supplierId] = {
      previousOrders: orderCount,
      deliverySpeedScore: Math.round(deliverySpeedScore),
      qualityScore: Math.round(qualityScore),
      priceCompetitiveness: Math.round(priceCompetitiveness),
      warrantyScore: Math.round(warrantyScore),
      returnRatePct: Math.round(returnRatePct * 10) / 10,
      lateDeliveries: lateCount,
      overallScore: clampedScore,
      badge: badgeForScore(clampedScore, orderCount),
    };
  }
  return result;
}
