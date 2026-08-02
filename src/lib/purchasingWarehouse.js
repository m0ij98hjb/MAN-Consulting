/* ══════════════════════════════════════════════════════════════
   Warehouse stock helpers — a running quantityOnHand per normalized
   item name, built up automatically whenever a delivery is received
   (ReceivingPanel), and drawn down when procurement issues stock
   directly to a request instead of purchasing it (RFQ page).
   ══════════════════════════════════════════════════════════════ */
export function stockKeyFor(itemName) {
  return (itemName || '').trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}

/** Cross-reference requested items against current stock levels. */
export function checkAvailability(items, stockMap) {
  return (items || []).map(it => {
    const key = stockKeyFor(it.itemName);
    const onHand = Number(stockMap?.[key]?.quantityOnHand) || 0;
    const requestedQty = Number(it.quantity) || 0;
    return { itemId: it.id, itemName: it.itemName, unit: it.unit, requestedQty, onHand, suggestedIssueQty: Math.min(requestedQty, onHand) };
  });
}

export function anyStockAvailable(availability) {
  return (availability || []).some(a => a.onHand > 0);
}
