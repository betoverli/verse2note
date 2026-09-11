import type { Locale } from "@/lib/bible/books";

export const BADGE_IDS = [
  "plan_1",
  "plan_3",
  "plan_5",
  "plan_10",
  "days_7",
  "days_30",
  "days_100",
  "invite_1",
  "invite_3",
  "invite_5",
  "invite_10",
  "list_1",
  "list_5",
  "share_1",
] as const;

export type BadgeId = (typeof BADGE_IDS)[number];

export const BADGE_COPY: Record<
  BadgeId,
  { names: Record<Locale, string>; hints: Record<Locale, string> }
> = {
  plan_1: {
    names: { pt: "Primeira pedra", en: "First stone", es: "Primera piedra" },
    hints: { pt: "Complete 1 plano de leitura.", en: "Finish 1 reading plan.", es: "Termina 1 plan de lectura." },
  },
  plan_3: {
    names: { pt: "Tríplice corda", en: "Threefold cord", es: "Cuerda triple" },
    hints: { pt: "Complete 3 planos.", en: "Finish 3 plans.", es: "Termina 3 planes." },
  },
  plan_5: {
    names: { pt: "Cinco pães", en: "Five loaves", es: "Cinco panes" },
    hints: { pt: "Complete 5 planos.", en: "Finish 5 plans.", es: "Termina 5 planes." },
  },
  plan_10: {
    names: { pt: "Dez talentos", en: "Ten talents", es: "Diez talentos" },
    hints: { pt: "Complete 10 planos.", en: "Finish 10 plans.", es: "Termina 10 planes." },
  },
  days_7: {
    names: { pt: "Sétimo dia", en: "Seventh day", es: "Séptimo día" },
    hints: { pt: "Marque 7 dias de leitura.", en: "Check off 7 reading days.", es: "Marca 7 días de lectura." },
  },
  days_30: {
    names: { pt: "Maná", en: "Manna", es: "Maná" },
    hints: { pt: "Marque 30 dias de leitura.", en: "Check off 30 reading days.", es: "Marca 30 días de lectura." },
  },
  days_100: {
    names: { pt: "Cem ovelhas", en: "A hundred sheep", es: "Cien ovejas" },
    hints: { pt: "Marque 100 dias de leitura.", en: "Check off 100 reading days.", es: "Marca 100 días de lectura." },
  },
  invite_1: {
    names: { pt: "Dois ou três", en: "Two or three", es: "Dos o tres" },
    hints: {
      pt: "Um amigo entra num plano com você.",
      en: "A friend joins a plan with you.",
      es: "Un amigo entra a un plan contigo.",
    },
  },
  invite_3: {
    names: { pt: "Mesa posta", en: "The table", es: "Mesa puesta" },
    hints: { pt: "3 amigos aceitam o convite.", en: "3 friends accept the invite.", es: "3 amigos aceptan la invitación." },
  },
  invite_5: {
    names: { pt: "Pães e peixes", en: "Loaves and fish", es: "Panes y peces" },
    hints: { pt: "5 amigos aceitam o convite.", en: "5 friends accept the invite.", es: "5 amigos aceptan la invitación." },
  },
  invite_10: {
    names: { pt: "Nuvem", en: "The cloud", es: "Nube" },
    hints: { pt: "10 amigos aceitam o convite.", en: "10 friends accept the invite.", es: "10 amigos aceptan la invitación." },
  },
  list_1: {
    names: { pt: "O caderno", en: "The notebook", es: "El cuaderno" },
    hints: { pt: "Crie uma coleção.", en: "Create a collection.", es: "Crea una colección." },
  },
  list_5: {
    names: { pt: "O tesouro", en: "The treasury", es: "El tesoro" },
    hints: { pt: "Crie 5 coleções.", en: "Create 5 collections.", es: "Crea 5 colecciones." },
  },
  share_1: {
    names: { pt: "O semeador", en: "The sower", es: "El sembrador" },
    hints: { pt: "Compartilhe uma coleção.", en: "Share a collection.", es: "Comparte una colección." },
  },
};
