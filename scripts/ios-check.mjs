#!/usr/bin/env node
/**
 * Checks the iOS shell without a Mac. The unsigned compile itself runs on the
 * macOS GitHub Actions runner (see .github/workflows/ios.yml).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");

const errors = [];
const notes = [];

const config = read("capacitor.config.ts");
if (!config.includes("https://verse2note.com")) {
  errors.push("capacitor.config.ts deve carregar https://verse2note.com por omissão.");
}
if (config.includes("NSAllowsArbitraryLoads") || config.includes("capacitorHttp")) {
  errors.push("Não ligar HTTP livre nem o proxy CapacitorHttp.");
}

const plist = read("ios/App/App/Info.plist");
if (!plist.includes("<string>verse2note</string>")) {
  errors.push("Falta o esquema verse2note no Info.plist.");
}
if (plist.includes("<key>NSAllowsArbitraryLoads</key>") || plist.includes("<key>NSExceptionAllowsInsecureHTTPLoads</key>")) {
  errors.push("Info.plist não deve abrir exceção de ATS. O site já é HTTPS.");
}
if (!plist.includes("remote-notification")) {
  errors.push("Falta UIBackgroundModes remote-notification.");
}

const releaseEntitlements = read("ios/App/App/AppRelease.entitlements");
if (!releaseEntitlements.includes("<string>production</string>")) {
  errors.push("O arquivo de Release tem de pedir APNs de produção (TestFlight).");
}

const project = read("ios/App/App.xcodeproj/project.pbxproj");
if (project.includes("CODE_SIGN_ENTITLEMENTS = App/AppDebug")) {
  errors.push("A configuração Debug não deve exigir entitlements, para o build sem assinatura passar.");
}
if (!project.includes("CODE_SIGN_ENTITLEMENTS = App/AppRelease.entitlements")) {
  errors.push("Falta o entitlement de push na configuração Release.");
}

for (const path of [
  "ios/App/App/NativeShell.swift",
  "ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme",
  "ios/App/CapApp-SPM/Package.swift",
  "native/www/offline.html",
  ".github/workflows/ios.yml",
]) {
  try {
    read(path);
  } catch {
    errors.push(`Ficheiro em falta: ${path}`);
  }
}

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();
if (serverUrl?.startsWith("http://")) {
  notes.push(
    `CAPACITOR_SERVER_URL=${serverUrl} é HTTP. A Apple bloqueia HTTP (ATS) e o cookie __Host- da sessão exige HTTPS. Use https://verse2note.com.`,
  );
}

if (notes.length) console.log(notes.join("\n"));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("ios-check: projeto iOS coerente (compilação no runner macOS).");
