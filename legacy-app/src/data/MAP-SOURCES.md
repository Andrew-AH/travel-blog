# Map geography

`world-countries-110m.json` is the unmodified `countries-110m.json` from
[world-atlas 2.0.2](https://github.com/topojson/world-atlas), downloaded from
https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json.

The topology redistributes Natural Earth v4.1.0 country boundaries at 1:110m.
[Natural Earth's geographic data is public domain](https://www.naturalearthdata.com/about/terms-of-use/).
The world-atlas redistribution is under the ISC license, reproduced below.

The component projects country geometry and each destination's longitude and
latitude with D3's Natural Earth projection. Antarctica is omitted from the
travel view. Geographic grid lines and labels are decorative; pins are HTML
buttons. All map data is bundled locally. No account, API key, remote tiles,
or runtime third-party requests are needed.

## world-atlas ISC license

Copyright 2013-2019 Michael Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
