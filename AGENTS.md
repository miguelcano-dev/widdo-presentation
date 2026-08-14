# AGENTS.md - Widdo Project

**Ver `CLAUDE.md`.** Toda la documentacion del proyecto (hechos canonicos, estructura,
actualizacion de metricas, generacion de PDFs, dashboard) vive alli. Este archivo existia como
copia casi identica y se fusiono el 13-ago-2026 para que no divergieran.

## Lo minimo que hay que saber antes de tocar nada

- **Cifras:** `metrics.json` es la fuente unica de verdad. A 13-ago-2026: 9 clubes, 3 pagando,
  MRR $101. Nunca escribas "21 clubs" ni "0% churn".
- **Pagos:** Stripe es la unica pasarela (USA, Canada, Mexico).
- **Entidades:** Widdo Inc (Delaware), 70/30 Miguel/Alwin. Widdo SAS Colombia INACTIVA.
- **Widdo Academy:** vertical **en standby** — no cuenta para modulos, metricas ni produccion.
- **Movil:** Flutter, repo `widdo-mobile-flutter`.
- **Documentos retirados:** `_archivo-negocio/README.md` explica que se archivo y por que.
