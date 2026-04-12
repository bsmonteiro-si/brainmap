import { describe, it, expect } from "vitest";
import { ImageWidget, imageCache, cacheKey, parseImageSyntax } from "./cmImageDecorations";

describe("parseImageSyntax", () => {
  it("parses standard image syntax", () => {
    const result = parseImageSyntax("![alt text](path/to/image.png)");
    expect(result).toEqual({ alt: "alt text", url: "path/to/image.png" });
  });

  it("parses empty alt text", () => {
    const result = parseImageSyntax("![](image.png)");
    expect(result).toEqual({ alt: "", url: "image.png" });
  });

  it("parses alt text with spaces", () => {
    const result = parseImageSyntax("![Figure 1: A diagram](../assets/diagram.jpg)");
    expect(result).toEqual({ alt: "Figure 1: A diagram", url: "../assets/diagram.jpg" });
  });

  it("parses relative paths with parent directory", () => {
    const result = parseImageSyntax("![test](../images/photo.webp)");
    expect(result).toEqual({ alt: "test", url: "../images/photo.webp" });
  });

  it("parses current directory paths", () => {
    const result = parseImageSyntax("![logo](./logo.svg)");
    expect(result).toEqual({ alt: "logo", url: "./logo.svg" });
  });

  it("returns null for non-image text", () => {
    expect(parseImageSyntax("just some text")).toBeNull();
  });

  it("returns null for regular links", () => {
    expect(parseImageSyntax("[text](url)")).toBeNull();
  });
});

describe("cacheKey", () => {
  it("produces unique keys for different note paths", () => {
    const key1 = cacheKey("Notes/A.md", "image.png");
    const key2 = cacheKey("Notes/B.md", "image.png");
    expect(key1).not.toBe(key2);
  });

  it("produces unique keys for different image URLs", () => {
    const key1 = cacheKey("Notes/A.md", "image1.png");
    const key2 = cacheKey("Notes/A.md", "image2.png");
    expect(key1).not.toBe(key2);
  });

  it("produces stable keys for same inputs", () => {
    const key1 = cacheKey("Notes/A.md", "image.png");
    const key2 = cacheKey("Notes/A.md", "image.png");
    expect(key1).toBe(key2);
  });
});

describe("ImageWidget", () => {
  it("eq returns true for same URL and cache", () => {
    const a = new ImageWidget("image.png", "alt", { assetUrl: "asset://img" });
    const b = new ImageWidget("image.png", "alt", { assetUrl: "asset://img" });
    expect(a.eq(b)).toBe(true);
  });

  it("eq returns false for different URL", () => {
    const a = new ImageWidget("image1.png", "alt", { assetUrl: "asset://img" });
    const b = new ImageWidget("image2.png", "alt", { assetUrl: "asset://img" });
    expect(a.eq(b)).toBe(false);
  });

  it("eq returns false when cache state differs (loading vs resolved)", () => {
    const a = new ImageWidget("image.png", "alt", undefined);
    const b = new ImageWidget("image.png", "alt", { assetUrl: "asset://img" });
    expect(a.eq(b)).toBe(false);
  });

  it("eq returns false when cache state differs (url vs error)", () => {
    const a = new ImageWidget("image.png", "alt", { assetUrl: "asset://img" });
    const b = new ImageWidget("image.png", "alt", { error: "Not found" });
    expect(a.eq(b)).toBe(false);
  });

  it("eq returns true when both have same error", () => {
    const a = new ImageWidget("bad.png", "alt", { error: "Not found" });
    const b = new ImageWidget("bad.png", "alt", { error: "Not found" });
    expect(a.eq(b)).toBe(true);
  });

  it("eq returns false when alt text differs", () => {
    const a = new ImageWidget("image.png", "alt1", { assetUrl: "asset://img" });
    const b = new ImageWidget("image.png", "alt2", { assetUrl: "asset://img" });
    expect(a.eq(b)).toBe(false);
  });

  it("has estimatedHeight of 200", () => {
    const w = new ImageWidget("image.png", "alt", undefined);
    expect(w.estimatedHeight).toBe(200);
  });

  it("renders loading state when no cache", () => {
    const w = new ImageWidget("image.png", "alt", undefined);
    const dom = w.toDOM();
    expect(dom.querySelector(".cm-image-loading")).not.toBeNull();
    expect(dom.querySelector(".cm-image-loading")!.textContent).toContain("Loading");
  });

  it("renders error state", () => {
    const w = new ImageWidget("missing.png", "alt", { error: "File not found" });
    const dom = w.toDOM();
    const errorEl = dom.querySelector(".cm-image-error");
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toContain("File not found");
  });

  it("renders image when cached", () => {
    const w = new ImageWidget("photo.png", "Photo alt", { assetUrl: "asset://localhost/path" });
    const dom = w.toDOM();
    const img = dom.querySelector("img.cm-image-preview") as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain("asset://localhost/path");
    expect(img.alt).toBe("Photo alt");
    expect(img.draggable).toBe(false);
  });

  it("escapes HTML in error messages", () => {
    const w = new ImageWidget("bad.png", "alt", { error: '<script>alert("xss")</script>' });
    const dom = w.toDOM();
    const errorEl = dom.querySelector(".cm-image-error");
    expect(errorEl!.innerHTML).not.toContain("<script>");
    expect(errorEl!.innerHTML).toContain("&lt;script&gt;");
  });

  it("has correct className on wrapper", () => {
    const w = new ImageWidget("image.png", "alt", undefined);
    const dom = w.toDOM();
    expect(dom.className).toBe("cm-image-widget");
  });
});

describe("imageCache", () => {
  it("is a Map", () => {
    expect(imageCache).toBeInstanceOf(Map);
  });
});
