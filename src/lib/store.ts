import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/bible/books";
import { bookById } from "@/lib/bible/books";
import type { Passage } from "@/lib/bible/passage";
import { samePassage } from "@/lib/bible/passage";
import { DEFAULT_TRANSLATION, translationsFor } from "@/lib/bible/translations";
import type { CopyFormat } from "@/lib/copy-rich";
import { detectLocale } from "@/lib/i18n";
import type { CloudPrefs } from "@/lib/cloud";
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
  tourDone: boolean;
  bookId: string | null;
  chapter: number | null;
  verseStart: number | null;
  verseEnd: number | null;
  step: Step;
  recent: Passage[];
  list: Passage[];
  planProgress: Record<string, number[]>;
  activePlans: string[];
  avatarId: string;
  handle: string;
  firstName: string;
  lastName: string;
  profileEmail: string;
  setLocale: (locale: Locale) => void;
  setAppId: (id: string) => void;
  setTranslationId: (id: string) => void;
  setPreferNative: (value: boolean) => void;
  setCopyFormat: (format: CopyFormat) => void;
  setBooksCompact: (value: boolean) => void;
  setTheme: (theme: Theme) => void;
  completeOnboarding: () => void;
  completeTour: () => void;
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
  clearPassage: () => void;
  togglePlanDay: (planId: string, day: number) => void;
  resetPlanProgress: (planId: string) => void;
  startPlan: (planId: string) => void;
  stopPlan: (planId: string) => void;
  applyCloud: (prefs: CloudPrefs) => void;
  setProfile: (profile: {
    avatarId?: string;
    handle?: string;
    firstName?: string;
    lastName?: string;
    profileEmail?: string;
  }) => void;
  clearAccount: () => void;
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
      booksCompact: false,
      theme: "system",
      onboarded: false,
      tourDone: false,
      bookId: null,
      chapter: null,
      verseStart: null,
      verseEnd: null,
      step: "book",
      recent: [],
      list: [],
      planProgress: {},
      activePlans: [],
      avatarId: "book",
      handle: "",
      firstName: "",
      lastName: "",
      profileEmail: "",
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
      completeTour: () => set({ tourDone: true }),
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
      clearPassage: () => {
        const { bookId } = get();
        set({
          chapter: null,
          verseStart: null,
          verseEnd: null,
          step: bookId ? "chapter" : "book",
        });
      },
      togglePlanDay: (planId, day) => {
        const current = get().planProgress[planId] ?? [];
        const next = current.includes(day) ? current.filter((item) => item !== day) : [...current, day];
        set({ planProgress: { ...get().planProgress, [planId]: next } });
      },
      resetPlanProgress: (planId) => {
        const { [planId]: _removed, ...rest } = get().planProgress;
        set({ planProgress: rest });
      },
      startPlan: (planId) => {
        const activePlans = [planId, ...get().activePlans.filter((id) => id !== planId)];
        set({ activePlans });
      },
      stopPlan: (planId) => {
        set({ activePlans: get().activePlans.filter((id) => id !== planId) });
      },
      applyCloud: (prefs) => {
        set({
          locale: prefs.locale,
          appId: prefs.appId,
          translationId: prefs.translationId,
          preferNative: prefs.preferNative,
          copyFormat: prefs.copyFormat,
          booksCompact: prefs.booksCompact,
          theme: prefs.theme,
          activePlans: prefs.activePlans,
          planProgress: prefs.planProgress,
          avatarId: prefs.avatarId,
          handle: prefs.handle,
          firstName: prefs.firstName,
          lastName: prefs.lastName,
          profileEmail: prefs.profileEmail,
          onboarded: true,
          tourDone: true,
        });
        if (typeof document !== "undefined") {
          document.documentElement.lang = prefs.locale;
          applyTheme(prefs.theme);
        }
      },
      setProfile: (profile) => set(profile),
      clearAccount: () =>
        set({
          activePlans: [],
          planProgress: {},
          avatarId: "book",
          handle: "",
          firstName: "",
          lastName: "",
          profileEmail: "",
        }),
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
        tourDone: state.tourDone,
        recent: state.recent,
        list: state.list,
        planProgress: state.planProgress,
        activePlans: state.activePlans,
        avatarId: state.avatarId,
        handle: state.handle,
        firstName: state.firstName,
        lastName: state.lastName,
        profileEmail: state.profileEmail,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...saved,
          onboarded: typeof saved.onboarded === "boolean" ? saved.onboarded : Boolean(persisted),
          tourDone: saved.tourDone === true,
          planProgress:
            saved.planProgress && typeof saved.planProgress === "object" ? saved.planProgress : {},
          activePlans: Array.isArray(saved.activePlans) ? saved.activePlans : [],
          avatarId: saved.avatarId || "book",
          handle: saved.handle ?? "",
          firstName: saved.firstName ?? "",
          lastName: saved.lastName ?? "",
          profileEmail: saved.profileEmail ?? "",
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
