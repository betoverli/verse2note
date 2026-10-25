#!/usr/bin/env node
/**
 * Select an Xcode that can build for the iOS Simulator on this runner.
 *
 * `UIGlassEffect` is compiled only with an iOS 26 SDK. The macOS 26 GitHub
 * image keeps several Xcode 26 apps, but only a few simulator runtimes.
 * Xcode 26.1.1 is on disk while the iOS 26.1 platform is not, so
 * `-destination 'generic/platform=iOS Simulator'` exits 70 with
 * "iOS 26.1 is not installed" before any compile. The same gap breaks
 * `-destination 'generic/platform=iOS'` for the TestFlight archive.
 *
 * Prefer the newest Xcode 26+ whose bundled simulator SDK has an available
 * runtime. That SDK still defines `__IPHONE_26_0`, so Liquid Glass stays in
 * the binary. If none qualify, leave the current selection alone: an older
 * SDK still builds the classic UITabBar / UIBlurEffect chrome.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const APPLICATIONS = "/Applications";

export function sdkMajorMinor(sdkVersion) {
  const match = String(sdkVersion ?? "").trim().match(/^(\d+)\.(\d+)/);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), label: `${match[1]}.${match[2]}` };
}

/** Numeric order for Xcode versions. 26.10 sorts after 26.6. */
export function versionKey(version) {
  const parts = String(version ?? "")
    .trim()
    .split(".")
    .map((part) => Number.parseInt(part, 10));
  if (parts.length === 0 || parts.some((part) => !Number.isInteger(part))) return null;
  const [major, minor = 0, patch = 0] = parts;
  return major * 1_000_000 + minor * 1_000 + patch;
}

export function parseXcodeVersionOutput(text) {
  const match = String(text).match(/Xcode\s+(\d+(?:\.\d+){0,2})/);
  return match?.[1] ?? null;
}

export function parseSdkVersionOutput(text) {
  const lines = String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (/^\d+\.\d+/.test(lines[index])) return lines[index];
  }
  return null;
}

function runtimeIsAvailable(runtime) {
  if (runtime.isAvailable === false || runtime.isAvailable === "NO") return false;
  const availability = `${runtime.availability ?? ""} ${runtime.availabilityError ?? ""}`;
  return !/unavailable/i.test(availability);
}

function isIosRuntime(runtime) {
  const platform = String(runtime.platform ?? "");
  if (platform === "iOS" || platform === "com.apple.platform.iphonesimulator") return true;
  if (/^iOS\s+\d/.test(String(runtime.name ?? ""))) return true;
  return String(runtime.identifier ?? "").includes("SimRuntime.iOS-");
}

/** Major.minor labels of available iOS simulator runtimes from `simctl -json`. */
export function availableIosRuntimeLabels(runtimes) {
  const labels = new Set();
  for (const runtime of runtimes ?? []) {
    if (!isIosRuntime(runtime) || !runtimeIsAvailable(runtime)) continue;
    const label = sdkMajorMinor(runtime.version)?.label ?? sdkMajorMinor(runtime.name)?.label;
    if (label) labels.add(label);
  }
  return labels;
}

/**
 * @param {Array<{ path: string, xcodeVersion: string, sdkVersion: string }>} candidates
 * @param {Set<string> | string[]} runtimes major.minor labels, e.g. "26.5"
 * @returns {typeof candidates[number] | null}
 */
export function chooseXcode(candidates, runtimes) {
  const installed = runtimes instanceof Set ? runtimes : new Set(runtimes);
  let best = null;
  let bestKey = -1;
  for (const candidate of candidates) {
    const sdk = sdkMajorMinor(candidate.sdkVersion);
    if (!sdk || sdk.major < 26) continue;
    if (!installed.has(sdk.label)) continue;
    const key = versionKey(candidate.xcodeVersion);
    if (key == null || key <= bestKey) continue;
    best = candidate;
    bestKey = key;
  }
  return best;
}

function isMainModule(moduleUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === fileURLToPath(moduleUrl);
  } catch {
    return false;
  }
}

function capture(command, args, env) {
  try {
    const stdout = execFileSync(command, args, {
      encoding: "utf8",
      env,
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return { ok: true, stdout };
  } catch (error) {
    const stdout = error?.stdout?.toString?.() ?? "";
    const stderr = error?.stderr?.toString?.() ?? "";
    return { ok: false, stdout, stderr, message: error?.message ?? String(error) };
  }
}

function discoverXcodeApps() {
  let names = [];
  try {
    names = readdirSync(APPLICATIONS);
  } catch {
    return [];
  }
  const seen = new Set();
  const apps = [];
  for (const name of names) {
    if (!/^Xcode.*\.app$/.test(name)) continue;
    const path = join(APPLICATIONS, name);
    let real;
    try {
      real = realpathSync(path);
    } catch {
      continue;
    }
    if (seen.has(real)) continue;
    seen.add(real);
    apps.push(real);
  }
  return apps;
}

function developerDir(appPath) {
  return join(appPath, "Contents", "Developer");
}

function probe(appPath) {
  const dev = developerDir(appPath);
  const env = { ...process.env, DEVELOPER_DIR: dev };
  const xcodebuild = join(dev, "usr", "bin", "xcodebuild");
  const version = capture(xcodebuild, ["-version"], env);
  const sdk = capture(xcodebuild, ["-version", "-sdk", "iphonesimulator", "SDKVersion"], env);
  return {
    path: appPath,
    xcodeVersion: version.ok ? parseXcodeVersionOutput(version.stdout) : null,
    sdkVersion: sdk.ok ? parseSdkVersionOutput(sdk.stdout) : null,
    versionError: version.ok ? "" : version.stderr || version.message,
    sdkError: sdk.ok ? "" : sdk.stderr || sdk.message,
  };
}

function listRuntimes() {
  const listed = capture("xcrun", ["simctl", "list", "--json", "runtimes"], process.env);
  if (!listed.ok) {
    console.log(
      `Não foi possível listar os runtimes do simulador (${listed.stderr || listed.message}). Mantém-se o Xcode por omissão.`,
    );
    return null;
  }
  try {
    const payload = JSON.parse(listed.stdout);
    return availableIosRuntimeLabels(payload.runtimes);
  } catch (error) {
    console.log(
      `A lista de runtimes não é JSON (${error instanceof Error ? error.message : error}). Mantém-se o Xcode por omissão.`,
    );
    return null;
  }
}

function currentDeveloperDir() {
  const selected = capture("xcode-select", ["-p"], process.env);
  if (!selected.ok) return "";
  try {
    return realpathSync(selected.stdout.trim());
  } catch {
    return selected.stdout.trim();
  }
}

function selectApp(appPath) {
  const target = developerDir(appPath);
  let resolved = target;
  try {
    resolved = realpathSync(target);
  } catch {
    resolved = target;
  }
  if (currentDeveloperDir() === resolved) {
    console.log(`Xcode já seleccionado: ${appPath}`);
    return;
  }
  const switched = capture("sudo", ["xcode-select", "-s", appPath], process.env);
  if (!switched.ok) {
    console.error(switched.stderr || switched.message);
    process.exit(1);
  }
}

function printActiveXcode() {
  const version = capture("xcodebuild", ["-version"], process.env);
  const sdk = capture("xcodebuild", ["-version", "-sdk", "iphonesimulator", "SDKVersion"], process.env);
  if (version.ok) process.stdout.write(version.stdout.endsWith("\n") ? version.stdout : `${version.stdout}\n`);
  if (sdk.ok) console.log(`SDK do simulador: ${parseSdkVersionOutput(sdk.stdout) ?? sdk.stdout.trim()}`);
}

function main() {
  const apps = discoverXcodeApps();
  if (apps.length === 0) {
    console.log("Sem Xcode em /Applications. O passo seguinte usa o xcodebuild do PATH.");
    return;
  }
  const runtimes = listRuntimes();
  if (!runtimes) return;
  console.log(
    `Runtimes iOS disponíveis: ${[...runtimes].sort().join(", ") || "(nenhum)"}`,
  );

  const candidates = [];
  for (const appPath of apps) {
    const candidate = probe(appPath);
    if (!candidate.xcodeVersion || !candidate.sdkVersion) {
      console.log(
        `Ignorado ${appPath}: ${candidate.versionError || candidate.sdkError || "sem SDK de simulador"}`.trim(),
      );
      continue;
    }
    candidates.push(candidate);
    const sdk = sdkMajorMinor(candidate.sdkVersion);
    const ready = sdk && runtimes.has(sdk.label);
    console.log(
      `Xcode ${candidate.xcodeVersion} (${appPath}): SDK do simulador ${candidate.sdkVersion} — ${ready ? "runtime instalado" : "runtime ausente"}`,
    );
  }

  const chosen = chooseXcode(candidates, runtimes);
  if (!chosen) {
    console.log(
      "Nenhum Xcode 26 com runtime de simulador. Mantém-se o Xcode por omissão; o chrome clássico compila na mesma.",
    );
    printActiveXcode();
    return;
  }
  console.log(
    `Seleccionado ${chosen.path} (Xcode ${chosen.xcodeVersion}, SDK iOS ${sdkMajorMinor(chosen.sdkVersion)?.label}). Liquid Glass entra no binário.`,
  );
  selectApp(chosen.path);
  printActiveXcode();
}

if (isMainModule(import.meta.url)) {
  main();
}
