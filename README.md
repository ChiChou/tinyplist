# tinyplist

A lightweight XML property list (plist) parser and serializer that runs entirely in the browser.
No dependencies, no build step — just native Web APIs.

It does not work in Node.js and other server-side JavaScript runtimes, or edge computing environments.

**[Live Demo](https://codecolor.ist/tinyplist/)**

## Features

- **Parse** Apple XML plist into JavaScript objects
- **Serialize** JavaScript objects back to XML plist
- Zero dependencies — built on [`DOMParser`](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) and [`XMLSerializer`](https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer)
- Supports all plist types: `dict`, `array`, `string`, `integer`, `real`, `boolean`, `date`, and `data`
- Handles large integers with `BigInt` and binary data with `Uint8Array`

## Usage

### In the browser

Import the ES modules directly:

```js
import { parse } from "./tinyplist/parser.mjs";
import { serialize } from "./tinyplist/serializer.mjs";

// Parse plist XML to a JavaScript object
const obj = parse(plistXmlString);

// Serialize a JavaScript object back to plist XML
const xml = serialize(obj);
```

### Supported types

| Plist type  | JavaScript type     |
| ----------- | ------------------- |
| `<dict>`    | `Object`            |
| `<array>`   | `Array`             |
| `<string>`  | `string`            |
| `<integer>` | `number` / `BigInt` |
| `<real>`    | `number`            |
| `<true/>`   | `true`              |
| `<false/>`  | `false`             |
| `<date>`    | `Date`              |
| `<data>`    | `Uint8Array`        |

## License

MIT
