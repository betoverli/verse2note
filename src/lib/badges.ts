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
    names: { pt: "Primeiro plano", en: "First plan", es: "Primer plan" },
    hints: { pt: "Complete 1 plano de leitura.", en: "Finish 1 reading plan.", es: "Termina 1 plan de lectura." },
  },
  plan_3: {
    names: { pt: "3 planos", en: "3 plans", es: "3 planes" },
    hints: { pt: "Complete 3 planos.", en: "Finish 3 plans.", es: "Termina 3 planes." },
  },
  plan_5: {
    names: { pt: "5 planos", en: "5 plans", es: "5 planes" },
    hints: { pt: "Complete 5 planos.", en: "Finish 5 plans.", es: "Termina 5 planes." },
  },
  plan_10: {
    names: { pt: "10 planos", en: "10 plans", es: "10 planes" },
    hints: { pt: "Complete 10 planos.", en: "Finish 10 plans.", es: "Termina 10 planes." },
  },
  days_7: {
    names: { pt: "7 dias", en: "7 days", es: "7 días" },
    hints: { pt: "Marque 7 dias de leitura.", en: "Check off 7 reading days.", es: "Marca 7 días de lectura." },
  },
  days_30: {
    names: { pt: "30 dias", en: "30 days", es: "30 días" },
    hints: { pt: "Marque 30 dias de leitura.", en: "Check off 30 reading days.", es: "Marca 30 días de lectura." },
  },
  days_100: {
    names: { pt: "100 dias", en: "100 days", es: "100 días" },
    hints: { pt: "Marque 100 dias de leitura.", en: "Check off 100 reading days.", es: "Marca 100 días de lectura." },
  },
  invite_1: {
    names: { pt: "Primeiro convite", en: "First invite", es: "Primera invitación" },
    hints: {
      pt: "Um amigo entra num plano com você.",
      en: "A friend joins a plan with you.",
      es: "Un amigo entra a un plan contigo.",
    },
  },
  invite_3: {
    names: { pt: "3 amigos", en: "3 friends", es: "3 amigos" },
    hints: { pt: "3 amigos aceitam o convite.", en: "3 friends accept the invite.", es: "3 amigos aceptan la invitación." },
  },
  invite_5: {
    names: { pt: "5 amigos", en: "5 friends", es: "5 amigos" },
    hints: { pt: "5 amigos aceitam o convite.", en: "5 friends accept the invite.", es: "5 amigos aceptan la invitación." },
  },
  invite_10: {
    names: { pt: "10 amigos", en: "10 friends", es: "10 amigos" },
    hints: { pt: "10 amigos aceitam o convite.", en: "10 friends accept the invite.", es: "10 amigos aceptan la invitación." },
  },
  list_1: {
    names: { pt: "Primeira lista", en: "First list", es: "Primera lista" },
    hints: { pt: "Crie uma coleção.", en: "Create a collection.", es: "Crea una colección." },
  },
  list_5: {
    names: { pt: "5 listas", en: "5 lists", es: "5 listas" },
    hints: { pt: "Crie 5 coleções.", en: "Create 5 collections.", es: "Crea 5 colecciones." },
  },
  share_1: {
    names: { pt: "Lista compartilhada", en: "Shared list", es: "Lista compartida" },
    hints: { pt: "Compartilhe uma coleção.", en: "Share a collection.", es: "Comparte una colección." },
  },
};
