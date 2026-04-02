## 0.0.55 - 2026-04-02

- revert "fix: remove postcss from rrweb-record bundle" (#165)

## 0.0.54 - 2026-04-02

- fix: handle SecurityError in IframeManager destroy and removeIframeById (#163)
- fix: remove postcss from rrweb-record bundle (#164)
- Sign commits during release (#149)
- fix: clear mutation buffer on iframe pagehide to prevent recording corruption (#157)
- fix: skip unchanged setAttribute calls to prevent replay flicker (#158)
- fix: prevent iframe leak in untainted prototype and avoid unnecessary iframe creation (#159)

## 0.0.53 - 2026-04-01

- fix(rrweb): break infinite recursion between ShadowDomManager and MutationBuffer reset (#162)
- chore: enforce 7-day minimum release age for supply chain security (#161)

## 0.0.52 - 2026-04-01

- fix(rrweb): recover from errors in canvas FPS snapshot pipeline (#160)

## 0.0.51 - 2026-03-26

- fix: catch all SecurityError variants in stop handler cleanup (#156)

## 0.0.50 - 2026-03-24

- fix: prevent object reference mutation breaking remote CSS replay (#154)
- fix: allow clearing adopted stylesheets with empty strings (#153)
- fix: improve nested CSS rule handling (#152)
- refactor: extract slimDOMDefaults into shared function (#151)
- fix: guard WebGLRenderingContext access for iOS compatibility (#150)
- fix: mask textarea innerText mutations (#148)

## 0.0.49 - 2026-03-23

- fix: handle cross-origin iframe errors during stop handler cleanup (#145)
- ci: pin pnpm/action-setup to full commit SHA (#146)

## 0.0.48 - 2026-03-23

- add release instruction on readme (#144)
- fix: apply tailwind hover css (#143)

## 0.0.47 - 2026-03-17

- fix iframe observer leak (#142)

## 0.0.46 - 2026-03-04

- fix(rrweb): use FNV-1a hash for canvas frame dedup instead of full base64 (#140)

## 0.0.45 - 2026-03-02

- fix: reuse OffscreenCanvas in worker to prevent memory leak (#139)

## 0.0.44 - 2026-03-01

- fix(rrweb): add displayWidth/displayHeight to canvas mutation data (#137)
- fix(rrweb): stop canvas FPS observer when OffscreenCanvas is unavailable (#138)

## 0.0.43 - 2026-02-28

- fix(rrweb): close ImageBitmap in worker when OffscreenCanvas is unavailable (#136)

## 0.0.42 - 2026-02-13

- feat: re-export maxDepth helpers through dependency chain (#132)

## 0.0.41 - 2026-02-13

- fix(rrweb-snapshot): add max depth limit to DOM serialization (#130)

## 0.0.40 - 2026-02-02

- fix: avoid Symbol.toStringTag access in stringify isObject check (#127)

## 0.0.39 - 2026-02-02

- fix: replayer should stop services on destroy (#125)

## 0.0.38 - 2026-01-29

- fix: must clean elements from maps on remove from DOM (#124)

## 0.0.37 - 2026-01-27

- fix(replay): cleanup iframe WeakMaps in removeIframeById to prevent memory leak (#123)

## 0.0.36 - 2026-01-21

- fix(replay): clear weakmaps in destroy method (#122)

## 0.0.35 - 2026-01-13

- Bump version to 0.0.35

## 0.0.32 - 2025-11-24

- chore: to get a new version (#103)

## 0.0.31 - 2025-11-24

- fix: don't ship postcss with the recorder (#101)

## 0.0.30 - 2025-11-08

- feat: resize or replace base64 images based on config (#99)

## 0.0.29 - 2025-11-08

- fix: reset mirror when stopping (#100)
- revert: "fix: do not bundle css parsing into recorder" (#98)

## 0.0.28 - 2025-11-07

- fix: do not bundle css parsing into recorder (#96)
- fix: pass data quality options to toDataURL (#95)

## 0.0.27 - 2025-10-20

- fix: remove load listener from iframemanager to avoid leaking memory (#94)
- chore: switch to fine-grained PAT (#93)

## 0.0.26 - 2025-10-10

- fix: address memory leaks in replayer (#92)
- fix: possible memory leaks in recorder (#91)

## 0.0.25 - 2025-08-05

- fix(rrweb-snapshot): inserting doctype element (#88)
- fix: use node.baseURI for stringifying stylesheet hrefs (#87)

## 0.0.24 - 2025-07-18

- fix: in applyStyleDeclaration during replay we `as unknown as` and explode (#86)

## 0.0.23 - 2025-07-03

- fix: missing nodes and parents perf (#85)

## 0.0.22 - 2025-07-01

- fix: consistent logging in player (#84)

## 0.0.21 - 2025-06-11

- adopt a couple of rrweb proposed PRs (#82)
- fix: css bug identified in user site (#83)

## 0.0.20 - 2025-06-11

- chore: to trigger release (#81)
- chore: release rrweb-player (#80)
- fix: getting packages in step (#79)

## 0.0.19 - 2025-06-11

- fix: get packages on same versions (#78)

## 0.0.18 - 2025-06-11

- fix: correct version bumping (#77)

## 0.0.17 - 2025-06-09

- Bump version to 0.0.17

## 0.0.16 - 2025-06-09

- Bump version to 0.0.16

## 0.0.15 - 2025-06-09

- Bump version to 0.0.15

## 0.0.14 - 2025-06-09

- Bump version to 0.0.14

## 0.0.13 - 2025-03-17

## 0.0.12 - 2025-03-17

## 0.0.11 - 2025-03-14

## 0.0.10 - 2025-02-28

## 0.0.9 - 2025-02-27

## 0.0.8 - 2025-02-04

## 0.0.7 - 2025-02-03

## 0.0.6 - 2025-02-01

## 0.0.5 - 2025-01-31

## -version - 2025-01-31

## - 2025-01-31

## - 2025-01-31

## - 2025-01-31

# Changelog
