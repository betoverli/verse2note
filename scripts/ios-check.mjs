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
if (!plist.includes("Verse2NoteUniversalLinks")) {
  errors.push("Falta a flag Verse2NoteUniversalLinks no Info.plist.");
}

const releaseEntitlements = read("ios/App/App/AppRelease.entitlements");
if (!releaseEntitlements.includes("<string>production</string>")) {
  errors.push("O arquivo de Release tem de pedir APNs de produção (TestFlight).");
}
if (!releaseEntitlements.includes("applinks:verse2note.com")) {
  errors.push("O Release tem de declarar o domínio verse2note.com para o regresso do login.");
}
if (!releaseEntitlements.includes("webcredentials:verse2note.com")) {
  errors.push("O Release tem de declarar webcredentials:verse2note.com, senão o iPhone não abre a folha de login.");
}

const project = read("ios/App/App.xcodeproj/project.pbxproj");
if (project.includes("CODE_SIGN_ENTITLEMENTS = App/AppDebug")) {
  errors.push("A configuração Debug não deve exigir entitlements, para o build sem assinatura passar.");
}
if (!project.includes("CODE_SIGN_ENTITLEMENTS = App/AppRelease.entitlements")) {
  errors.push("Falta o entitlement de push na configuração Release.");
}
const debugTarget = project.split("504EC3171FED79650016851F /* Debug */")[1]?.split("name = Debug;")[0] ?? "";
const releaseTarget = project.split("504EC3181FED79650016851F /* Release */")[1]?.split("name = Release;")[0] ?? "";
if (debugTarget.includes("CODE_SIGN_ENTITLEMENTS") || !debugTarget.includes("VERSE2NOTE_UNIVERSAL_LINKS = NO")) {
  errors.push("A configuração Debug não deve pedir Universal Links nem entitlements.");
}
if (!releaseTarget.includes("VERSE2NOTE_UNIVERSAL_LINKS = YES") || !releaseTarget.includes("App/AppRelease.entitlements")) {
  errors.push("A configuração Release tem de ativar Universal Links e os entitlements.");
}

const shell = read("ios/App/App/NativeShell.swift");
if (!shell.includes('path: "/auth/native-return"') || !shell.includes("Callback.https")) {
  errors.push("O login nativo tem de poder regressar por Universal Link.");
}
if (!shell.includes("Verse2NoteBridgeViewController")) {
  errors.push("O controlador da ponte tem de registrar o plugin de login.");
}
const scene = read("ios/App/App/SceneDelegate.swift");
if (!scene.includes("rootViewController = Verse2NoteBridgeViewController()")) {
  errors.push("O SceneDelegate tem de mostrar o controlador que registra o login.");
}
const handoff = read("src/lib/native/handoff.server.ts");
if (handoff.includes("session_token") || !handoff.includes("token_ciphertext")) {
  errors.push("O handoff não pode gravar o token de sessão em claro.");
}
const aasa = read("src/routes/[.]well-known/apple-app-site-association.ts");
if (!aasa.includes("appleAppSiteAssociation")) {
  errors.push("Falta servir apple-app-site-association.");
}
const aasaSource = read("src/lib/native/aasa.server.ts");
if (!aasaSource.includes("webcredentials")) {
  errors.push("O AASA tem de publicar webcredentials para o ASWebAuthenticationSession HTTPS.");
}
const nativeAuth = read("src/lib/native/auth.ts");
if (!nativeAuth.includes("preferredNativeReturnMode")) {
  errors.push("O login nativo tem de pedir o esquema já registado no binário.");
}
const nativeConfig = read("src/routes/auth/native-config.ts");
if (!nativeConfig.includes("universalLinks: false")) {
  errors.push("native-config tem de dizer universalLinks false para o script já publicado pedir verse2note://.");
}
const done = read("src/routes/auth/native-done.ts");
if (done.includes("useEffect") || done.includes("window.location") || done.includes("Response.redirect(")) {
  errors.push("O regresso /auth/native-done tem de ser um 302 do servidor. Response.redirect recusa verse2note://.");
}
if (!done.includes("nativeDoneLocation") || !done.includes("status: 302")) {
  errors.push("O regresso /auth/native-done tem de redirecionar para o código de uso único.");
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
