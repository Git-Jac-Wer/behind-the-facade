# Behind the Facade

A QR-code trail through four physics buildings in Im Neuenheimer Feld (IMSEAM, EINC, PI, KIP).
Visitors scan a code next to an exhibit, read about it on their phone, and collect a stamp in a digital passport.

The full guide, with a live stamp gallery and every field explained, is built into the site:
open `index.html` and go to **How this site works** (address ending in `#guide`).

## Try it

Double-click `index.html`. It opens in your browser and works like the real site
(stamps are saved in that browser).

## What to edit

| File | What it is |
|---|---|
| `stations.js` | **All content.** Settings, buildings, stations, stamps, map positions. |
| `images/` | Photos (about 1400 px on the long side, under ~300 KB each). |
| `widgets.js` | Interactive add-ons, e.g. the pendulum time bar. |
| `style.css` | Colours and fonts (colours at the top). |
| `app.js`, `index.html`, `vendor/` | Logic, page skeleton, QR library. No need to touch. |

## Add a station

1. Put its photos into `images/`.
2. In `stations.js`, copy a whole station block (`{` … `},`) and change the fields.
3. Give it a new `id` (lowercase, digits, hyphens). The id is part of the QR link, so never change it after printing.
4. Reload. The station appears in the passport, on the map and on the QR page.

## Stamps

Set in each station's `stamp`: `shape` (`circle`, `hexagon`, `square`, `ticket`), `ink` (colour),
`icon` (`pendulum`, `field`, `detector`, `prism`, `neuron`, `printer`, `star`) and `label`.
Or use your own picture with `image: "images/stamps/name.png"`.

## Put it online (GitHub Pages)

1. New public repository on github.com → **Add file → Upload files** → drag in the whole folder content.
2. **Settings → Pages** → Branch `main`, folder `/ (root)` → Save.
3. The site is live at `https://USERNAME.github.io/REPOSITORY/` after about a minute.
4. Put that address into `url` at the top of `stations.js`.

## QR codes

Open the site online and go to **QR codes** (`#qr`). It makes one printable A6 sign per station
(code = website address + `#` + station id). Test every code with a phone, then download and print.
Texts, photos and stamps can change later without reprinting; only a new address or id needs new codes.

## Good to know

- Stamps are stored in the visitor's browser only: no accounts, no data collected, but also lost when browser data is cleared.
- Anyone who types a station address gets its stamp. A quiz about something only visible on site makes that harder.

QR code library: Kazuhiko Arase, MIT license (`vendor/qrcode.js`).
