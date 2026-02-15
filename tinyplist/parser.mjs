/**
 * Parses an Apple plist XML string into a JavaScript value.
 * @param {string} xml - The plist XML string to parse.
 * @returns {Object|Array|string|number|bigint|boolean|Date|Uint8Array|null} The parsed plist value.
 * @throws {Error} If the XML is malformed or missing a `<plist>` root element.
 */
export function parse(xml) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");

  const err = doc.querySelector("parsererror");
  if (err) {
    throw new Error("Error parsing XML: " + err.textContent);
  }

  const plist = doc.querySelector("plist");
  if (!plist) {
    throw new Error("Invalid plist: Missing <plist> root element.");
  }

  let root = null;
  for (const el of plist.children) {
    if (el.nodeType === Node.ELEMENT_NODE) {
      root = el;
      break;
    }
  }

  if (!root) return null;
  return val(root);
}

/**
 * Dispatches a plist XML element to the appropriate type parser.
 * @param {Element} node - A DOM element representing a plist value.
 * @returns {Object|Array|string|number|bigint|boolean|Date|Uint8Array} The parsed JavaScript value.
 */
function val(node) {
  const handlers = {
    dict: () => dict(node),
    array: () => Array.from(node.children, (el) => val(el)),
    string: () => node.textContent,
    integer: () => int(node.textContent),
    real: () => parseFloat(node.textContent),
    true: () => true,
    false: () => false,
    date: () => new Date(node.textContent),
    data: () => data(node.textContent),
  };

  const fn = handlers[node.tagName];
  if (typeof fn === "function") {
    return fn();
  }

  console.warn(`Unknown plist tag: <${node.tagName}>`);
  return node.textContent;
}

/**
 * Parses a `<dict>` element into a plain object.
 * @param {Element} node - A DOM element representing a plist `<dict>`.
 * @returns {Object<string, *>} An object with string keys and parsed plist values.
 */
function dict(node) {
  const children = Array.from(node.children);
  return Object.fromEntries(
    Array.from({ length: children.length / 2 }, (_, i) => {
      const k = children[i * 2];
      const v = children[i * 2 + 1];

      if (!k || k.tagName !== "key") {
        console.warn("Missing key in dictionary or malformed structure");
        return null;
      }

      return [k.textContent, v ? val(v) : null];
    }).filter(Boolean),
  );
}

/**
 * Parses an `<integer>` text value into a number or BigInt.
 * Returns a BigInt if the value exceeds the safe integer range.
 * @param {string} text - The text content of an `<integer>` element.
 * @returns {number|bigint} The parsed integer.
 */
function int(text) {
  const n = Number(text);
  if (Number.isSafeInteger(n)) {
    return n;
  }
  return BigInt(text);
}

/**
 * Decodes a `<data>` element's Base64 content into a Uint8Array.
 * Uses `Uint8Array.fromBase64` when available, otherwise falls back to `atob`.
 * @param {string} b64 - The Base64-encoded text content of a `<data>` element.
 * @returns {Uint8Array} The decoded binary data.
 */
function data(b64) {
  const clean = b64.replace(/\s/g, "");

  if (typeof Uint8Array.fromBase64 === "function") {
    return Uint8Array.fromBase64(clean);
  }

  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);

  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}
