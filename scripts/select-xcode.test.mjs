import assert from "node:assert/strict";
import { test } from "node:test";
import {
  availableIosRuntimeLabels,
  chooseXcode,
  parseSdkVersionOutput,
  parseXcodeVersionOutput,
  sdkMajorMinor,
  versionKey,
} from "./select-xcode.mjs";

/** macos-26-arm64 20261013.0424, the image that failed run 40150737024. */
const FAILED_RUN_IMAGE = [
  { path: "/Applications/Xcode_26.0.1.app", xcodeVersion: "26.0.1", sdkVersion: "26.0" },
  { path: "/Applications/Xcode_26.1.1.app", xcodeVersion: "26.1.1", sdkVersion: "26.1" },
  { path: "/Applications/Xcode_26.2.app", xcodeVersion: "26.2", sdkVersion: "26.2" },
  { path: "/Applications/Xcode_26.3.app", xcodeVersion: "26.3", sdkVersion: "26.2" },
  { path: "/Applications/Xcode_26.4.1.app", xcodeVersion: "26.4.1", sdkVersion: "26.4" },
  { path: "/Applications/Xcode_26.5.app", xcodeVersion: "26.5", sdkVersion: "26.5" },
  { path: "/Applications/Xcode_26.6.app", xcodeVersion: "26.6", sdkVersion: "26.5" },
];

const INSTALLED_RUNTIMES = ["26.2", "26.4", "26.5"];

test("the failed runner image selects Xcode 26.6, not 26.1.1", () => {
  const chosen = chooseXcode(FAILED_RUN_IMAGE, INSTALLED_RUNTIMES);
  assert.equal(chosen?.path, "/Applications/Xcode_26.6.app");
  assert.equal(chosen?.xcodeVersion, "26.6");
  assert.equal(sdkMajorMinor(chosen?.sdkVersion)?.label, "26.5");
});

test("an Xcode whose platform is missing is never selected", () => {
  const onlyBroken = FAILED_RUN_IMAGE.filter((candidate) =>
    ["26.0.1", "26.1.1"].includes(candidate.xcodeVersion),
  );
  assert.equal(chooseXcode(onlyBroken, INSTALLED_RUNTIMES), null);
});

test("without an iOS 26 runtime the current Xcode stays selected", () => {
  const withOlder = [
    ...FAILED_RUN_IMAGE,
    { path: "/Applications/Xcode_16.4.app", xcodeVersion: "16.4", sdkVersion: "18.5" },
  ];
  assert.equal(chooseXcode(withOlder, ["18.5"]), null);
});

test("a newer Xcode without a runtime loses to an older one that has it", () => {
  const chosen = chooseXcode(
    [
      { path: "/Applications/Xcode_26.7.app", xcodeVersion: "26.7", sdkVersion: "26.7" },
      { path: "/Applications/Xcode_26.5.app", xcodeVersion: "26.5", sdkVersion: "26.5" },
    ],
    ["26.5"],
  );
  assert.equal(chosen?.xcodeVersion, "26.5");
});

test("version order is numeric", () => {
  assert.ok(versionKey("26.10") > versionKey("26.6"));
  assert.ok(versionKey("26.6") > versionKey("26.4.1"));
  assert.equal(versionKey("26.6"), versionKey("26.6.0"));
  assert.equal(versionKey("beta"), null);
});

test("simctl JSON ignores unavailable and non-iOS runtimes", () => {
  const labels = availableIosRuntimeLabels([
    { name: "iOS 26.1", platform: "iOS", version: "26.1", isAvailable: false },
    {
      name: "iOS 26.5",
      platform: "iOS",
      version: "26.5",
      identifier: "com.apple.CoreSimulator.SimRuntime.iOS-26-5",
      isAvailable: true,
    },
    { name: "iOS 26.4", platform: "iOS", version: "26.4.1", isAvailable: true },
    { name: "watchOS 26.5", platform: "watchOS", version: "26.5", isAvailable: true },
    {
      name: "iOS 18.6",
      platform: "iOS",
      version: "18.6",
      availability: "(unavailable, not supported)",
    },
  ]);
  assert.deepEqual([...labels].sort(), ["26.4", "26.5"]);
});

test("xcodebuild version lines parse with trailing warnings", () => {
  assert.equal(parseXcodeVersionOutput("Xcode 26.1.1\nBuild version 17B100\n"), "26.1.1");
  assert.equal(parseSdkVersionOutput("warning: something\n26.5\n"), "26.5");
});
