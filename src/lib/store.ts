import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/bible/books";
import { bookById } from "@/lib/bible/books";
import type { Passage } from "@/lib/bible/passage";
import { samePassage } from "@/lib/bible/passage";
import type { CiteBook, CiteSep } from "@/lib/bible/passage";
import { DEFAULT_TRANSLATION, translationsFor } from "@/lib/bible/translations";
import type { CopyFormat } from "@/lib/copy-rich";
import { detectLocale } from "@/lib/i18n";
import type { CloudPrefs } from "@/lib/cloud";
import type { UserCollection } from "@/lib/user-collection";
import type { Note, Speaker } from "@/lib/notebook";
import { asNote, asSpeaker } from "@/lib/notebook";
import { applyTheme, type Theme } from "@/lib/theme";

export type Step = "book" | "chapter" | "verse";

type AppState = {
  locale: Locale;
  copyLocale: Locale;
  appId: string;
  translationId: string;
  preferNative: boolean;
  copyFormat: CopyFormat;
  citeBook: CiteBook;
  citeSep: CiteSep;
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
  avatarUrl: string;
  handle: string;
  firstName: string;
  lastName: string;
  profileEmail: string;
  myCollections: UserCollection[];
  notes: Note[];
  speakers: Speaker[];
  notebookActiveSpeakerId: string | null;
  cloudHydrated: boolean;
  cloudProfileOk: boolean;
  setLocale: (locale: Locale) => void;
  setCopyLocale: (locale: Locale) => void;
  setAppId: (id: string) => void;
  setTranslationId: (id: string) => void;
  setPreferNative: (value: boolean) => void;
  setCopyFormat: (format: CopyFormat) => void;
  setCiteBook: (value: CiteBook) => void;
  setCiteSep: (value: CiteSep) => void;
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
    avatarUrl?: string;
    handle?: string;
    firstName?: string;
    lastName?: string;
    profileEmail?: string;
  }) => void;
  setMyCollections: (items: UserCollection[]) => void;
  setNotes: (items: Note[]) => void;
  setSpeakers: (items: Speaker[]) => void;
  setNotebookActiveSpeakerId: (id: string | null) => void;
  setCloudHydrated: (value: boolean) => void;
  setCloudProfileOk: (value: boolean) => void;
  clearAccount: () => void;
  resetSelection: () => void;
  passage: () => Passage | null;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: detectLocale(),
      copyLocale: detectLocale(),
      appId: "youversion",
      translationId: DEFAULT_TRANSLATION[detectLocale()],
      preferNative: false,
      copyFormat: "rich",
      citeBook: "name",
      citeSep: "colon",
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
      avatarUrl: "",
      handle: "",
      firstName: "",
      lastName: "",
      profileEmail: "",
      myCollections: [],
      notes: [],
      speakers: [],
      notebookActiveSpeakerId: null,
      cloudHydrated: false,
      cloudProfileOk: false,
      setLocale: (locale) => {
        set({ locale });
        if (typeof document !== "undefined") document.documentElement.lang = locale;
      },
      setCopyLocale: (copyLocale) => {
        const available = translationsFor(copyLocale);
        const current = get().translationId;
        const next =
          available.some((item) => item.id === current) ? current : DEFAULT_TRANSLATION[copyLocale];
        set({ copyLocale, translationId: next });
      },
      setAppId: (appId) => set({ appId }),
      setTranslationId: (translationId) => set({ translationId }),
      setPreferNative: (preferNative) => set({ preferNative }),
      setCopyFormat: (copyFormat) => set({ copyFormat }),
      setCiteBook: (citeBook) => set({ citeBook }),
      setCiteSep: (citeSep) => set({ citeSep }),
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
          copyLocale: prefs.copyLocale,
          appId: prefs.appId,
          translationId: prefs.translationId,
          preferNative: prefs.preferNative,
          copyFormat: prefs.copyFormat,
          citeBook: prefs.citeBook,
          citeSep: prefs.citeSep,
          booksCompact: prefs.booksCompact,
          theme: prefs.theme,
          activePlans: prefs.activePlans,
          planProgress: prefs.planProgress,
          avatarId: prefs.avatarId,
          avatarUrl: prefs.avatarUrl,
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
      setMyCollections: (myCollections) => set({ myCollections }),
      setNotes: (notes) => set({ notes }),
      setSpeakers: (speakers) => set({ speakers }),
      setNotebookActiveSpeakerId: (notebookActiveSpeakerId) => set({ notebookActiveSpeakerId }),
      setCloudHydrated: (cloudHydrated) => set({ cloudHydrated }),
      setCloudProfileOk: (cloudProfileOk) => set({ cloudProfileOk }),
      clearAccount: () =>
        set({
          activePlans: [],
          planProgress: {},
          avatarId: "book",
          avatarUrl: "",
          handle: "",
          firstName: "",
          lastName: "",
          profileEmail: "",
          myCollections: [],
          cloudProfileOk: false,
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
        copyLocale: state.copyLocale,
        appId: state.appId,
        translationId: state.translationId,
        preferNative: state.preferNative,
        copyFormat: state.copyFormat,
        citeBook: state.citeBook,
        citeSep: state.citeSep,
        booksCompact: state.booksCompact,
        theme: state.theme,
        onboarded: state.onboarded,
        tourDone: state.tourDone,
        recent: state.recent,
        list: state.list,
        planProgress: state.planProgress,
        activePlans: state.activePlans,
        avatarId: state.avatarId,
        avatarUrl: state.avatarUrl,
        handle: state.handle,
        firstName: state.firstName,
        lastName: state.lastName,
        profileEmail: state.profileEmail,
        myCollections: state.myCollections,
        notes: state.notes,
        speakers: state.speakers,
        cloudProfileOk: state.cloudProfileOk,
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
          avatarUrl: saved.avatarUrl ?? "",
          handle: saved.handle ?? "",
          firstName: saved.firstName ?? "",
          lastName: saved.lastName ?? "",
          profileEmail: saved.profileEmail ?? "",
          myCollections: Array.isArray(saved.myCollections) ? saved.myCollections : [],
          notes: Array.isArray(saved.notes)
            ? saved.notes.map(asNote).filter((item): item is Note => Boolean(item)).slice(0, 200)
            : [],
          speakers: Array.isArray(saved.speakers)
            ? saved.speakers.map(asSpeaker).filter((item): item is Speaker => Boolean(item)).slice(0, 80)
            : [],
          cloudProfileOk: saved.cloudProfileOk === true,
          theme: saved.theme ?? "system",
          copyLocale: saved.copyLocale === "en" || saved.copyLocale === "es" || saved.copyLocale === "pt"
            ? saved.copyLocale
            : saved.locale ?? current.locale,
          citeBook: saved.citeBook === "abbr" ? "abbr" : "name",
          citeSep: saved.citeSep === "dot" || saved.citeSep === "comma" ? saved.citeSep : "colon",
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
