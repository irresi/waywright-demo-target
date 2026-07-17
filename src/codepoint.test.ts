import { test, expect } from "bun:test";
import { codepointLength } from "./codepoint";

test("empty string", () => expect(codepointLength("")).toBe(0));
test("ascii", () => expect(codepointLength("hello")).toBe(5));
test("accented BMP", () => expect(codepointLength("héllo")).toBe(5));
test("single astral emoji", () => expect(codepointLength("👍")).toBe(1));
test("mixed ascii+astral", () => expect(codepointLength("a👍b")).toBe(3));
test("ZWJ sequence sanity", () => {
  const s = "👨‍👩‍👧";
  expect(codepointLength(s)).toBeLessThan(s.length);
});
