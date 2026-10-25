export type HeaderChrome = {
  title: string;
  back: boolean;
  backLabel: string;
  search: { value: string; placeholder: string } | null;
  onSearch: (value: string) => void;
  trailingSymbol: string | null;
};

export type FabChrome = {
  label: string;
  onPress: () => void;
};

const listeners = new Set<() => void>();
let headers: HeaderChrome[] = [];
let fabs: FabChrome[] = [];

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeChrome(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function currentHeader() {
  return headers[headers.length - 1] ?? null;
}

export function currentFab() {
  return fabs[fabs.length - 1] ?? null;
}

export function bindHeader(spec: HeaderChrome) {
  headers = [...headers, spec];
  emit();
  return () => {
    headers = headers.filter((item) => item !== spec);
    emit();
  };
}

export function bindFab(spec: FabChrome) {
  fabs = [...fabs, spec];
  emit();
  return () => {
    fabs = fabs.filter((item) => item !== spec);
    emit();
  };
}

/** Ask the native shell to read the latest header, including badge text. */
export function touchChrome() {
  emit();
}
