/**
 * Serializes a JavaScript value into an Apple plist XML string.
 * @param {Object|Array|string|number|bigint|boolean|Date|Uint8Array|null} value - The value to serialize.
 * @returns {string} The plist XML string.
 */
export function serialize(value) {
  const doctype = document.implementation.createDocumentType(
    "plist",
    "-//Apple//DTD PLIST 1.0//EN",
    "http://www.apple.com/DTDs/PropertyList-1.0.dtd",
  );
  const doc = document.implementation.createDocument(null, "plist", doctype);
  const plist = doc.documentElement;
  plist.setAttribute("version", "1.0");

  const node = val(doc, value);
  if (node) plist.appendChild(node);

  const xml = new XMLSerializer().serializeToString(doc);
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + xml;
}

/**
 * Converts a JavaScript value into a plist XML DOM element.
 * @param {Document} doc - The XML document used to create elements.
 * @param {*} value - The value to convert.
 * @returns {Element|null} The corresponding plist XML element.
 */
function val(doc, value) {
  if (value === null || value === undefined) return null;

  if (typeof value === "boolean") return doc.createElement(String(value));
  if (typeof value === "string") return el(doc, "string", value);
  if (typeof value === "bigint") return el(doc, "integer", String(value));

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? el(doc, "integer", String(value))
      : el(doc, "real", String(value));
  }

  if (value instanceof Date) return el(doc, "date", value.toISOString());
  if (value instanceof Uint8Array) return el(doc, "data", b64(value));
  if (Array.isArray(value)) return arr(doc, value);

  return dict(doc, value);
}

/**
 * Creates an XML element with text content.
 * @param {Document} doc - The XML document.
 * @param {string} tag - The element tag name.
 * @param {string} text - The text content.
 * @returns {Element} The created element.
 */
function el(doc, tag, text) {
  const node = doc.createElement(tag);
  node.textContent = text;
  return node;
}

/**
 * Serializes a plain object into a plist `<dict>` element.
 * @param {Document} doc - The XML document.
 * @param {Object} obj - The object to serialize.
 * @returns {Element} The `<dict>` element.
 */
function dict(doc, obj) {
  const node = doc.createElement("dict");
  for (const [k, v] of Object.entries(obj)) {
    node.appendChild(el(doc, "key", k));
    const child = val(doc, v);
    if (child) node.appendChild(child);
  }
  return node;
}

/**
 * Serializes an array into a plist `<array>` element.
 * @param {Document} doc - The XML document.
 * @param {Array} items - The array to serialize.
 * @returns {Element} The `<array>` element.
 */
function arr(doc, items) {
  const node = doc.createElement("array");
  for (const item of items) {
    const child = val(doc, item);
    if (child) node.appendChild(child);
  }
  return node;
}

/**
 * Encodes a Uint8Array into a Base64 string.
 * Uses `Uint8Array.prototype.toBase64` when available, otherwise falls back to `btoa`.
 * @param {Uint8Array} bytes - The binary data to encode.
 * @returns {string} The Base64-encoded string.
 */
function b64(bytes) {
  if (typeof bytes.toBase64 === "function") {
    return bytes.toBase64();
  }

  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}
