import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/bible/books";
import { bookById } from "@/lib/bible/books";
import type { Passage } from "@/lib/bible/passage";
import { samePassage } from "@/lib/bible/passage";
import { DEFAULT_TRANSLATION, translationsFor } from "@/lib/bible/translations";
import type { CopyFormat } from "@/lib/copy-rich";
import { detectLocale } from "@/lib/i18n";
import { applyTheme, type Theme } from "@/lib/theme";

export type Step = "book" | "chapter" | "verse";

type AppState = {
  locale: Locale;
  appId: string;
  translationId: string;
  preferNative: boolean;
  copyFormat: CopyFormat;
  booksCompact: boolean;
  theme: Theme;
  onboarded: boolean;
  bookId: string | null;
  chapter: number | null;
  verseStart: number | null;
  verseEnd: number | null;
  step: Step;
  recent: Passage[];
  list: Passage[];
  setLocale: (locale: Locale) => void;
  setAppId: (id: string) => void;
  setTranslationId: (id: string) => void;
  setPreferNative: (value: boolean) => void;
  setCopyFormat: (format: CopyFormat) => void;
  setBooksCompact: (value: boolean) => void;
  setTheme: (theme: Theme) => void;
  completeOnboarding: () => void;
  setStep: (step: Step) => void;
  selectBook: (bookId: string) => void;
  selectChapter: (chapter: number) => void;
  selectVerse: (verse: number) => void;
  selectWholeChapter: () => void;
  applyPassage: (passage: Passage) => void;
  remember: (passage: Passage) => void;
  addToList: (passage: Passage) => boolean;
  removeFromList: (passage: Passage) => void;
  clearList: () => void;
  resetSelection: () => void;
  passage: () => Passage | null;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: detectLocale(),
      appId: "youversion",
      translationId: DEFAULT_TRANSLATION[detectLocale()],
      preferNative: false,
      copyFormat: "rich",
      booksCompact: true,
      theme: "system",
      onboarded: false,
      bookId: null,
      chapter: null,
      verseStart: null,
      verseEnd: null,
      step: "book",
      recent: [],
      list: [],
      setLocale: (locale) => {
        const available = translationsFor(locale);
        const current = get().translationId;
        const next =
          available.some((item) => item.id === current) ? current : DEFAULT_TRANSLATION[locale];
        set({ locale, translationId: next });
        if (typeof document !== "undefined") document.documentElement.lang = locale;
      },
      setAppId: (appId) => set({ appId }),
      setTranslationId: (translationId) => set({ translationId }),
      setPreferNative: (preferNative) => set({ preferNative }),
      setCopyFormat: (copyFormat) => set({ copyFormat }),
      setBooksCompact: (booksCompact) => set({ booksCompact }),
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      completeOnboarding: () => set({ onboarded: true }),
      setStep: (step) => set({ step }),
      selectBook: (bookId) =>
        set({
          bookId,
          chapter: null,
          verseStart: null,
          verseEnd: null,
          step: "chapter",
        }),
      selectChapter: (chapter) =>
        set({
          chapter,
          verseStart: null,
          verseEnd: null,
          step: "verse",
        }),
      selectVerse: (verse) => {
        const { verseStart, verseEnd } = get();
        if (verseStart == null) {
          set({ verseStart: verse, verseEnd: verse });
          return;
        }
        if (verseEnd == null || verseStart === verseEnd) {
          set({ verseEnd: verse });
          return;
        }
        set({ verseStart: verse, verseEnd: verse });
      },
      selectWholeChapter: () => set({ verseStart: null, verseEnd: null }),
      applyPassage: (passage) => {
        const book = bookById(passage.bookId);
        set({
          bookId: passage.bookId,
          chapter: passage.chapter,
          verseStart: passage.verseStart,
          verseEnd: passage.verseEnd,
          step: book && passage.chapter ? "verse" : passage.bookId ? "chapter" : "book",
        });
      },
      remember: (passage) => {
        const recent = [
          passage,
          ...get().recent.filter((item) => !samePassage(item, passage)),
        ].slice(0, 10);
        set({ recent });
      },
      addToList: (passage) => {
        const { list } = get();
        if (list.some((item) => samePassage(item, passage))) return false;
        set({ list: [...list, passage].slice(-30) });
        return true;
      },
      removeFromList: (passage) =>
        set({ list: get().list.filter((item) => !samePassage(item, passage)) }),
      clearList: () => set({ list: [] }),
      resetSelection: () =>
        set({
          bookId: null,
          chapter: null,
          verseStart: null,
          verseEnd: null,
          step: "book",
        }),
      passage: () => {
        const { bookId, chapter, verseStart, verseEnd } = get();
        if (!bookId || !chapter) return null;
        return { bookId, chapter, verseStart, verseEnd };
      },
    }),
    {
      name: "cita-settings",
      partialize: (state) => ({
        locale: state.locale,
        appId: state.appId,
        translationId: state.translationId,
        preferNative: state.preferNative,
        copyFormat: state.copyFormat,
        booksCompact: state.booksCompact,
        theme: state.theme,
        onboarded: state.onboarded,
        recent: state.recent,
        list: state.list,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...saved,
          onboarded: typeof saved.onboarded === "boolean" ? saved.onboarded : Boolean(persisted),
          theme: saved.theme ?? "system",
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.recent?.length > 10) state.recent = state.recent.slice(0, 10);
        if (state.list?.length > 1) {
          const unique: Passage[] = [];
          for (const item of state.list) {
            if (!unique.some((entry) => samePassage(entry, item))) unique.push(item);
          }
          state.list = unique;
        }
        if (typeof document !== "undefined") {
          document.documentElement.lang = state.locale;
          applyTheme(state.theme);
        }
      },
    },
  ),
);
