# admin-polish-and-extras — Tracker

This branch is the integration point for a 5-PR feature chain that ships 7 admin/client enhancements (6 ADDED + 1 MODIFIED) totalling ~2,850 estimated lines.

**DO NOT MERGE** this PR until all 5 child PRs are merged in:

- [x] PR#1 — feat/category-management ([#16](https://github.com/Broken100/chayka-version-2.0/pull/16)) — DB-backed categories, CategoryManager UI, D3 + D5
- [ ] PR#2 — feat/image-uploads (parallel to PR#1) — multer + E.164
- [ ] PR#3 — feat/qr-and-transfer-settings (after PR#2) — payment QR upload
- [ ] PR#4 — feat/notifications-and-service-tracking (after PR#1) — 2 events + service status
- [ ] PR#5 — feat/whatsapp-auto-send-and-wa-fallback (after PR#3, PR#4) — wa.me link helper

After all 5 land, re-verify `npm test -- --run` + `npm run build` against this branch, then merge into `main`.

See the OpenSpec change for the full design: `openspec/changes/admin-polish-and-extras/`.
