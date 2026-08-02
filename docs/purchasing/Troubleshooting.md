# Troubleshooting

## "Permission denied" when clicking Approve/Reject/etc.

Almost always means the signed-in account's `purchasingUsers` document either doesn't exist, has the wrong `role`, or has `active: false`. Check `/admin/purchasing/users` (super_admin only) or the document directly in the Firestore Console. Also double-check the request's current `status` actually matches the stage that role is allowed to act on — see the transition table in [SecurityRules.md](./SecurityRules.md); the rules reject any out-of-sequence transition even if the UI somehow shows a button for it.

## A newly created employee account can't log in

`createPurchasingUser()` requires a password of at least 6 characters (Firebase Auth's own minimum) — the create-user form validates this client-side too. If creation reports success but the user still can't reach `/purchase-request`, verify their `purchasingUsers/{uid}.active` is `true` and `role` is spelled exactly as in `ROLES` (`purchasingConfig.js`) — a typo'd role string won't match any `isRole()`/`purchInRoles()` check.

## Super admin's own session gets logged out while creating a new user

This should never happen — `createPurchasingUser` explicitly uses a secondary, throwaway Firebase App instance for the `createUserWithEmailAndPassword` call specifically to avoid this. If it does happen, check that `getApp()` (used to read the config for the secondary app) is being called *before* any auth state change, and that no other code path is calling `createUserWithEmailAndPassword` directly against the default app.

## File upload fails with "unsupported file type"

The allow-list is intentionally strict (`ACCEPTED_ATTACHMENT_EXT` in `purchasingConfig.js`: PDF/Word/Excel/DWG/DXF/ZIP/common images). This validation is enforced in `AttachmentsUploader.js`'s `handleFiles` — it was previously *not* enforced (only the browser's file-picker `accept` filter, which is trivially bypassable) until this audit added the real check.

## Storage upload fails with "permission denied" even though Firestore access works fine

Check that `storage.rules` was actually deployed, and — critically — that it was deployed **after** merging in whatever rules were already live (see [Deployment.md](./Deployment.md)). If it was deployed as a raw replace, other unrelated site features (director photo, camera QR codes) may now also be broken; re-merge and redeploy.

## A report number (avg. approval/purchase days) shows `0.0` even though requests exist

That average only includes requests that have **both** timestamps populated (`submittedAt`+`approvalDecisionAt` for approval time; `approvalDecisionAt`+`completedAt` for purchase time). A request still in progress, or one that was rejected before reaching a decision, is correctly excluded — this isn't a bug.

## `npm run lint` fails after pulling this branch

If the failure lists files under `.claude/worktrees/...`, that's another Claude Code session's internal git worktree being picked up by ESLint because it wasn't previously excluded — confirm `eslint.config.mjs` includes `.claude/**` in its `globalIgnores` (added during this audit). If it lists real `src/` files, run `npm run lint` locally and compare against this document's Bugs Fixed list in the final report — a regression may have been introduced since.

## The "Site Manager" role/stage I asked for doesn't seem to exist

Correct — see [Roles.md](./Roles.md)'s "Deviation" section. It was deliberately not implemented in this audit pass since adding it is a new feature (an extra mandatory approval stage), not a bug fix.

## Where do I check what changed, exactly?

The final audit report (delivered alongside this documentation set) lists every file created/modified/removed, every bug fixed with its root cause, and a production-readiness score.
