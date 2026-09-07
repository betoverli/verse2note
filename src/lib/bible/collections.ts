import type { Locale } from "./books";
import { bookById } from "./books";
import { formatPassage, type Passage } from "./passage";

export type CollectionPassage = Passage & {
  snippet: Record<Locale, string>;
};

export type Collection = {
  id: string;
  names: Record<Locale, string>;
  passages: CollectionPassage[];
};

/** First words only. Full verse text is not stored. */
export const SNIPPET_SOURCES: Record<Locale, string> = {
  pt: "Bíblia Livre (CC BY 3.0)",
  en: "World English Bible (public domain)",
  es: "Versión Biblia Libre (CC BY-SA 4.0)",
};

export const COLLECTIONS: Collection[] = [
  {
    id: "salvation",
    names: { pt: "Salvação", en: "Salvation", es: "Salvación" },
    passages: [
      { bookId: "JHN", chapter: 3, verseStart: 16, verseEnd: null, snippet: { pt: "Porque Deus amou ao mundo de tal maneira, que deu…", en: "For God so loved the world, that he gave his…", es: "Porque Dios amó al mundo, y lo hizo de esta…" } },
      { bookId: "ROM", chapter: 3, verseStart: 23, verseEnd: null, snippet: { pt: "porque todos pecaram, e estão destituídos da glória de Deus;", en: "for all have sinned, and fall short of the glory…", es: "Todos hemos pecado y hemos fallado en alcanzar el ideal…" } },
      { bookId: "ROM", chapter: 5, verseStart: 8, verseEnd: null, snippet: { pt: "Mas Deus prova o seu amor por nós através de…", en: "But God commends his own love toward us, in that…", es: "Pero Dios demuestra su amor en que Cristo murió por…" } },
      { bookId: "ROM", chapter: 6, verseStart: 23, verseEnd: null, snippet: { pt: "porque o salário do pecado é a morte, mas o…", en: "For the wages of sin is death, but the free…", es: "La paga del pecado es muerte, pero el regalo de…" } },
      { bookId: "ROM", chapter: 10, verseStart: 9, verseEnd: 10, snippet: { pt: "Pois, se com a tua boca declarares que Jesus é…", en: "that if you will confess with your mouth that Jesus…", es: "Porque si declaras que aceptas a Jesús como Señor, y…" } },
      { bookId: "EPH", chapter: 2, verseStart: 8, verseEnd: 9, snippet: { pt: "Porque pela graça sois salvos, por meio da fé; e…", en: "for by grace you have been saved through faith, and…", es: "Porque ustedes han sido salvos por gracia, por la fe…" } },
      { bookId: "ACT", chapter: 16, verseStart: 31, verseEnd: null, snippet: { pt: "E eles lhe disseram: Crê no Senhor Jesus Cristo, e…", en: "They said, “Believe in the Lord Jesus Christ, and you…", es: "Cree en el Señor Jesús y serás salvo, tú y…" } },
      { bookId: "TIT", chapter: 3, verseStart: 5, verseEnd: null, snippet: { pt: "Não pelas obras de justiça que nós tivéssemos feito, mas…", en: "not by works of righteousness, which we did ourselves, but…", es: "no porque hubiésemos hecho algo bueno, sino por su misericordia.…" } },
    ],
  },
  {
    id: "grace",
    names: { pt: "Graça", en: "Grace", es: "Gracia" },
    passages: [
      { bookId: "EPH", chapter: 2, verseStart: 8, verseEnd: 9, snippet: { pt: "Porque pela graça sois salvos, por meio da fé; e…", en: "for by grace you have been saved through faith, and…", es: "Porque ustedes han sido salvos por gracia, por la fe…" } },
      { bookId: "ROM", chapter: 3, verseStart: 24, verseEnd: null, snippet: { pt: "e são justificados gratuitamente pela sua graça, por meio da…", en: "being justified freely by his grace through the redemption that…", es: "Sin embargo, por medio del regalo de su gracia, Dios…" } },
      { bookId: "2CO", chapter: 12, verseStart: 9, verseEnd: null, snippet: { pt: "Mas ele me disse: “Minha graça te basta, porque meu…", en: "He has said to me, “My grace is sufficient for…", es: "Pero él me dijo: “Mi gracia te bastará, pues mi…" } },
      { bookId: "HEB", chapter: 4, verseStart: 16, verseEnd: null, snippet: { pt: "Portanto, acheguemo-nos com confiança ao trono da graça, para que…", en: "Let us therefore draw near with boldness to the throne…", es: "Así que deberíamos acercarnos confiados a Dios, en su trono…" } },
      { bookId: "JHN", chapter: 1, verseStart: 16, verseEnd: 17, snippet: { pt: "E de sua plenitude recebemos todos também graça por graça.", en: "From his fullness we all received grace upon grace.", es: "Nosotros todos hemos sido receptores de su generosidad, de un…" } },
      { bookId: "TIT", chapter: 2, verseStart: 11, verseEnd: null, snippet: { pt: "Porque a graça salvadora de Deus se manifestou a todos…", en: "For the grace of God has appeared, bringing salvation to…", es: "Pues la gracia de Dios ha sido revelada, otorgando salvación…" } },
    ],
  },
  {
    id: "faith",
    names: { pt: "Fé", en: "Faith", es: "Fe" },
    passages: [
      { bookId: "HEB", chapter: 11, verseStart: 1, verseEnd: null, snippet: { pt: "Ora, a fé é a certeza das coisas que se…", en: "Now faith is assurance of things hoped for, proof of…", es: "Ahora bien, nuestra fe en Dios es la seguridad de…" } },
      { bookId: "HEB", chapter: 11, verseStart: 6, verseEnd: null, snippet: { pt: "Ora, sem fé é impossível agradar a Deus . Pois…", en: "Without faith it is impossible to be well pleasing to…", es: "¡No podemos esperar que Dios se agrade de nosotros si…" } },
      { bookId: "ROM", chapter: 10, verseStart: 17, verseEnd: null, snippet: { pt: "Portanto, a fé vem pelo ouvir, e o ouvir pela…", en: "So faith comes by hearing, and hearing by the word…", es: "Creer en Dios viene de oír, de oír el mensaje…" } },
      { bookId: "2CO", chapter: 5, verseStart: 7, verseEnd: null, snippet: { pt: "(Pois andamos pela fé, e não pela vista).", en: "for we walk by faith, not by sight.", es: "(Pues vivimos por la fe en el Señor, y no…" } },
      { bookId: "HAB", chapter: 2, verseStart: 4, verseEnd: null, snippet: { pt: "Eis que o soberbo não tem a alma correta em…", en: "Behold, his soul is puffed up. It is not upright…", es: "¡Mira a los orgullosos! No viven con rectitud. Pero los…" } },
      { bookId: "JAS", chapter: 2, verseStart: 17, verseEnd: null, snippet: { pt: "Assim também a fé, se não tiver obras, é morta…", en: "Even so faith, if it has no works, is dead…", es: "Porque la fe basada en la confianza en Dios por…" } },
      { bookId: "MRK", chapter: 11, verseStart: 22, verseEnd: 24, snippet: { pt: "E respondendo Jesus, disse-lhes: Tende fé em Deus.", en: "Jesus answered them, “Have faith in God.", es: "Crean en Dios”, respondió Jesús." } },
    ],
  },
  {
    id: "prayer",
    names: { pt: "Oração", en: "Prayer", es: "Oración" },
    passages: [
      { bookId: "MAT", chapter: 6, verseStart: 6, verseEnd: 13, snippet: { pt: "Porém tu, quando orares, entra em teu quarto, fecha tua…", en: "But you, when you pray, enter into your inner room,…", es: "Pero ustedes, cuando oren, entren a su casa y cierren…" } },
      { bookId: "PHP", chapter: 4, verseStart: 6, verseEnd: 7, snippet: { pt: "Não estejais ansiosos por coisa alguma; mas em tudo, por…", en: "In nothing be anxious, but in everything, by prayer and…", es: "No se preocupen por nada, sino oren a Dios por…" } },
      { bookId: "1TH", chapter: 5, verseStart: 17, verseEnd: null, snippet: { pt: "Orai sem cessar.", en: "Pray without ceasing.", es: "nunca dejen de orar," } },
      { bookId: "JAS", chapter: 5, verseStart: 16, verseEnd: null, snippet: { pt: "Confessai as vossas culpas uns aos outros, e orai uns…", en: "Confess your offenses to one another, and pray for one…", es: "Admitan unos delante de otros los errores que han cometido,…" } },
      { bookId: "JHN", chapter: 14, verseStart: 13, verseEnd: 14, snippet: { pt: "E tudo quanto pedirdes em meu nome, eu o farei;…", en: "Whatever you will ask in my name, that will I…", es: "Yo haré cualquier cosa que ustedes pidan en mi nombre,…" } },
      { bookId: "JER", chapter: 33, verseStart: 3, verseEnd: null, snippet: { pt: "Clama a mim, e eu te responderei; e te direi…", en: "Call to me, and I will answer you, and will…", es: "Clama a mí, y yo te responderé, explicándote cosas sorprendentes…" } },
      { bookId: "1JN", chapter: 5, verseStart: 14, verseEnd: null, snippet: { pt: "E esta é a confiança que diante dele: que se…", en: "This is the boldness which we have toward him, that,…", es: "Podemos estar seguros de que él nos escuchará siempre y…" } },
    ],
  },
  {
    id: "anxiety",
    names: { pt: "Ansiedade", en: "Anxiety", es: "Ansiedad" },
    passages: [
      { bookId: "PHP", chapter: 4, verseStart: 6, verseEnd: 7, snippet: { pt: "Não estejais ansiosos por coisa alguma; mas em tudo, por…", en: "In nothing be anxious, but in everything, by prayer and…", es: "No se preocupen por nada, sino oren a Dios por…" } },
      { bookId: "1PE", chapter: 5, verseStart: 7, verseEnd: null, snippet: { pt: "lançando sobre ele toda a vossa ansiedade; porque ele tem…", en: "casting all your worries on him, because he cares for…", es: "Entreguen todas sus preocupaciones a él, porque él tiene cuidado…" } },
      { bookId: "MAT", chapter: 6, verseStart: 25, verseEnd: 34, snippet: { pt: "Por isso vos digo: não andeis ansiosos por vossa vida,…", en: "Therefore I tell you, don’t be anxious for your life:…", es: "Por eso les digo que no se preocupen por sus…" } },
      { bookId: "ISA", chapter: 41, verseStart: 10, verseEnd: null, snippet: { pt: "Não temas, porque eu estou contigo; não te assombres, porque…", en: "Don’t you be afraid, for I am with you. Don’t…", es: "¡No tengan miedo, porque yo estoy con ustedes! No tengan…" } },
      { bookId: "JHN", chapter: 14, verseStart: 27, verseEnd: null, snippet: { pt: "A paz vos deixo, minha paz vos dou; vou dá-…", en: "Peace I leave with you. My peace I give to…", es: "Yo les dejo paz; les estoy dando mi paz. La…" } },
      { bookId: "PSA", chapter: 55, verseStart: 22, verseEnd: null, snippet: { pt: "Entrega tuas preocupações ao SENHOR, e ele te sustentará; ele…", en: "Cast your burden on Yahweh, and he will sustain you.…", es: "Arroja tus cargas sobre el Señor y él te cuidará.…" } },
    ],
  },
  {
    id: "family",
    names: { pt: "Família", en: "Family", es: "Familia" },
    passages: [
      { bookId: "JOS", chapter: 24, verseStart: 15, verseEnd: null, snippet: { pt: "E se mal vos parece servir ao SENHOR, escolhei hoje…", en: "If it seems evil to you to serve Yahweh, choose…", es: "Pero si no quieren adorar al Señor, ¡elijan hoy a…" } },
      { bookId: "PRO", chapter: 22, verseStart: 6, verseEnd: null, snippet: { pt: "Instrui ao menino em seu caminho, e até quando envelhecer,…", en: "Train up a child in the way he should go,…", es: "Enseña a los niños el modo correcto de vivir, y…" } },
      { bookId: "EPH", chapter: 5, verseStart: 25, verseEnd: null, snippet: { pt: "Maridos, amai as vossas próprias esposas, assim como também Cristo…", en: "Husbands, love your wives, even as Christ also loved the…", es: "Esposos, amen a sus esposas de la misma manera que…" } },
      { bookId: "EPH", chapter: 6, verseStart: 1, verseEnd: 4, snippet: { pt: "Filhos, sede obedientes aos vossos pais no Senhor, porque isso…", en: "Children, obey your parents in the Lord, for this is…", es: "Hijos, hagan lo que sus padres les dicen, porque esto…" } },
      { bookId: "COL", chapter: 3, verseStart: 18, verseEnd: 21, snippet: { pt: "Mulheres, sede submissas aos vossos maridos, como convém no Senhor.", en: "Wives, be in subjection to your husbands, as is fitting…", es: "Ustedes, mujeres casadas, respeten a sus esposos como es debido…" } },
      { bookId: "PSA", chapter: 127, verseStart: 3, verseEnd: null, snippet: { pt: "Eis que os filhos são um presente do SENHOR; o…", en: "Behold, children are a heritage of Yahweh. The fruit of…", es: "Ciertamente los hijos son un regalo del Señor, porque la…" } },
    ],
  },
  {
    id: "church",
    names: { pt: "Igreja", en: "Church", es: "Iglesia" },
    passages: [
      { bookId: "MAT", chapter: 16, verseStart: 18, verseEnd: null, snippet: { pt: "E eu também te digo que tu és Pedro, e…", en: "I also tell you that you are Peter,and on this…", es: "También te digo que tú eres Pedro, y sobre esta…" } },
      { bookId: "ACT", chapter: 2, verseStart: 42, verseEnd: null, snippet: { pt: "E eles perseveravam na doutrina dos apóstolos, na comunhão, no…", en: "They continued steadfastly in the apostles’ teaching and fellowship, in…", es: "Ellos se comprometieron a seguir lo que los apóstoles les…" } },
      { bookId: "HEB", chapter: 10, verseStart: 24, verseEnd: 25, snippet: { pt: "e sejamos atenciosos uns para com os outros, a fim…", en: "Let us consider how to provoke one another to love…", es: "Pensemos en cómo podemos animarnos unos a otros a amar…" } },
      { bookId: "EPH", chapter: 4, verseStart: 11, verseEnd: 16, snippet: { pt: "E ele mesmo deu uns como apóstolos, outros como profetas,…", en: "He gave some to be apostles; and some, prophets; and…", es: "Los dones que él dio fueron tantos que algunos pudieron…" } },
      { bookId: "1CO", chapter: 12, verseStart: 12, verseEnd: 13, snippet: { pt: "Porque assim como o corpo é um, e tem muitos…", en: "For as the body is one, and has many members,…", es: "Así como el cuerpo humano es una unidad pero tiene…" } },
      { bookId: "COL", chapter: 1, verseStart: 18, verseEnd: null, snippet: { pt: "E ele é a cabeça do corpo, da Igreja; ele…", en: "He is the head of the body, the assembly, who…", es: "Él también es la cabeza del cuerpo, que es la…" } },
    ],
  },
  {
    id: "christmas",
    names: { pt: "Natal", en: "Christmas", es: "Navidad" },
    passages: [
      { bookId: "ISA", chapter: 9, verseStart: 6, verseEnd: null, snippet: { pt: "Porque um menino nos nasceu, um filho nos foi dado;…", en: "For to us a child is born. To us a…", es: "Porque nos nacerá un niño, se nos dará un hijo.…" } },
      { bookId: "MIC", chapter: 5, verseStart: 2, verseEnd: null, snippet: { pt: "Porém tu, Belém Efrata, ainda que sejas pequena entre as…", en: "But you, Bethlehem Ephrathah, being small among the clans of…", es: "Pero de ti, Belén Efrata, (aunque eres solamente un lugar…" } },
      { bookId: "MAT", chapter: 1, verseStart: 21, verseEnd: 23, snippet: { pt: "E ela dará à luz um filho, e tu chamarás…", en: "She shall give birth to a son. You shall call…", es: "Ella tendrá un hijo y tú le llamarás Jesús, porque…" } },
      { bookId: "LUK", chapter: 2, verseStart: 8, verseEnd: 14, snippet: { pt: "E naquela mesma localidade havia pastores que estavam no campo,…", en: "There were shepherds in the same country staying in the…", es: "Cerca de allí había unos pastores que pasaban la noche…" } },
      { bookId: "JHN", chapter: 1, verseStart: 14, verseEnd: null, snippet: { pt: "E aquela Palavra se fez carne, e habitou entre nós;…", en: "The Word became flesh, and lived among us. We saw…", es: "La Palabra se volvió humana y vivió entre nosotros, y…" } },
      { bookId: "GAL", chapter: 4, verseStart: 4, verseEnd: null, snippet: { pt: "Mas quando o tempo se completou, Deus enviou o seu…", en: "But when the fullness of the time came, God sent…", es: "Pero en el momento apropiado Dios envió a su hijo,…" } },
    ],
  },
  {
    id: "easter",
    names: { pt: "Páscoa", en: "Easter", es: "Pascua" },
    passages: [
      { bookId: "ISA", chapter: 53, verseStart: 5, verseEnd: null, snippet: { pt: "Porém ele foi ferido por nossas transgressões, e esmagado por…", en: "But he was pierced for our transgressions. He was crushed…", es: "Pero fue herido por nuestros actos rebeldes, fue aplastado por…" } },
      { bookId: "MAT", chapter: 28, verseStart: 5, verseEnd: 6, snippet: { pt: "Mas o anjo disse às mulheres: Não vos atemorizeis, pois…", en: "The angel answered the women, “Don’t be afraid, for I…", es: "El ángel dijo a las mujeres: “¡No tengan miedo! Yo…" } },
      { bookId: "JHN", chapter: 11, verseStart: 25, verseEnd: 26, snippet: { pt: "Disse-lhe Jesus: Eu sou a ressurreição, e a vida; quem…", en: "Jesus said to her, “I am the resurrection and the…", es: "Jesús dijo: “Yo soy la resurrección y la vida. Aquellos…" } },
      { bookId: "1CO", chapter: 15, verseStart: 3, verseEnd: 4, snippet: { pt: "Porque primeiramente vos entreguei o que também recebi, que Cristo…", en: "For I delivered to you first of all that which…", es: "Yo les di lo que yo mismo también recibí, un…" } },
      { bookId: "ROM", chapter: 6, verseStart: 4, verseEnd: null, snippet: { pt: "Por isso, estamos sepultados com ele pelo batismo na morte;…", en: "We were buried therefore with him through baptism to death,…", es: "A través del bautismo fuimos sepultados con él en la…" } },
      { bookId: "1PE", chapter: 1, verseStart: 3, verseEnd: null, snippet: { pt: "Bendito seja o Deus e Pai de nosso Senhor Jesus…", en: "Blessed be the God and Father of our Lord Jesus…", es: "¡Alabado sea Dios, el Padre de nuestro Señor Jesucristo! Por…" } },
    ],
  },
  {
    id: "youth",
    names: { pt: "Jovens", en: "Youth", es: "Jóvenes" },
    passages: [
      { bookId: "ECC", chapter: 12, verseStart: 1, verseEnd: null, snippet: { pt: "Portanto lembra-te de teu Criador nos dias de tua juventude,…", en: "Remember also your Creator in the days of your youth,…", es: "Acuérdate de tu Creador mientras eres joven, antes de que…" } },
      { bookId: "PSA", chapter: 119, verseStart: 9, verseEnd: null, snippet: { pt: "Bete : Com que um rapaz purificará o seu caminho?…", en: "How can a young man keep his way pure? By…", es: "¿Cómo puede un joven mantenerse puro? Siguiendo tus enseñanzas." } },
      { bookId: "PRO", chapter: 3, verseStart: 5, verseEnd: 6, snippet: { pt: "Confia no SENHOR com todo o teu coração; e não…", en: "Trust in Yahweh with all your heart, and don’t lean…", es: "Pon tu confianza totalmente en el Señor, y no te…" } },
      { bookId: "JER", chapter: 29, verseStart: 11, verseEnd: null, snippet: { pt: "Porque eu sei os pensamentos que penso quanto a vós,…", en: "For I know the thoughts that I think toward you,…", es: "Yo sé lo que pienso hacer por ustedes, declara el…" } },
      { bookId: "1TI", chapter: 4, verseStart: 12, verseEnd: null, snippet: { pt: "Ninguém despreze a tua juventude, mas sê exemplo aos crentes,…", en: "Let no man despise your youth; but be an example…", es: "No permitas que nadie te menosprecie por ser joven. Sé…" } },
      { bookId: "1JN", chapter: 2, verseStart: 14, verseEnd: null, snippet: { pt: "Eu vos escrevi, pais, porque conheceis aquele que é desde…", en: "I have written to you, fathers, because you know him…", es: "Les escribo a ustedes, pequeñitos, porque ustedes conocen al Padre.…" } },
    ],
  },
  {
    id: "love",
    names: { pt: "Amor", en: "Love", es: "Amor" },
    passages: [
      { bookId: "JHN", chapter: 3, verseStart: 16, verseEnd: null, snippet: { pt: "Porque Deus amou ao mundo de tal maneira, que deu…", en: "For God so loved the world, that he gave his…", es: "Porque Dios amó al mundo, y lo hizo de esta…" } },
      { bookId: "1CO", chapter: 13, verseStart: 4, verseEnd: 7, snippet: { pt: "O amor é paciente, é bondoso; o amor não é…", en: "Love is patient and is kind; love doesn’t envy. Love…", es: "El amor es paciente y amable. El amor no es…" } },
      { bookId: "1JN", chapter: 4, verseStart: 7, verseEnd: 8, snippet: { pt: "Amados, nos amemos uns aos outros; porque o amor é…", en: "Beloved, let us love one another, for love is of…", es: "Queridos amigos, sigamos amándonos unos a otros, porque el amor…" } },
      { bookId: "ROM", chapter: 5, verseStart: 8, verseEnd: null, snippet: { pt: "Mas Deus prova o seu amor por nós através de…", en: "But God commends his own love toward us, in that…", es: "Pero Dios demuestra su amor en que Cristo murió por…" } },
      { bookId: "JHN", chapter: 13, verseStart: 34, verseEnd: 35, snippet: { pt: "Um novo mandamento vos dou: que vos ameis uns aos…", en: "A new commandment I give to you, that you love…", es: "Les estoy dando un nuevo mandato: ámense los unos a…" } },
      { bookId: "MAT", chapter: 22, verseStart: 37, verseEnd: 39, snippet: { pt: "E Jesus lhe respondeu: Amarás ao Senhor teu Deus com…", en: "Jesus said to him, “‘You shall love the Lord your…", es: "Jesús les dijo: “‘Ama al Señor tu Dios en todo…" } },
    ],
  },
  {
    id: "hope",
    names: { pt: "Esperança", en: "Hope", es: "Esperanza" },
    passages: [
      { bookId: "ROM", chapter: 15, verseStart: 13, verseEnd: null, snippet: { pt: "O Deus da esperança vos encha de toda alegria e…", en: "Now may the God of hope fill you with all…", es: "¡Que el Dios de esperanza los llene por completo de…" } },
      { bookId: "JER", chapter: 29, verseStart: 11, verseEnd: null, snippet: { pt: "Porque eu sei os pensamentos que penso quanto a vós,…", en: "For I know the thoughts that I think toward you,…", es: "Yo sé lo que pienso hacer por ustedes, declara el…" } },
      { bookId: "HEB", chapter: 6, verseStart: 19, verseEnd: null, snippet: { pt: "Temos essa esperança como uma segura e firme âncora da…", en: "This hope we have as an anchor of the soul,…", es: "Esta esperanza es nuestra ancla espiritual, es segura y confiable,…" } },
      { bookId: "ROM", chapter: 8, verseStart: 24, verseEnd: 25, snippet: { pt: "Pois fomos salvos na esperança. Ora, a esperança que se…", en: "For we were saved in hope, but hope that is…", es: "Sin embargo, la esperanza que ya ha sido vista no…" } },
      { bookId: "1PE", chapter: 1, verseStart: 3, verseEnd: null, snippet: { pt: "Bendito seja o Deus e Pai de nosso Senhor Jesus…", en: "Blessed be the God and Father of our Lord Jesus…", es: "¡Alabado sea Dios, el Padre de nuestro Señor Jesucristo! Por…" } },
      { bookId: "PSA", chapter: 42, verseStart: 11, verseEnd: null, snippet: { pt: "Por que estás abatida, minha alma? E por que te…", en: "Why are you in despair, my soul? Why are you…", es: "¿Por qué estoy tan desanimado? ¿Por qué me siento tan…" } },
    ],
  },
  {
    id: "peace",
    names: { pt: "Paz", en: "Peace", es: "Paz" },
    passages: [
      { bookId: "JHN", chapter: 14, verseStart: 27, verseEnd: null, snippet: { pt: "A paz vos deixo, minha paz vos dou; vou dá-…", en: "Peace I leave with you. My peace I give to…", es: "Yo les dejo paz; les estoy dando mi paz. La…" } },
      { bookId: "PHP", chapter: 4, verseStart: 7, verseEnd: null, snippet: { pt: "e a paz de Deus, que excede todo entendimento, guardará…", en: "And the peace of God, which surpasses all understanding, will…", es: "Entonces la paz que viene de Dios, que es mejor…" } },
      { bookId: "ISA", chapter: 26, verseStart: 3, verseEnd: null, snippet: { pt: "Tu guardarás em completa paz aquele que tem firme entendimento,…", en: "You will keep whoever’s mind is steadfast in perfect peace,…", es: "Mantendrás en completa paz a los que mantienen su mente…" } },
      { bookId: "ROM", chapter: 5, verseStart: 1, verseEnd: null, snippet: { pt: "Portanto, agora que somos justificados pela fé, tenhamos paz com…", en: "Being therefore justified by faith, we have peace with God…", es: "Ahora que hemos sido justificados por Dios, por nuestra confianza…" } },
      { bookId: "COL", chapter: 3, verseStart: 15, verseEnd: null, snippet: { pt: "E a paz de Cristo, para a qual também fostes…", en: "And let the peace of God rule in your hearts,…", es: "Que la paz de Cristo dirija sus pensamientos, porque ustedes…" } },
      { bookId: "NUM", chapter: 6, verseStart: 24, verseEnd: 26, snippet: { pt: "O SENHOR te abençoe, e te guarde:", en: "‘Yahweh bless you, and keep you.", es: "‘Que el Señor te bendiga y te cuide." } },
    ],
  },
  {
    id: "joy",
    names: { pt: "Alegria", en: "Joy", es: "Gozo" },
    passages: [
      { bookId: "PSA", chapter: 16, verseStart: 11, verseEnd: null, snippet: { pt: "Tu me farás conhecer o caminho da vida; fartura de…", en: "You will show me the path of life. In your…", es: "Me has mostrado el camino de la vida, me has…" } },
      { bookId: "PHP", chapter: 4, verseStart: 4, verseEnd: null, snippet: { pt: "Alegrai-vos sempre no Senhor. Volto a dizer: alegrai-vos.", en: "Rejoice in the Lord always! Again I will say, “Rejoice!", es: "Estén siempre felices en el Señor. Les repito: ¡estén felices!" } },
      { bookId: "NEH", chapter: 8, verseStart: 10, verseEnd: null, snippet: { pt: "E disse-lhes mais: Ide, comei gorduras, e bebei doçuras, e…", en: "Then he said to them, “Go your way. Eat the…", es: "Nehemías continuó diciendo: “Vayan y disfruten de buena comida y…" } },
      { bookId: "JHN", chapter: 15, verseStart: 11, verseEnd: null, snippet: { pt: "Estas coisas eu tenho vos dito para que minha alegria…", en: "I have spoken these things to you, that my joy…", es: "Les he explicado esto para que mi alegría esté en…" } },
      { bookId: "ROM", chapter: 15, verseStart: 13, verseEnd: null, snippet: { pt: "O Deus da esperança vos encha de toda alegria e…", en: "Now may the God of hope fill you with all…", es: "¡Que el Dios de esperanza los llene por completo de…" } },
      { bookId: "1PE", chapter: 1, verseStart: 8, verseEnd: null, snippet: { pt: "A ele, sem terdes visto, vós o amais. Ainda que…", en: "whom not having known you love; in whom, though now…", es: "Ustedes lo aman aunque nunca lo han visto. Aunque no…" } },
    ],
  },
  {
    id: "forgiveness",
    names: { pt: "Perdão", en: "Forgiveness", es: "Perdón" },
    passages: [
      { bookId: "1JN", chapter: 1, verseStart: 9, verseEnd: null, snippet: { pt: "Se confessarmos nossos pecados, ele é fiel e justo para…", en: "If we confess our sins, he is faithful and righteous…", es: "Pero si confesamos nuestros pecados, él es fiel y justo…" } },
      { bookId: "EPH", chapter: 4, verseStart: 32, verseEnd: null, snippet: { pt: "Em vez disso, sede benignos uns com os outros, misericordiosos,…", en: "And be kind to one another, tender hearted, forgiving each…", es: "Sean amables y compasivos unos con otros, perdonándose unos a…" } },
      { bookId: "MAT", chapter: 6, verseStart: 14, verseEnd: 15, snippet: { pt: "Porque se perdoardes às pessoas suas ofensas, vosso Pai celestial…", en: "For if you forgive men their trespasses, your heavenly Father…", es: "Porque si perdonan a quienes pecan contra ustedes, su Padre…" } },
      { bookId: "COL", chapter: 3, verseStart: 13, verseEnd: null, snippet: { pt: "Suportai-vos uns aos outros, e perdoai-vos uns aos outros, se…", en: "bearing with one another, and forgiving each other, if any…", es: "Sean pacientes unos con otros, perdonen a otros entre ustedes…" } },
      { bookId: "PSA", chapter: 103, verseStart: 12, verseEnd: null, snippet: { pt: "Assim como o oriente está longe do ocidente, assim também…", en: "As far as the east is from the west, so…", es: "Tan lejos como el este está del oeste es como…" } },
      { bookId: "LUK", chapter: 6, verseStart: 37, verseEnd: null, snippet: { pt: "Não julgueis, e não sereis julgados; não condeneis, e não…", en: "Don’t judge, and you won’t be judged. Don’t condemn, and…", es: "No juzguen, y ustedes tampoco serán juzgados; no condenen, y…" } },
    ],
  },
  {
    id: "repentance",
    names: { pt: "Arrependimento", en: "Repentance", es: "Arrepentimiento" },
    passages: [
      { bookId: "ACT", chapter: 3, verseStart: 19, verseEnd: null, snippet: { pt: "Arrependei-vos, pois, e convertei-vos, para que vosso pecados sejam apagados,…", en: "Repent therefore, and turn again, that your sins may be…", es: "Ahora, arrepiéntanse, y cambien sus caminos, para que sus pecados…" } },
      { bookId: "2CO", chapter: 7, verseStart: 10, verseEnd: null, snippet: { pt: "Pois a tristeza segundo a vontade de Deus opera arrependimento…", en: "For godly sorrow works repentance to salvation, which brings no…", es: "La tristeza que Dios quiere que sintamos es la que…" } },
      { bookId: "LUK", chapter: 15, verseStart: 7, verseEnd: null, snippet: { pt: "Digo-vos, que assim haverá mais alegria no céu por um…", en: "I tell you that even so there will be more…", es: "Les aseguro que hay más alegría en el cielo por…" } },
      { bookId: "ISA", chapter: 55, verseStart: 7, verseEnd: null, snippet: { pt: "Que o perverso deixe seu caminho, e o homem maligno…", en: "let the wicked forsake his way, and the unrighteous man…", es: "Los malvados deben cambiar sus costumbres y dejar de pensar…" } },
      { bookId: "PRO", chapter: 28, verseStart: 13, verseEnd: null, snippet: { pt: "Quem encobre suas transgressões nunca prosperará, mas aquele que as…", en: "He who conceals his sins doesn’t prosper, but whoever confesses…", es: "Los que ocultan sus pecados no prosperarán; pero los que…" } },
      { bookId: "ACT", chapter: 17, verseStart: 30, verseEnd: null, snippet: { pt: "Portanto Deus, tendo desconsiderado os tempos da vossa ignorância, agora…", en: "The times of ignorance therefore God overlooked. But now he…", es: "Dios pasó por alto la ignorancia de la gente en…" } },
    ],
  },
  {
    id: "holiness",
    names: { pt: "Santidade", en: "Holiness", es: "Santidad" },
    passages: [
      { bookId: "1PE", chapter: 1, verseStart: 15, verseEnd: 16, snippet: { pt: "Ao contrário; assim como aquele que vos chamou é santo,…", en: "but just as he who called you is holy, you…", es: "Ahora necesitan ser santos en todo lo que hagan, así…" } },
      { bookId: "HEB", chapter: 12, verseStart: 14, verseEnd: null, snippet: { pt: "Buscai a paz com todos, e a santificação, sem a…", en: "Follow after peace with all men, and the sanctification without…", es: "Esfuércense por estar en paz con todos y buscar la…" } },
      { bookId: "LEV", chapter: 19, verseStart: 2, verseEnd: null, snippet: { pt: "Fala a toda a congregação dos filhos de Israel, e…", en: "Speak to all the congregation of the children of Israel,…", es: "Dile a todos los israelitas: Sean santos porque yo soy…" } },
      { bookId: "2CO", chapter: 7, verseStart: 1, verseEnd: null, snippet: { pt: "Amados, por termos tais promessas, limpemo-nos de toda impureza da…", en: "Having therefore these promises, beloved, let us cleanse ourselves from…", es: "Queridos amigos, dado que tenemos estas promesas, limpiémonos de todo…" } },
      { bookId: "ROM", chapter: 12, verseStart: 1, verseEnd: null, snippet: { pt: "Rogo-vos, pois, irmãos, pelas misericórdias de Deus, que apresenteis os…", en: "Therefore I urge you, brothers, by the mercies of God,…", es: "Así que yo los animo, mis hermanos y hermanas, por…" } },
      { bookId: "1TH", chapter: 4, verseStart: 3, verseEnd: null, snippet: { pt: "Pois esta é a vontade de Deus: a vossa santificação,…", en: "For this is the will of God: your sanctification, that…", es: "Lo que Dios quiere es que vivan vidas santas. Así…" } },
    ],
  },
  {
    id: "holy-spirit",
    names: { pt: "Espírito Santo", en: "Holy Spirit", es: "Espíritu Santo" },
    passages: [
      { bookId: "JHN", chapter: 14, verseStart: 26, verseEnd: null, snippet: { pt: "Mas aquele Consolador, o Espírito Santo, ao qual o Pai…", en: "But the Counselor, the Holy Spirit, whom the Father will…", es: "Pero cuando el Padre envíe al Consolador, el Espíritu Santo,…" } },
      { bookId: "ACT", chapter: 1, verseStart: 8, verseEnd: null, snippet: { pt: "Mas vós recebereis poder do Espírito Santo, que virá sobre…", en: "But you will receive power when the Holy Spirit has…", es: "Pero recibirán poder cuando el Espíritu Santo descienda sobre ustedes,…" } },
      { bookId: "GAL", chapter: 5, verseStart: 22, verseEnd: 23, snippet: { pt: "Mas o fruto do Espírito é: amor, alegria, paz, paciência,…", en: "But the fruit of the Spirit is love, joy, peace,…", es: "Pero el fruto del Espíritu es amor, gozo, paz, paciencia,…" } },
      { bookId: "ROM", chapter: 8, verseStart: 26, verseEnd: null, snippet: { pt: "E da mesma maneira também o Espírito ajuda em nossas…", en: "In the same way, the Spirit also helps our weaknesses,…", es: "De la misma manera, el Espíritu nos ayuda en nuestra…" } },
      { bookId: "EPH", chapter: 5, verseStart: 18, verseEnd: null, snippet: { pt: "E não fiqueis bêbados com vinho, em que há devassidão,…", en: "Don’t be drunken with wine, in which is dissipation, but…", es: "No se emborrachen con vino, porque esto arruinará sus vidas,…" } },
      { bookId: "1CO", chapter: 12, verseStart: 4, verseEnd: 7, snippet: { pt: "E há variedade de dons, mas o Espírito é o…", en: "Now there are various kinds of gifts, but the same…", es: "Ahora, hay diferentes tipos de dones espirituales, pero provienen del…" } },
    ],
  },
  {
    id: "baptism",
    names: { pt: "Batismo", en: "Baptism", es: "Bautismo" },
    passages: [
      { bookId: "MAT", chapter: 28, verseStart: 19, verseEnd: null, snippet: { pt: "Portanto ide, fazei discípulos a todas as nações, batizando-os em…", en: "Go,and make disciples of all nations, baptizing them in the…", es: "Así que vayan y hagan discípulos entre la gente de…" } },
      { bookId: "ACT", chapter: 2, verseStart: 38, verseEnd: null, snippet: { pt: "E Pedro lhes disse: Arrependei-vos, e batize-se cada um de…", en: "Peter said to them, “Repent, and be baptized, every one…", es: "¡Arrepiéntanse!” les dijo Pedro. “Todos deben bautizarse en el nombre…" } },
      { bookId: "ROM", chapter: 6, verseStart: 3, verseEnd: 4, snippet: { pt: "Ou não sabeis que todos os que somos batizados em…", en: "Or don’t you know that all we who were baptized…", es: "¿No saben que todos los que fuimos bautizados en Jesucristo,…" } },
      { bookId: "GAL", chapter: 3, verseStart: 27, verseEnd: null, snippet: { pt: "pois todos vós que fostes batizados em Cristo já vos…", en: "For as many of you as were baptized into Christ…", es: "Todos los que de ustedes fueron bautizados en Cristo se…" } },
      { bookId: "MRK", chapter: 16, verseStart: 16, verseEnd: null, snippet: { pt: "Quem crer e for batizado será salvo; mas quem não…", en: "He who believes and is baptized will be saved; but…", es: "Todo el que crea y sea bautizado será salvo, pero…" } },
      { bookId: "1PE", chapter: 3, verseStart: 21, verseEnd: null, snippet: { pt: "Esta é uma representação do batismo, que agora também vos…", en: "This is a symbol of baptism, which now saves you—not…", es: "Esta agua simboliza el bautismo que los salva ahora, no…" } },
    ],
  },
  {
    id: "lords-supper",
    names: { pt: "Ceia do Senhor", en: "Lord's Supper", es: "Cena del Señor" },
    passages: [
      { bookId: "1CO", chapter: 11, verseStart: 23, verseEnd: 26, snippet: { pt: "Porque eu recebi do Senhor o que também vos entreguei;…", en: "For I received from the Lord that which also I…", es: "Pues yo he recibido del Señor lo que les enseñé:…" } },
      { bookId: "LUK", chapter: 22, verseStart: 19, verseEnd: 20, snippet: { pt: "E tomando o pão, e tendo agradecido a Deus ,partiu-o,…", en: "He took bread, and when he had given thanks, he…", es: "Luego tomó el pan, y después de haber dado gracias,…" } },
      { bookId: "MAT", chapter: 26, verseStart: 26, verseEnd: 28, snippet: { pt: "E enquanto comiam, Jesus tomou o pão, abençoou-o, e o…", en: "As they were eating, Jesus took bread, gave thanks for…", es: "Mientras comían, Jesús tomó del pan y lo bendijo. Entonces…" } },
      { bookId: "JHN", chapter: 6, verseStart: 53, verseEnd: 56, snippet: { pt: "Jesus, então, lhes disse: Em verdade, em verdade vos digo,…", en: "Jesus therefore said to them, “Most certainly I tell you,…", es: "Jesús les dijo: “Les diré la verdad, a menos que…" } },
      { bookId: "1CO", chapter: 10, verseStart: 16, verseEnd: null, snippet: { pt: "Por acaso o copo da bênção, que nós bendizemos, não…", en: "The cup of blessing which we bless, isn’t it a…", es: "Cuando damos gracias a Dios por la copa que usamos…" } },
    ],
  },
  {
    id: "second-coming",
    names: { pt: "Segunda vinda", en: "Second coming", es: "Segunda venida" },
    passages: [
      { bookId: "ACT", chapter: 1, verseStart: 11, verseEnd: null, snippet: { pt: "Os quais também disseram: Homens galileus, por que estais olhando…", en: "who also said, “You men of Galilee, why do you…", es: "Hombres de Galilea, ¿por qué están ahí parados mirando al…" } },
      { bookId: "1TH", chapter: 4, verseStart: 16, verseEnd: 17, snippet: { pt: "Pois o mesmo Senhor descerá do céu com grande aclamação,…", en: "For the Lord himself will descend from heaven with a…", es: "Pues el Señor mismo descenderá con grito de mando, con…" } },
      { bookId: "MAT", chapter: 24, verseStart: 30, verseEnd: 31, snippet: { pt: "Então aparecerá no céu o sinal do Filho do homem.…", en: "and then the sign of the Son of Man will…", es: "Entonces aparecerá en el cielo la señal del Hijo del…" } },
      { bookId: "REV", chapter: 22, verseStart: 12, verseEnd: null, snippet: { pt: "Eis que logo venho, e minha recompensa está comigo, para…", en: "Behold, I come quickly. My reward is with me, to…", es: "Yo vengo pronto, y traigo mi recompensa para dar a…" } },
      { bookId: "TIT", chapter: 2, verseStart: 13, verseEnd: null, snippet: { pt: "Aguardando a bem-aventurada esperança e o aparecimento da glória do…", en: "looking for the blessed hope and appearing of the glory…", es: "mientras aguardamos la maravillosa esperanza de la aparición gloriosa de…" } },
      { bookId: "JHN", chapter: 14, verseStart: 3, verseEnd: null, snippet: { pt: "E quando eu for, e vos preparar lugar, outra vez…", en: "If I go and prepare a place for you, I…", es: "Cuando me haya ido y haya preparado lugar para ustedes,…" } },
    ],
  },
  {
    id: "creation",
    names: { pt: "Criação", en: "Creation", es: "Creación" },
    passages: [
      { bookId: "GEN", chapter: 1, verseStart: 1, verseEnd: null, snippet: { pt: "No princípio criou Deus os céus e a terra.", en: "In the beginning, God created the heavens and the earth.", es: "En el principio, Dios creó los cielos y la tierra." } },
      { bookId: "PSA", chapter: 19, verseStart: 1, verseEnd: null, snippet: { pt: "Salmo de Davi, para o regente:Os céus declaram a glória…", en: "The heavens declare the glory of God. The expanse shows…", es: "Para el director del coro. Un salmo de David. Los…" } },
      { bookId: "JHN", chapter: 1, verseStart: 1, verseEnd: 3, snippet: { pt: "No princípio era a Palavra, e a Palavra estava junto…", en: "In the beginning was the Word, and the Word was…", es: "En el principio, la Palabra ya existía. La Palabra estaba…" } },
      { bookId: "COL", chapter: 1, verseStart: 16, verseEnd: null, snippet: { pt: "porque nele foram criadas todas as coisas que há nos…", en: "For by him all things were created, in the heavens…", es: "porque todo fue creado por medio de él, ya sea…" } },
      { bookId: "HEB", chapter: 11, verseStart: 3, verseEnd: null, snippet: { pt: "Pela fé entendemos que o universo foi aprontado pela palavra…", en: "By faith, we understand that the universe has been framed…", es: "Mediante nuestra fe en Dios comprendemos que todo el universo…" } },
      { bookId: "ISA", chapter: 40, verseStart: 28, verseEnd: null, snippet: { pt: "Por acaso não sabes, nem ouviste, que o eterno Deus,…", en: "Haven’t you known? Haven’t you heard? The everlasting God, Yahweh,…", es: "¿No lo sabes? ¿No has oído? El Señor es el…" } },
    ],
  },
  {
    id: "wisdom",
    names: { pt: "Sabedoria", en: "Wisdom", es: "Sabiduría" },
    passages: [
      { bookId: "PRO", chapter: 9, verseStart: 10, verseEnd: null, snippet: { pt: "O temor ao SENHOR é o princípio da sabedoria; e…", en: "The fear of Yahweh is the beginning of wisdom. The…", es: "El principio de la sabiduría es honrar a Dios. Y…" } },
      { bookId: "JAS", chapter: 1, verseStart: 5, verseEnd: null, snippet: { pt: "Se algum de vós tem falta de sabedoria, peça a…", en: "But if any of you lacks wisdom, let him ask…", es: "Si alguno de ustedes necesita sabiduría, pídala a Dios, que…" } },
      { bookId: "PRO", chapter: 3, verseStart: 5, verseEnd: 7, snippet: { pt: "Confia no SENHOR com todo o teu coração; e não…", en: "Trust in Yahweh with all your heart, and don’t lean…", es: "Pon tu confianza totalmente en el Señor, y no te…" } },
      { bookId: "1CO", chapter: 1, verseStart: 30, verseEnd: null, snippet: { pt: "Mas vós sois dele em Cristo Jesus, o qual, por…", en: "But of him, you are in Christ Jesus, who was…", es: "Es por él que ustedes viven en Jesucristo, a quien…" } },
      { bookId: "COL", chapter: 2, verseStart: 3, verseEnd: null, snippet: { pt: "Nele estão ocultos todos os tesouros da sabedoria e do…", en: "in whom are all the treasures of wisdom and knowledge…", es: "En él, podrán descubrir todas las riquezas de la sabiduría…" } },
      { bookId: "ECC", chapter: 12, verseStart: 13, verseEnd: null, snippet: { pt: "De tudo o que foi ouvido, a conclusão é: teme…", en: "This is the end of the matter. All has been…", es: "Resumiendo, ahora que se ha hablado de todo: Respeta a…" } },
    ],
  },
  {
    id: "money",
    names: { pt: "Dinheiro", en: "Money", es: "Dinero" },
    passages: [
      { bookId: "1TI", chapter: 6, verseStart: 10, verseEnd: null, snippet: { pt: "Pois o amor ao dinheiro é raiz de todos os…", en: "For the love of money is a root of all…", es: "Pues el deseo de ser ricos conduce a muchas clases…" } },
      { bookId: "MAT", chapter: 6, verseStart: 24, verseEnd: null, snippet: { pt: "Ninguém pode servir a dois senhores; pois ou odiará um…", en: "No one can serve two masters, for either he will…", es: "Nadie puede servir a dos amos. Odiarán a uno y…" } },
      { bookId: "HEB", chapter: 13, verseStart: 5, verseEnd: null, snippet: { pt: "A vossa maneira de viver seja sem ganância, contentando-vos com…", en: "Be free from the love of money, content with such…", es: "No amen el dinero. Estén contentos con lo que tienen.…" } },
      { bookId: "PRO", chapter: 3, verseStart: 9, verseEnd: null, snippet: { pt: "Honra ao SENHOR com teus bens, e com a primeira…", en: "Honor Yahweh with your substance, with the first fruits of…", es: "Honra al Señor con tu riqueza y con los primeros…" } },
      { bookId: "LUK", chapter: 12, verseStart: 15, verseEnd: null, snippet: { pt: "E disse-lhes: Olhai, e tomai cuidado com a ganância; porque…", en: "He said to them, “Beware! Keep yourselves from covetousness, for…", es: "Estén alerta, y cuídense de todo pensamiento y acción de…" } },
      { bookId: "MAL", chapter: 3, verseStart: 10, verseEnd: null, snippet: { pt: "Trazei todos os dízimos à casa do tesouro, para que…", en: "Bring the whole tithe into the storehouse, that there may…", es: "Traigan todo el diezmo a la tesorería para que haya…" } },
    ],
  },
  {
    id: "work",
    names: { pt: "Trabalho", en: "Work", es: "Trabajo" },
    passages: [
      { bookId: "COL", chapter: 3, verseStart: 23, verseEnd: null, snippet: { pt: "Tudo quanto fizerdes, fazei de coração, como para o Senhor,…", en: "And whatever you do, work heartily, as for the Lord,…", es: "Todo lo que tengan que hacer, háganlo bien, como si…" } },
      { bookId: "PRO", chapter: 14, verseStart: 23, verseEnd: null, snippet: { pt: "Em todo trabalho cansativo há proveito, mas o falar dos…", en: "In all hard work there is profit, but the talk…", es: "Hay recompensa en el trabajo arduo, pero el mucho hablar…" } },
      { bookId: "2TH", chapter: 3, verseStart: 10, verseEnd: null, snippet: { pt: "Porque, quando ainda estávamos convosco, isto vos mandamos: que se…", en: "For even when we were with you, we commanded you…", es: "Incluso cuando estuvimos con ustedes les dimos instrucciones estrictas de…" } },
      { bookId: "ECC", chapter: 9, verseStart: 10, verseEnd: null, snippet: { pt: "Tudo quanto vier à tua mão para fazer, faze conforme…", en: "Whatever your hand finds to do, do it with your…", es: "Todo lo que hagas, hazlo con todas tus fuerzas, porque…" } },
      { bookId: "GEN", chapter: 2, verseStart: 15, verseEnd: null, snippet: { pt: "Então o SENHOR Deus tomou o homem, e o pôs…", en: "Yahweh God took the man, and put him into the…", es: "El Señor Dios puso al hombre en el Jardín de…" } },
      { bookId: "1CO", chapter: 15, verseStart: 58, verseEnd: null, snippet: { pt: "Portanto, meus amados irmãos, sede firmes, imóveis e sempre abundantes…", en: "Therefore, my beloved brothers, be steadfast, immovable, always abounding in…", es: "Así que, mis queridos hermanos y hermanas: sean fuertes, permanezcan…" } },
    ],
  },
  {
    id: "suffering",
    names: { pt: "Sofrimento", en: "Suffering", es: "Sufrimiento" },
    passages: [
      { bookId: "ROM", chapter: 8, verseStart: 18, verseEnd: null, snippet: { pt: "Pois considero que as aflições deste tempo presente nem se…", en: "For I consider that the sufferings of this present time…", es: "Sin embargo, estoy convencido de que lo que sufrimos en…" } },
      { bookId: "1PE", chapter: 4, verseStart: 12, verseEnd: 13, snippet: { pt: "Amados, não estranheis o fogo ardente que vem sobre vós…", en: "Beloved, don’t be astonished at the fiery trial which has…", es: "Amigos míos, no se sorprendan ante las “pruebas de fuego”…" } },
      { bookId: "2CO", chapter: 4, verseStart: 17, verseEnd: null, snippet: { pt: "Porque nossa leve e momentânea aflição nos produz um peso…", en: "For our light affliction, which is for the moment, works…", es: "Estas tribulaciones triviales que tenemos, apenas duran un poco de…" } },
      { bookId: "JAS", chapter: 1, verseStart: 2, verseEnd: 4, snippet: { pt: "Meus irmãos, tende toda alegria quando vos encontrardes em várias…", en: "Count it all joy, my brothers, when you fall into…", es: "Amigos míos, elijan estar felices aun cuando se atraviesen todo…" } },
      { bookId: "PSA", chapter: 34, verseStart: 19, verseEnd: null, snippet: { pt: "Muitas são as adversidades do justo, mas o SENHOR o…", en: "Many are the afflictions of the righteous, but Yahweh delivers…", es: "Aquellos que hacen lo correcto tienen muchos problemas, pero el…" } },
      { bookId: "JHN", chapter: 16, verseStart: 33, verseEnd: null, snippet: { pt: "Estas coisas tenho vos dito para que tenhais paz em…", en: "I have told you these things, that in me you…", es: "Les he dicho todo esto a fin de que tengan…" } },
    ],
  },
  {
    id: "healing",
    names: { pt: "Cura", en: "Healing", es: "Sanidad" },
    passages: [
      { bookId: "ISA", chapter: 53, verseStart: 5, verseEnd: null, snippet: { pt: "Porém ele foi ferido por nossas transgressões, e esmagado por…", en: "But he was pierced for our transgressions. He was crushed…", es: "Pero fue herido por nuestros actos rebeldes, fue aplastado por…" } },
      { bookId: "JAS", chapter: 5, verseStart: 14, verseEnd: 15, snippet: { pt: "Alguém entre vós está doente? Chame os anciãos da igreja,…", en: "Is any among you sick? Let him call for the…", es: "¿Está alguno enfermo? Llamen a los ancianos de iglesia para…" } },
      { bookId: "PSA", chapter: 103, verseStart: 2, verseEnd: 3, snippet: { pt: "Louva ao SENHOR, ó minha alma; e não te esqueças…", en: "Praise Yahweh, my soul, and don’t forget all his benefits;", es: "Alaba, alma mía, al Señor; y que no olvide mi…" } },
      { bookId: "MAT", chapter: 8, verseStart: 16, verseEnd: 17, snippet: { pt: "Quando chegou o anoitecer, trouxeram-lhe muitos endemoninhados. Ele expulsou-lhes os…", en: "When evening came, they brought to him many possessed with…", es: "Cuando llegó la noche, trajeron ante Jesús a un hombre…" } },
      { bookId: "1PE", chapter: 2, verseStart: 24, verseEnd: null, snippet: { pt: "Ele levou nossos pecados em seu próprio corpo sobre o…", en: "who his own self bore our sins in his body…", es: "Tomó las consecuencias de nuestros pecados sobre sí mismo en…" } },
      { bookId: "EXO", chapter: 15, verseStart: 26, verseEnd: null, snippet: { pt: "E disse: Se ouvires atentamente a voz do SENHOR teu…", en: "and he said, “If you will diligently listen to Yahweh…", es: "Les dijo: “Si prestan atención a lo que dice el…" } },
    ],
  },
  {
    id: "fear",
    names: { pt: "Medo", en: "Fear", es: "Miedo" },
    passages: [
      { bookId: "ISA", chapter: 41, verseStart: 10, verseEnd: null, snippet: { pt: "Não temas, porque eu estou contigo; não te assombres, porque…", en: "Don’t you be afraid, for I am with you. Don’t…", es: "¡No tengan miedo, porque yo estoy con ustedes! No tengan…" } },
      { bookId: "2TI", chapter: 1, verseStart: 7, verseEnd: null, snippet: { pt: "Pois Deus não nos deu espírito de medo; mas sim…", en: "For God didn’t give us a spirit of fear, but…", es: "Dios no nos dio un espíritu de temor, sino un…" } },
      { bookId: "PSA", chapter: 27, verseStart: 1, verseEnd: null, snippet: { pt: "Salmo de Davi:O SENHOR é minha luz e minha salvação;…", en: "Yahweh is my light and my salvation. Whom shall I…", es: "Un Salmo de David. ¡El Señor es mi luz y…" } },
      { bookId: "JOS", chapter: 1, verseStart: 9, verseEnd: null, snippet: { pt: "Olha que te mando que te esforces e sejas valente:…", en: "Haven’t I commanded you? Be strong and courageous. Don’t be…", es: "No te olvides lo que te dije: ¡Sé fuerte! ¡Sé…" } },
      { bookId: "PSA", chapter: 23, verseStart: 4, verseEnd: null, snippet: { pt: "Ainda que eu venha a andar pelo vale da sombra…", en: "Even though I walk through the valley of the shadow…", es: "Incluso cuando camino por el valle oscuro de la muerte,…" } },
      { bookId: "1JN", chapter: 4, verseStart: 18, verseEnd: null, snippet: { pt: "No amor não há medo; pelo contrário, o perfeito amor…", en: "There is no fear in love; but perfect love casts…", es: "Donde hay amor no puede haber temor. Y Dios nos…" } },
    ],
  },
  {
    id: "temptation",
    names: { pt: "Tentação", en: "Temptation", es: "Tentación" },
    passages: [
      { bookId: "1CO", chapter: 10, verseStart: 13, verseEnd: null, snippet: { pt: "Nenhuma tentação vos veio, que não fosse humana; porém Deus…", en: "No temptation has taken you except what is common to…", es: "No experimentarán ninguna tentación más grande que la de ningún…" } },
      { bookId: "JAS", chapter: 1, verseStart: 13, verseEnd: 14, snippet: { pt: "Ninguém, quando for tentado, diga: “Sou tentado por Deus”; porque…", en: "Let no man say when he is tempted, “I am…", es: "Cuando alguien es tentado, no debe decir: “Estoy siendo tentado…" } },
      { bookId: "MAT", chapter: 26, verseStart: 41, verseEnd: null, snippet: { pt: "Vigiai e orai, para que não entreis em tentação. De…", en: "Watch and pray, that you don’t enter into temptation. The…", es: "Estén despiertos y oren, para que no caigan en tentación.…" } },
      { bookId: "HEB", chapter: 2, verseStart: 18, verseEnd: null, snippet: { pt: "Pois, naquilo em que ele mesmo sofreu ao ser tentado,…", en: "For in that he himself has suffered being tempted, he…", es: "Y como él mismo sufrió la tentación, puede ayudar a…" } },
      { bookId: "1PE", chapter: 5, verseStart: 8, verseEnd: 9, snippet: { pt: "Sede sóbrios! Vigiai! O vosso adversário, o diabo, anda ao…", en: "Be sober and self-controlled. Be watchful. Your adversary, the devil,…", es: "Sean responsables, y estén vigilantes. El diablo, su enemigo, anda…" } },
      { bookId: "PSA", chapter: 119, verseStart: 11, verseEnd: null, snippet: { pt: "Guardei a tua palavra em meu coração, para eu não…", en: "I have hidden your word in my heart, that I…", es: "En mi mente guardo tus enseñanzas para no pecar contra…" } },
    ],
  },
  {
    id: "humility",
    names: { pt: "Humildade", en: "Humility", es: "Humildad" },
    passages: [
      { bookId: "PHP", chapter: 2, verseStart: 3, verseEnd: 8, snippet: { pt: "Nada façais por rivalidade egoísta nem por vanglória; ao contrário,…", en: "doing nothing through rivalry or through conceit, but in humility,…", es: "No hagan ninguna cosa con un espíritu egoísta u orgulloso,…" } },
      { bookId: "JAS", chapter: 4, verseStart: 6, verseEnd: null, snippet: { pt: "Porém ele concede uma graça maior. Por isso diz: Deus…", en: "But he gives more grace. Therefore it says, “God resists…", es: "Pero Dios nos da todavía más gracia, como dice la…" } },
      { bookId: "MIC", chapter: 6, verseStart: 8, verseEnd: null, snippet: { pt: "Ele já declarou a ti, ó ser humano, o que…", en: "He has shown you, O man, what is good. What…", es: "Pueblo, el Señor te ha dicho lo que es bueno,…" } },
      { bookId: "1PE", chapter: 5, verseStart: 5, verseEnd: 6, snippet: { pt: "Semelhantemente vós, jovens, sede sujeitos aos anciãos; e todos vós…", en: "Likewise, you younger ones, be subject to the elder. Yes,…", es: "Jóvenes, hagan lo que los ancianos les dicen. Sin duda…" } },
      { bookId: "PRO", chapter: 22, verseStart: 4, verseEnd: null, snippet: { pt: "A recompensa da humildade e do temor ao SENHOR são…", en: "The result of humility and the fear of Yahweh is…", es: "Si eres humilde y respetas al Señor, tu recompense será…" } },
      { bookId: "MAT", chapter: 23, verseStart: 12, verseEnd: null, snippet: { pt: "E o que a si mesmo se exaltar será humilhado;…", en: "Whoever exalts himself will be humbled, and whoever humbles himself…", es: "Cualquiera que se enaltezca a sí mismo, será humillado, y…" } },
    ],
  },
  {
    id: "pride",
    names: { pt: "Orgulho", en: "Pride", es: "Orgullo" },
    passages: [
      { bookId: "PRO", chapter: 16, verseStart: 18, verseEnd: null, snippet: { pt: "Antes da destruição vem a arrogância, e antes da queda…", en: "Pride goes before destruction, and a haughty spirit before a…", es: "El orgullo lleva a la destrucción. Y un espíritu arrogante…" } },
      { bookId: "JAS", chapter: 4, verseStart: 6, verseEnd: null, snippet: { pt: "Porém ele concede uma graça maior. Por isso diz: Deus…", en: "But he gives more grace. Therefore it says, “God resists…", es: "Pero Dios nos da todavía más gracia, como dice la…" } },
      { bookId: "1PE", chapter: 5, verseStart: 5, verseEnd: null, snippet: { pt: "Semelhantemente vós, jovens, sede sujeitos aos anciãos; e todos vós…", en: "Likewise, you younger ones, be subject to the elder. Yes,…", es: "Jóvenes, hagan lo que los ancianos les dicen. Sin duda…" } },
      { bookId: "DAN", chapter: 4, verseStart: 37, verseEnd: null, snippet: { pt: "Agora eu, Nabucodonosor louvo, exalto e glorifico ao Rei do…", en: "Now I, Nebuchadnezzar, praise and extol and honor the King…", es: "Así que ahora yo, Nabucodonosor, alabo, honro y glorifico al…" } },
      { bookId: "PRO", chapter: 11, verseStart: 2, verseEnd: null, snippet: { pt: "Quando vem a arrogância, vem também a desonra; mas com…", en: "When pride comes, then comes shame, but with humility comes…", es: "El orgullo trae desgracia, pero la humildad trae sabiduría." } },
      { bookId: "ISA", chapter: 2, verseStart: 11, verseEnd: null, snippet: { pt: "Os olhos arrogantes dos homens serão abatidos, e o orgulho…", en: "The lofty looks of man will be brought low, the…", es: "Los que miran con arrogancia serán abatidos; los soberbios serán…" } },
    ],
  },
  {
    id: "anger",
    names: { pt: "Ira", en: "Anger", es: "Ira" },
    passages: [
      { bookId: "EPH", chapter: 4, verseStart: 26, verseEnd: 27, snippet: { pt: "Quando irardes, não pequeis; o sol não se ponha sobre…", en: "Be angry, and don’t sin.” Don’t let the sun go…", es: "No pequen por el enojo; no dejen que anochezca estando…" } },
      { bookId: "JAS", chapter: 1, verseStart: 19, verseEnd: 20, snippet: { pt: "Entendei isso , meus amados irmãos. Mas toda pessoa seja…", en: "So, then, my beloved brothers, let every man be swift…", es: "Recuerden esto, mis queridos amigos: todos deberían ser prontos para…" } },
      { bookId: "PRO", chapter: 15, verseStart: 1, verseEnd: null, snippet: { pt: "A resposta suave desvia o furor, mas a palavra pesada…", en: "A gentle answer turns away wrath, but a harsh word…", es: "Una respuesta amable evitará la ira, pero las palabras hirientes…" } },
      { bookId: "PSA", chapter: 37, verseStart: 8, verseEnd: null, snippet: { pt: "Detém a ira, abandona o furor; não te irrites de…", en: "Cease from anger, and forsake wrath. Don’t fret, it leads…", es: "¡Deja tu ira! ¡Deja ir tu enojo! ¡No te molestes,…" } },
      { bookId: "ECC", chapter: 7, verseStart: 9, verseEnd: null, snippet: { pt: "Não te apresses em teu espírito para te irares, porque…", en: "Don’t be hasty in your spirit to be angry, for…", es: "No te apresures a enojarte, porque la ira controla la…" } },
      { bookId: "COL", chapter: 3, verseStart: 8, verseEnd: null, snippet: { pt: "Mas agora, abandonai, vós também, todas estas coisas : a…", en: "but now you also put them all away: anger, wrath,…", es: "pero ahora deben abandonar tales cosas, como el enojo, la…" } },
    ],
  },
  {
    id: "patience",
    names: { pt: "Paciência", en: "Patience", es: "Paciencia" },
    passages: [
      { bookId: "ROM", chapter: 12, verseStart: 12, verseEnd: null, snippet: { pt: "Alegrai-vos na esperança. Sede pacientes na aflição. Perseverai na oração.", en: "rejoicing in hope; enduring in troubles; continuing steadfastly in prayer;", es: "Permanezcan alegres en la esperanza que tienen, soporten las pruebas…" } },
      { bookId: "JAS", chapter: 5, verseStart: 7, verseEnd: 8, snippet: { pt: "Portanto, irmãos, sede pacientes até a vinda do Senhor. Eis…", en: "Be patient therefore, brothers, until the coming of the Lord.…", es: "Amigos, sean pacientes y esperen el regreso del Señor. Consideren…" } },
      { bookId: "GAL", chapter: 5, verseStart: 22, verseEnd: null, snippet: { pt: "Mas o fruto do Espírito é: amor, alegria, paz, paciência,…", en: "But the fruit of the Spirit is love, joy, peace,…", es: "Pero el fruto del Espíritu es amor, gozo, paz, paciencia,…" } },
      { bookId: "PSA", chapter: 37, verseStart: 7, verseEnd: null, snippet: { pt: "Descansa no SENHOR, e espera nele; não te irrites contra…", en: "Rest in Yahweh, and wait patiently for him. Don’t fret…", es: "Mantente en la presencia de Dios y espera pacientemente en…" } },
      { bookId: "COL", chapter: 1, verseStart: 11, verseEnd: null, snippet: { pt: "capacitados em todo fortalecimento, segundo o poder da sua glória,…", en: "strengthened with all power, according to the might of his…", es: "Oramos para que sean poderosamente fortalecidos por su sublime fuerza,…" } },
      { bookId: "ECC", chapter: 7, verseStart: 8, verseEnd: null, snippet: { pt: "Melhor é o fim das coisas do que o princípio…", en: "Better is the end of a thing than its beginning.…", es: "Terminar algo es mejor que empezarlo. Ser paciente es mejor…" } },
    ],
  },
  {
    id: "kindness",
    names: { pt: "Bondade", en: "Kindness", es: "Bondad" },
    passages: [
      { bookId: "EPH", chapter: 4, verseStart: 32, verseEnd: null, snippet: { pt: "Em vez disso, sede benignos uns com os outros, misericordiosos,…", en: "And be kind to one another, tender hearted, forgiving each…", es: "Sean amables y compasivos unos con otros, perdonándose unos a…" } },
      { bookId: "COL", chapter: 3, verseStart: 12, verseEnd: null, snippet: { pt: "Por isso, como escolhidos de Deus, santos e amados, revesti-vos…", en: "Put on therefore, as God’s chosen ones, holy and beloved,…", es: "Siendo que ustedes son el pueblo especial de Dios, santo…" } },
      { bookId: "PRO", chapter: 3, verseStart: 3, verseEnd: null, snippet: { pt: "Que a bondade e a fidelidade não te desamparem; amarra-as…", en: "Don’t let kindness and truth forsake you. Bind them around…", es: "Aférrate a la bondad y a la verdad. Átalas a…" } },
      { bookId: "GAL", chapter: 5, verseStart: 22, verseEnd: null, snippet: { pt: "Mas o fruto do Espírito é: amor, alegria, paz, paciência,…", en: "But the fruit of the Spirit is love, joy, peace,…", es: "Pero el fruto del Espíritu es amor, gozo, paz, paciencia,…" } },
      { bookId: "ROM", chapter: 2, verseStart: 4, verseEnd: null, snippet: { pt: "Ou desprezas tu as riquezas de sua bondade, tolerância, e…", en: "Or do you despise the riches of his goodness, forbearance,…", es: "¿O es que menosprecias su maravillosa bondad y tolerancia, sin…" } },
      { bookId: "MIC", chapter: 6, verseStart: 8, verseEnd: null, snippet: { pt: "Ele já declarou a ti, ó ser humano, o que…", en: "He has shown you, O man, what is good. What…", es: "Pueblo, el Señor te ha dicho lo que es bueno,…" } },
    ],
  },
  {
    id: "service",
    names: { pt: "Serviço", en: "Service", es: "Servicio" },
    passages: [
      { bookId: "MRK", chapter: 10, verseStart: 45, verseEnd: null, snippet: { pt: "Porque também não veio o Filho do homem para ser…", en: "For the Son of Man also came not to be…", es: "Porque incluso el Hijo del hombre no vino para que…" } },
      { bookId: "GAL", chapter: 5, verseStart: 13, verseEnd: null, snippet: { pt: "Pois vós, irmãos, fostes chamados para a liberdade. Somente não…", en: "For you, brothers, were called for freedom. Only don’t use…", es: "¡Ustedes, mis hermanos y hermanas, fueron llamados para ser libres!…" } },
      { bookId: "1PE", chapter: 4, verseStart: 10, verseEnd: null, snippet: { pt: "Cada um sirva aos outros segundo o dom que recebeu,…", en: "As each has received a gift, employ it in serving…", es: "Cualquiera sea el don que hayan recibido, compártanlo con otros…" } },
      { bookId: "JHN", chapter: 13, verseStart: 14, verseEnd: 15, snippet: { pt: "Pois se eu, o Senhor, e o Mestre, tenho lavado…", en: "If I then, the Lord and the Teacher, have washed…", es: "Así que si yo, que soy su Maestro y su…" } },
      { bookId: "MAT", chapter: 20, verseStart: 26, verseEnd: 28, snippet: { pt: "Mas não é assim entre vós. Ao contrário, quem quiser…", en: "It shall not be so among you, but whoever desires…", es: "No será así para ustedes. Cualquiera entre ustedes que quiera…" } },
      { bookId: "JOS", chapter: 24, verseStart: 15, verseEnd: null, snippet: { pt: "E se mal vos parece servir ao SENHOR, escolhei hoje…", en: "If it seems evil to you to serve Yahweh, choose…", es: "Pero si no quieren adorar al Señor, ¡elijan hoy a…" } },
    ],
  },
  {
    id: "missions",
    names: { pt: "Missões", en: "Missions", es: "Misiones" },
    passages: [
      { bookId: "MAT", chapter: 28, verseStart: 18, verseEnd: 20, snippet: { pt: "Jesus se aproximou deles, e lhes falou: Todo o poder…", en: "Jesus came to them and spoke to them, saying, “All…", es: "Jesús vino donde ellos estaban y les dijo: “Se me…" } },
      { bookId: "ACT", chapter: 1, verseStart: 8, verseEnd: null, snippet: { pt: "Mas vós recebereis poder do Espírito Santo, que virá sobre…", en: "But you will receive power when the Holy Spirit has…", es: "Pero recibirán poder cuando el Espíritu Santo descienda sobre ustedes,…" } },
      { bookId: "ISA", chapter: 6, verseStart: 8, verseEnd: null, snippet: { pt: "Depois disso ouvi a voz do Senhor, que dizia: A…", en: "I heard the Lord’s voice, saying, “Whom shall I send,…", es: "Entonces oí al Señor preguntar: “¿A quién enviaré? ¿Quién irá…" } },
      { bookId: "ROM", chapter: 10, verseStart: 14, verseEnd: 15, snippet: { pt: "Mas como invocarão aquele em quem não creram? E como…", en: "How then will they call on him in whom they…", es: "Pero ¿cómo podrá la gente invocar a alguien en quien…" } },
      { bookId: "PSA", chapter: 96, verseStart: 3, verseEnd: null, snippet: { pt: "Contai sua glória por entre as nações, e suas maravilhas…", en: "Declare his glory among the nations, his marvelous works among…", es: "Proclamen sus actos de amor a las naciones, las maravillosas…" } },
      { bookId: "MRK", chapter: 16, verseStart: 15, verseEnd: null, snippet: { pt: "E disse-lhes: Ide por todo o mundo, pregai o Evangelho…", en: "He said to them, “Go into all the world, and…", es: "Entonces les dijo: “Vayan por todo el mundo, y anuncien…" } },
    ],
  },
  {
    id: "evangelism",
    names: { pt: "Evangelismo", en: "Evangelism", es: "Evangelismo" },
    passages: [
      { bookId: "MRK", chapter: 16, verseStart: 15, verseEnd: null, snippet: { pt: "E disse-lhes: Ide por todo o mundo, pregai o Evangelho…", en: "He said to them, “Go into all the world, and…", es: "Entonces les dijo: “Vayan por todo el mundo, y anuncien…" } },
      { bookId: "ROM", chapter: 1, verseStart: 16, verseEnd: null, snippet: { pt: "Porque não me envergonho do Evangelho, pois é o poder…", en: "For I am not ashamed of the Good News of…", es: "Sin lugar a dudas, no me avergüenzo de la buena…" } },
      { bookId: "1PE", chapter: 3, verseStart: 15, verseEnd: null, snippet: { pt: "Mas santificai a Cristo como Senhor em vossos corações; e…", en: "But sanctify the Lord God in your hearts; and always…", es: "solo tengan en su mente a Cristo como Señor. Estén…" } },
      { bookId: "2CO", chapter: 5, verseStart: 20, verseEnd: null, snippet: { pt: "Assim, pois, nós somos embaixadores da parte de Cristo, como…", en: "We are therefore ambassadors on behalf of Christ, as though…", es: "De modo que somos embajadores de Cristo, como si él…" } },
      { bookId: "ACT", chapter: 4, verseStart: 12, verseEnd: null, snippet: { pt: "E em nenhum outro há salvação; porque nenhum outro nome…", en: "There is salvation in none other, for neither is there…", es: "No hay salvación en ningún otro; no hay otro nombre…" } },
      { bookId: "MAT", chapter: 9, verseStart: 37, verseEnd: 38, snippet: { pt: "Então disse aos seus discípulos: Em verdade a colheita é…", en: "Then he said to his disciples, “The harvest indeed is…", es: "Entonces le dijo a sus discípulos, “la cosecha es grande,…" } },
    ],
  },
  {
    id: "discipleship",
    names: { pt: "Discipulado", en: "Discipleship", es: "Discipulado" },
    passages: [
      { bookId: "LUK", chapter: 9, verseStart: 23, verseEnd: null, snippet: { pt: "E dizia a todos: “Se alguém quer vir após mim,…", en: "He said to all, “If anyone desires to come after…", es: "Si alguno de ustedes quiere seguirme debe negarse así mismo,…" } },
      { bookId: "MAT", chapter: 28, verseStart: 19, verseEnd: 20, snippet: { pt: "Portanto ide, fazei discípulos a todas as nações, batizando-os em…", en: "Go,and make disciples of all nations, baptizing them in the…", es: "Así que vayan y hagan discípulos entre la gente de…" } },
      { bookId: "JHN", chapter: 8, verseStart: 31, verseEnd: null, snippet: { pt: "Dizia, pois, Jesus aos judeus que criam nele: Se vós…", en: "Jesus therefore said to those Jews who had believed him,…", es: "Entonces Jesús le dijo a los judíos que creyeron en…" } },
      { bookId: "2TI", chapter: 2, verseStart: 2, verseEnd: null, snippet: { pt: "E o que de mim ouviste entre muitas testemunhas, confia-o…", en: "The things which you have heard from me among many…", es: "Toma todo lo que me escuchaste decir delante de muchos…" } },
      { bookId: "MAT", chapter: 16, verseStart: 24, verseEnd: null, snippet: { pt: "Então Jesus disse a seus discípulos: Se alguém quiser vir…", en: "Then Jesus said to his disciples, “If anyone desires to…", es: "Entonces Jesús le dijo a sus discípulos: “El que quiera…" } },
      { bookId: "COL", chapter: 2, verseStart: 6, verseEnd: 7, snippet: { pt: "Portanto, assim como recebestes Cristo Jesus, o Senhor, assim também…", en: "As therefore you received Christ Jesus, the Lord, walk in…", es: "Así como aceptaron a Jesús como Señor, continúen siguiéndolo," } },
    ],
  },
  {
    id: "scripture",
    names: { pt: "Palavra de Deus", en: "Scripture", es: "Escritura" },
    passages: [
      { bookId: "2TI", chapter: 3, verseStart: 16, verseEnd: 17, snippet: { pt: "Toda a Escritura é divinamente inspirada e proveitosa para ensinar,…", en: "Every Scripture is God-breathed and profitable for teaching, for reproof,…", es: "Toda la Escritura inspirada por Dios es útil para enseñar,…" } },
      { bookId: "PSA", chapter: 119, verseStart: 105, verseEnd: null, snippet: { pt: "Nun :Tua palavra é lâmpada para meus pés e luz…", en: "Your word is a lamp to my feet, and a…", es: "Tu palabra es una lámpara que me muestra por dónde…" } },
      { bookId: "HEB", chapter: 4, verseStart: 12, verseEnd: null, snippet: { pt: "Porque a palavra de Deus é viva e eficaz, e…", en: "For the word of God is living, and active, and…", es: "Pues la palabra de Dios es viva y eficaz, y…" } },
      { bookId: "JOS", chapter: 1, verseStart: 8, verseEnd: null, snippet: { pt: "O livro desta lei nunca se apartará de tua boca:…", en: "This book of the law shall not depart out of…", es: "Sigue recordándole al pueblo la ley. Mediten en ella de…" } },
      { bookId: "PSA", chapter: 1, verseStart: 2, verseEnd: null, snippet: { pt: "Mas sim, que tem seu prazer na Lei do SENHOR;…", en: "but his delight is in Yahweh’s law. On his law…", es: "Sino que por el contrario aman obedecer la ley del…" } },
      { bookId: "MAT", chapter: 4, verseStart: 4, verseEnd: null, snippet: { pt: "Mas Jesus respondeu: Está escrito: Não só de pão viverá…", en: "But he answered, “It is written, ‘Man shall not live…", es: "Jesús respondió: “Como dicen las Escrituras, ‘los seres humanos no…" } },
    ],
  },
  {
    id: "worship",
    names: { pt: "Adoração", en: "Worship", es: "Adoración" },
    passages: [
      { bookId: "JHN", chapter: 4, verseStart: 23, verseEnd: 24, snippet: { pt: "Porém a hora vem, e agora é, quando os verdadeiros…", en: "But the hour comes, and now is, when the true…", es: "Pero viene el tiempo—y de hecho, ya llegó—cuando los adoradores…" } },
      { bookId: "PSA", chapter: 95, verseStart: 6, verseEnd: null, snippet: { pt: "Vinde, adoremos, e prostremo-nos; ajoelhemo-nos perante o SENHOR, que nos…", en: "Oh come, let’s worship and bow down. Let’s kneel before…", es: "Vengan, entremos y adoremos, arrodillémonos ante el Señor nuestro creador." } },
      { bookId: "ROM", chapter: 12, verseStart: 1, verseEnd: null, snippet: { pt: "Rogo-vos, pois, irmãos, pelas misericórdias de Deus, que apresenteis os…", en: "Therefore I urge you, brothers, by the mercies of God,…", es: "Así que yo los animo, mis hermanos y hermanas, por…" } },
      { bookId: "PSA", chapter: 29, verseStart: 2, verseEnd: null, snippet: { pt: "Reconhecei ao SENHOR a glória de seu nome; adorai ao…", en: "Ascribe to Yahweh the glory due to his name. Worship…", es: "Honren al Señor por su glorioso carácter, inclínense con reverencia…" } },
      { bookId: "HEB", chapter: 12, verseStart: 28, verseEnd: null, snippet: { pt: "Por isso, já que recebemos um Reino inabalável, mantenhamos a…", en: "Therefore, receiving a Kingdom that can’t be shaken, let us…", es: "Siendo que estamos recibiendo un reino inconmovible, tengamos una actitud…" } },
      { bookId: "REV", chapter: 4, verseStart: 11, verseEnd: null, snippet: { pt: "Digno és tu, Senhor, de receberes glória, honra e poder;…", en: "Worthy are you, our Lord and God, the Holy One,…", es: "Nuestro Señor y Dios, tú eres digno de gloria, honra…" } },
    ],
  },
  {
    id: "thanksgiving",
    names: { pt: "Gratidão", en: "Thanksgiving", es: "Gratitud" },
    passages: [
      { bookId: "1TH", chapter: 5, verseStart: 18, verseEnd: null, snippet: { pt: "Agradecei em tudo, pois essa é a vontade de Deus…", en: "In everything give thanks, for this is the will of…", es: "estén agradecidos en todas las situaciones, porque esto es lo…" } },
      { bookId: "PSA", chapter: 100, verseStart: 4, verseEnd: null, snippet: { pt: "Entrai pelas portas dele com agradecimento, por seus pátios com…", en: "Enter into his gates with thanksgiving, into his courts with…", es: "Entren por sus puertas con agradecimientos; ingresen a sus atrios…" } },
      { bookId: "COL", chapter: 3, verseStart: 17, verseEnd: null, snippet: { pt: "E tudo quanto fizerdes, por palavras ou por obras, fazei…", en: "Whatever you do, in word or in deed, do all…", es: "Todo lo que hagan, sea de palabra o de hecho,…" } },
      { bookId: "PHP", chapter: 4, verseStart: 6, verseEnd: null, snippet: { pt: "Não estejais ansiosos por coisa alguma; mas em tudo, por…", en: "In nothing be anxious, but in everything, by prayer and…", es: "No se preocupen por nada, sino oren a Dios por…" } },
      { bookId: "PSA", chapter: 107, verseStart: 1, verseEnd: null, snippet: { pt: "Agradecei ao SENHOR, porque ele é bom; porque sua bondade…", en: "Give thanks to Yahweh, for he is good, for his…", es: "¡Agradezcan al Señor, porque él es bueno! ¡Su misericordioso amor…" } },
      { bookId: "EPH", chapter: 5, verseStart: 20, verseEnd: null, snippet: { pt: "agradecendo sempre por tudo a Deus, o Pai, no nome…", en: "giving thanks always concerning all things in the name of…", es: "Siempre den gracias a Dios el Padre por todas las…" } },
    ],
  },
  {
    id: "fasting",
    names: { pt: "Jejum", en: "Fasting", es: "Ayuno" },
    passages: [
      { bookId: "MAT", chapter: 6, verseStart: 16, verseEnd: 18, snippet: { pt: "E quando jejuardes, não vos mostreis tristonhos, como os hipócritas;…", en: "Moreover when you fast, don’t be like the hypocrites, with…", es: "Cuando ayunen, no sean como los hipócritas que ponen caras…" } },
      { bookId: "ISA", chapter: 58, verseStart: 6, verseEnd: null, snippet: { pt: "Por acaso não é este o jejum que eu escolheria:…", en: "Isn’t this the fast that I have chosen: to release…", es: "No, este es el ayuno que yo quiero: libera a…" } },
      { bookId: "JOL", chapter: 2, verseStart: 12, verseEnd: null, snippet: { pt: "Por isso agora o SENHOR diz: Convertei-vos a mim com…", en: "Yet even now,” says Yahweh, “turn to me with all…", es: "Ahora pues”, dice el Señor, “Vengan a mi cuando aún…" } },
      { bookId: "ACT", chapter: 13, verseStart: 2, verseEnd: 3, snippet: { pt: "E tendo eles prestado serviço ao Senhor, e jejuado, o…", en: "As they served the Lord and fasted, the Holy Spirit…", es: "Mientras estaban adorando al Señor y ayunando, el Espíritu Santo…" } },
      { bookId: "EZR", chapter: 8, verseStart: 23, verseEnd: null, snippet: { pt: "Assim jejuamos, e pedimos isto a nosso Deus; e ele…", en: "So we fasted and begged our God for this: and…", es: "Así que ayunamos y pedimos a Dios que nos protegiera,…" } },
      { bookId: "LUK", chapter: 4, verseStart: 2, verseEnd: null, snippet: { pt: "E por quarenta dias foi tentado pelo diabo; e não…", en: "for forty days, being tempted by the devil. He ate…", es: "donde fue tentado por el diablo por cuarenta días. No…" } },
    ],
  },
  {
    id: "marriage",
    names: { pt: "Casamento", en: "Marriage", es: "Matrimonio" },
    passages: [
      { bookId: "GEN", chapter: 2, verseStart: 24, verseEnd: null, snippet: { pt: "Portanto, deixará o homem a seu pai e a sua…", en: "Therefore a man will leave his father and his mother,…", es: "Esta es la razón por la cual el hombre deja…" } },
      { bookId: "EPH", chapter: 5, verseStart: 25, verseEnd: 33, snippet: { pt: "Maridos, amai as vossas próprias esposas, assim como também Cristo…", en: "Husbands, love your wives, even as Christ also loved the…", es: "Esposos, amen a sus esposas de la misma manera que…" } },
      { bookId: "HEB", chapter: 13, verseStart: 4, verseEnd: null, snippet: { pt: "O matrimônio seja honrado entre todos, e o leito conjugal…", en: "Let marriage be held in honor among all, and let…", es: "Todos deben honrar el matrimonio. Los esposos y esposas deben…" } },
      { bookId: "MAT", chapter: 19, verseStart: 4, verseEnd: 6, snippet: { pt: "Porém ele respondeu: Não tendes lido que aquele que os…", en: "He answered, “Haven’t you read that he who made them…", es: "Jesús respondió: “¿No han leído que Dios, quien creó a…" } },
      { bookId: "1CO", chapter: 13, verseStart: 4, verseEnd: 7, snippet: { pt: "O amor é paciente, é bondoso; o amor não é…", en: "Love is patient and is kind; love doesn’t envy. Love…", es: "El amor es paciente y amable. El amor no es…" } },
      { bookId: "PRO", chapter: 18, verseStart: 22, verseEnd: null, snippet: { pt: "Quem encontrou esposa, encontrou o bem; e obteve o favor…", en: "Whoever finds a wife finds a good thing, and obtains…", es: "Si encuentras una esposa has hallado un bien, y serás…" } },
    ],
  },
  {
    id: "children",
    names: { pt: "Filhos", en: "Children", es: "Hijos" },
    passages: [
      { bookId: "PRO", chapter: 22, verseStart: 6, verseEnd: null, snippet: { pt: "Instrui ao menino em seu caminho, e até quando envelhecer,…", en: "Train up a child in the way he should go,…", es: "Enseña a los niños el modo correcto de vivir, y…" } },
      { bookId: "EPH", chapter: 6, verseStart: 1, verseEnd: 4, snippet: { pt: "Filhos, sede obedientes aos vossos pais no Senhor, porque isso…", en: "Children, obey your parents in the Lord, for this is…", es: "Hijos, hagan lo que sus padres les dicen, porque esto…" } },
      { bookId: "PSA", chapter: 127, verseStart: 3, verseEnd: 5, snippet: { pt: "Eis que os filhos são um presente do SENHOR; o…", en: "Behold, children are a heritage of Yahweh. The fruit of…", es: "Ciertamente los hijos son un regalo del Señor, porque la…" } },
      { bookId: "DEU", chapter: 6, verseStart: 6, verseEnd: 7, snippet: { pt: "E estas palavras que eu te mando hoje, estarão sobre…", en: "These words, which I command you this day, shall be…", es: "Las órdenes que les doy hoy deben permanecer en sus…" } },
      { bookId: "MRK", chapter: 10, verseStart: 14, verseEnd: null, snippet: { pt: "Porém Jesus, vendo, indignou-se, e lhe disse: Deixai vir as…", en: "But when Jesus saw it, he was moved with indignation,…", es: "Pero cuando Jesús vio lo que estaban haciendo, se molestó…" } },
      { bookId: "COL", chapter: 3, verseStart: 20, verseEnd: 21, snippet: { pt: "Filhos, obedecei em tudo aos pais, porque isso é agradável…", en: "Children, obey your parents in all things, for this pleases…", es: "Hijos, hagan siempre lo que sus padres dicen, porque esto…" } },
    ],
  },
  {
    id: "friendship",
    names: { pt: "Amizade", en: "Friendship", es: "Amistad" },
    passages: [
      { bookId: "PRO", chapter: 17, verseStart: 17, verseEnd: null, snippet: { pt: "O amigo ama em todo tempo, e o irmão nasce…", en: "A friend loves at all times; and a brother is…", es: "Un verdadero amigo estará siempre allí para amarte, y la…" } },
      { bookId: "PRO", chapter: 18, verseStart: 24, verseEnd: null, snippet: { pt: "O homem que tem amigos pode ser prejudicado por eles…", en: "A man of many companions may be ruined, but there…", es: "Algunos amigos te abandonarán, pero hay un amigo que estará…" } },
      { bookId: "ECC", chapter: 4, verseStart: 9, verseEnd: 10, snippet: { pt: "Dois são melhores do que um, porque eles têm melhor…", en: "Two are better than one, because they have a good…", es: "Dos son mejor que uno, pues pueden ayudarse mutuamente en…" } },
      { bookId: "JHN", chapter: 15, verseStart: 13, verseEnd: null, snippet: { pt: "Ninguém tem maior amor que este: que alguém ponha sua…", en: "Greater love has no one than this, that someone lay…", es: "No hay amor más grande que dar la vida por…" } },
      { bookId: "1SA", chapter: 18, verseStart: 1, verseEnd: null, snippet: { pt: "E assim que ele acabou de falar com Saul, a…", en: "When he had made an end of speaking to Saul,…", es: "Después de que David terminó de hablar con Saúl, Jonatán…" } },
      { bookId: "PRO", chapter: 27, verseStart: 17, verseEnd: null, snippet: { pt: "O ferro é afiado com ferro; assim também o homem…", en: "Iron sharpens iron; so a man sharpens his friend’s countenance.", es: "Una hoja de hierro se afila con una herramienta de…" } },
    ],
  },
  {
    id: "leadership",
    names: { pt: "Liderança", en: "Leadership", es: "Liderazgo" },
    passages: [
      { bookId: "MRK", chapter: 10, verseStart: 42, verseEnd: 45, snippet: { pt: "Mas Jesus, chamando-os a si, disse-lhes: Já sabeis que os…", en: "Jesus summoned them, and said to them, “You know that…", es: "Entonces Jesús reunió a los discípulos y les dijo: “Ustedes…" } },
      { bookId: "1TI", chapter: 3, verseStart: 1, verseEnd: 2, snippet: { pt: "Esta palavra é fiel: se alguém deseja ser bispo, deseja…", en: "This is a faithful saying: if a man seeks the…", es: "Esta es una declaración fiel: “Si alguno aspira a ser…" } },
      { bookId: "PRO", chapter: 11, verseStart: 14, verseEnd: null, snippet: { pt: "Quando não há conselhos sábios, o povo cai; mas na…", en: "Where there is no wise guidance, the nation falls, but…", es: "Sin una buena guía, la nación cae; pero la nación…" } },
      { bookId: "JOS", chapter: 1, verseStart: 6, verseEnd: 9, snippet: { pt: "Esforça-te e sê valente: porque tu repartirás a este povo…", en: "Be strong and courageous; for you shall cause this people…", es: "¡Sé fuerte! ¡Sé valiente! Serás el líder del pueblo mientras…" } },
      { bookId: "1PE", chapter: 5, verseStart: 2, verseEnd: 3, snippet: { pt: "Pastoreai o rebanho de Deus que está entre vós, não…", en: "Shepherd the flock of God which is among you, exercising…", es: "Cuiden del rebaño que se les ha encomendado, no porque…" } },
      { bookId: "EXO", chapter: 18, verseStart: 21, verseEnd: null, snippet: { pt: "Ademais busca dentre todo o povo homens de virtude, temerosos…", en: "Moreover you shall provide out of all the people able…", es: "Pero ahora debes elegir entre el pueblo hombres competentes, hombres…" } },
    ],
  },
  {
    id: "justice",
    names: { pt: "Justiça", en: "Justice", es: "Justicia" },
    passages: [
      { bookId: "MIC", chapter: 6, verseStart: 8, verseEnd: null, snippet: { pt: "Ele já declarou a ti, ó ser humano, o que…", en: "He has shown you, O man, what is good. What…", es: "Pueblo, el Señor te ha dicho lo que es bueno,…" } },
      { bookId: "AMO", chapter: 5, verseStart: 24, verseEnd: null, snippet: { pt: "Em vez disso, corra o juízo como as águas, e…", en: "But let justice roll on like rivers, and righteousness like…", es: "Prefiero hagan fluir la justicia como agua, y que hacer…" } },
      { bookId: "ISA", chapter: 1, verseStart: 17, verseEnd: null, snippet: { pt: "Aprendei a fazer o bem; procurai o que é justo;…", en: "Learn to do well. Seek justice. Relieve the oppressed. Judge…", es: "Aprendan a hacer el bien; luchen por la justicia, condenen…" } },
      { bookId: "PRO", chapter: 21, verseStart: 3, verseEnd: null, snippet: { pt: "Praticar justiça e juízo é mais aceitável ao SENHOR do…", en: "To do righteousness and justice is more acceptable to Yahweh…", es: "Hacer lo recto y justo agrada al Señor más que…" } },
      { bookId: "PSA", chapter: 89, verseStart: 14, verseEnd: null, snippet: { pt: "Justiça e juízo são a base de teu trono; bondade…", en: "Righteousness and justice are the foundation of your throne. Loving…", es: "Tu carácter de bondad y equidad son la base de…" } },
      { bookId: "MAT", chapter: 23, verseStart: 23, verseEnd: null, snippet: { pt: "Ai de vós, escribas e fariseus, hipócritas! Porque dais o…", en: "Woe to you, scribes and Pharisees, hypocrites! For you tithe…", es: "¡Qué desastre viene sobre ustedes, maestros religiosos y fariseos hipócritas!…" } },
    ],
  },
  {
    id: "the-poor",
    names: { pt: "Os pobres", en: "The poor", es: "Los pobres" },
    passages: [
      { bookId: "PRO", chapter: 19, verseStart: 17, verseEnd: null, snippet: { pt: "Quem faz misericórdia ao pobre empresta ao SENHOR; e ele…", en: "He who has pity on the poor lends to Yahweh;…", es: "Si eres bondadoso con el pobre, estarás prestándole al Señor,…" } },
      { bookId: "MAT", chapter: 25, verseStart: 35, verseEnd: 40, snippet: { pt: "Pois tive fome, e me destes de comer; tive sede,…", en: "for I was hungry, and you gave me food to…", es: "Porque tuve hambre y me dieron alimento para comer. Tuve…" } },
      { bookId: "JAS", chapter: 2, verseStart: 5, verseEnd: null, snippet: { pt: "Ouvi, meus amados irmãos: acaso Deus não escolheu os pobres…", en: "Listen, my beloved brothers. Didn’t God choose those who are…", es: "Escuchen, mis queridos amigos: ¿Acaso Dios no eligió a los…" } },
      { bookId: "ISA", chapter: 58, verseStart: 7, verseEnd: null, snippet: { pt: "Por acaso não é também que repartas teu pão com…", en: "Isn’t it to distribute your bread to the hungry, and…", es: "Comparte tu comida con los hambrientos, acoge en tu casa…" } },
      { bookId: "DEU", chapter: 15, verseStart: 11, verseEnd: null, snippet: { pt: "Porque não faltarão necessitados do meio da terra; por isso…", en: "For the poor will never cease out of the land.…", es: "Siempre habrá personas pobres y necesitadas entre ustedes, por eso…" } },
      { bookId: "LUK", chapter: 4, verseStart: 18, verseEnd: null, snippet: { pt: "O Espírito do Senhor está sobre mim, porque ele me…", en: "The Spirit of the Lord is on me, because he…", es: "El Espíritu del Señor está sobre mí, porque me ha…" } },
    ],
  },
  {
    id: "covenant",
    names: { pt: "Aliança", en: "Covenant", es: "Pacto" },
    passages: [
      { bookId: "GEN", chapter: 17, verseStart: 7, verseEnd: null, snippet: { pt: "E estabelecerei meu pacto entre mim e ti, e tua…", en: "I will establish my covenant between me and you and…", es: "Yo te prometo guardar mi pacto contigo, y con tus…" } },
      { bookId: "JER", chapter: 31, verseStart: 31, verseEnd: 33, snippet: { pt: "Eis que vêm dias,diz o SENHOR, em que farei um…", en: "Behold, the days come, says Yahweh, that I will make…", es: "¡Mira! Se acerca el momento, dice el Señor, en que…" } },
      { bookId: "HEB", chapter: 8, verseStart: 6, verseEnd: null, snippet: { pt: "Mas agora Jesus obteve um ofício mais relevante, como é…", en: "But now he has obtained a more excellent ministry, by…", es: "Pero a Jesús se le ha dado un ministerio mucho…" } },
      { bookId: "LUK", chapter: 22, verseStart: 20, verseEnd: null, snippet: { pt: "De modo semelhante também com o copo, depois da ceia,…", en: "Likewise, he took the cup after supper, saying, “This cup…", es: "De la misma manera, después de haber terminado de cenar,…" } },
      { bookId: "EXO", chapter: 19, verseStart: 5, verseEnd: null, snippet: { pt: "Agora pois, se deres ouvido à minha voz, e guardardes…", en: "Now therefore, if you will indeed obey my voice, and…", es: "Ahora bien, si realmente obedecen lo que digo y cumplen…" } },
      { bookId: "PSA", chapter: 89, verseStart: 34, verseEnd: null, snippet: { pt: "Não quebrarei o meu pacto, e o que saiu dos…", en: "I will not break my covenant, nor alter what my…", es: "No anularé el acuerdo que tengo con él; no alteraré…" } },
    ],
  },
  {
    id: "law-and-grace",
    names: { pt: "Lei e graça", en: "Law and grace", es: "Ley y gracia" },
    passages: [
      { bookId: "JHN", chapter: 1, verseStart: 17, verseEnd: null, snippet: { pt: "Porque a Lei foi dada por Moisés; a graça e…", en: "For the law was given through Moses. Grace and truth…", es: "La ley fue dada por medio de Moisés; pero la…" } },
      { bookId: "ROM", chapter: 6, verseStart: 14, verseEnd: null, snippet: { pt: "Pois o pecado não vos dominará, porque não estais sob…", en: "For sin will not have dominion over you. For you…", es: "El pecado no gobernará sobre ustedes, porque ustedes no están…" } },
      { bookId: "GAL", chapter: 3, verseStart: 24, verseEnd: 25, snippet: { pt: "Dessa maneira, a Lei foi nosso tutor em condução a…", en: "So that the law has become our tutor to bring…", es: "La ley fue nuestro guardián hasta que vino Cristo, para…" } },
      { bookId: "ROM", chapter: 3, verseStart: 20, verseEnd: 24, snippet: { pt: "Assim, ninguém será justificado diante dele pelas obras da Lei,…", en: "Because by the works of the law, no flesh will…", es: "Porque nadie es justificado ante Dios por hacer lo que…" } },
      { bookId: "GAL", chapter: 5, verseStart: 4, verseEnd: null, snippet: { pt: "Desligados estais de Cristo, vós que quereis ser justos pela…", en: "You are alienated from Christ, you who desire to be…", es: "Los que entre ustedes creen que pueden ser justificados por…" } },
      { bookId: "ROM", chapter: 8, verseStart: 1, verseEnd: 2, snippet: { pt: "Portanto, agora, nenhuma condenação há para os que estão em…", en: "There is therefore now no condemnation to those who are…", es: "Así que ahora no hay condenación para los que están…" } },
    ],
  },
  {
    id: "rest",
    names: { pt: "Descanso", en: "Rest", es: "Descanso" },
    passages: [
      { bookId: "MAT", chapter: 11, verseStart: 28, verseEnd: 30, snippet: { pt: "Vinde a mim todos vós que estais cansados e sobrecarregados,…", en: "Come to me, all you who labor and are heavily…", es: "Vengan a mí todos ustedes que luchan y están cargados.…" } },
      { bookId: "HEB", chapter: 4, verseStart: 9, verseEnd: 11, snippet: { pt: "Portanto, ainda resta um repouso como o do sábado para…", en: "There remains therefore a Sabbath rest for the people of…", es: "De modo que el reposo del Sábado todavía permanece para…" } },
      { bookId: "EXO", chapter: 20, verseStart: 8, verseEnd: 11, snippet: { pt: "Tu te lembrarás do dia do repouso, para santificá-lo:", en: "Remember the Sabbath day, to keep it holy.", es: "Recuerda el sábado para santificarlo." } },
      { bookId: "PSA", chapter: 23, verseStart: 2, verseEnd: null, snippet: { pt: "Ele me faz deitar em pastos verdes, e me leva…", en: "He makes me lie down in green pastures. He leads…", es: "Me da descanso en verdes pastos. Me guía a corrientes…" } },
      { bookId: "ISA", chapter: 30, verseStart: 15, verseEnd: null, snippet: { pt: "Pois assim diz o Senhor DEUS, o Santo de Israel:…", en: "For thus said the Lord Yahweh, the Holy One of…", es: "Esto es lo que el Señor Dios, el Santo de…" } },
      { bookId: "PSA", chapter: 62, verseStart: 1, verseEnd: null, snippet: { pt: "Salmo de Davi para o regente, conforme “Jedutum”:Certamente minha alma…", en: "My soul rests in God alone. My salvation is from…", es: "Para Jedutún, el director del coro. Un salmo de David.…" } },
    ],
  },
  {
    id: "death",
    names: { pt: "Morte", en: "Death", es: "Muerte" },
    passages: [
      { bookId: "PSA", chapter: 23, verseStart: 4, verseEnd: null, snippet: { pt: "Ainda que eu venha a andar pelo vale da sombra…", en: "Even though I walk through the valley of the shadow…", es: "Incluso cuando camino por el valle oscuro de la muerte,…" } },
      { bookId: "JHN", chapter: 11, verseStart: 25, verseEnd: 26, snippet: { pt: "Disse-lhe Jesus: Eu sou a ressurreição, e a vida; quem…", en: "Jesus said to her, “I am the resurrection and the…", es: "Jesús dijo: “Yo soy la resurrección y la vida. Aquellos…" } },
      { bookId: "1CO", chapter: 15, verseStart: 54, verseEnd: 57, snippet: { pt: "E quando este corpo se revestir da capacidade de não…", en: "But when this perishable body will have become imperishable, and…", es: "Cuando este cuerpo corruptible se haya vestido de un cuerpo…" } },
      { bookId: "PHP", chapter: 1, verseStart: 21, verseEnd: null, snippet: { pt: "Pois, para mim, o viver é Cristo, e o morrer…", en: "For to me to live is Christ, and to die…", es: "En lo que a mí concierne, el vivir es para…" } },
      { bookId: "ECC", chapter: 3, verseStart: 1, verseEnd: 2, snippet: { pt: "Para todas as coisas há um tempo determinado, e todo…", en: "For everything there is a season, and a time for…", es: "Todo tiene su propio tiempo. Hay una hora para todo…" } },
      { bookId: "REV", chapter: 21, verseStart: 4, verseEnd: null, snippet: { pt: "E Deus limpará toda lágrima dos olhos deles; e não…", en: "He will wipe away from them every tear from their…", es: "El enjugará toda lágrima de sus ojos, y la muerte…" } },
    ],
  },
  {
    id: "heaven",
    names: { pt: "Céu", en: "Heaven", es: "Cielo" },
    passages: [
      { bookId: "JHN", chapter: 14, verseStart: 2, verseEnd: 3, snippet: { pt: "Na casa de meu Pai há muitas moradas; senão, eu…", en: "In my Father’s house are many homes. If it weren’t…", es: "En la casa de mi Padre hay espacio suficiente. Si…" } },
      { bookId: "REV", chapter: 21, verseStart: 3, verseEnd: 4, snippet: { pt: "E eu ouvi uma grande voz do céu, dizendo: “Eis…", en: "I heard a loud voice out of heaven saying, “Behold,…", es: "Escuché una voz fuerte que salía del trono y decía:…" } },
      { bookId: "PHP", chapter: 3, verseStart: 20, verseEnd: null, snippet: { pt: "Mas nós somos cidadãos dos céus, de onde também esperamos…", en: "For our citizenship is in heaven, from where we also…", es: "Pero nuestra patria es el cielo, y esperamos un salvador,…" } },
      { bookId: "2CO", chapter: 5, verseStart: 1, verseEnd: null, snippet: { pt: "Porque sabemos que, se nossa casa terrestre deste tabernáculo se…", en: "For we know that if the earthly house of our…", es: "Sabemos que cuando esta “tienda de campaña” terrenal en la…" } },
      { bookId: "MAT", chapter: 6, verseStart: 20, verseEnd: null, snippet: { pt: "Mas ajuntai para vós tesouros no céu, onde nem a…", en: "but lay up for yourselves treasures in heaven, where neither…", es: "En lugar de ello, ustedes deben acumular sus riquezas en…" } },
      { bookId: "1PE", chapter: 1, verseStart: 4, verseEnd: null, snippet: { pt: "E o resultado disso é uma herança incorruptível, incontaminável, e…", en: "to an incorruptible and undefiled inheritance that doesn’t fade away,…", es: "Esta herencia es eterna, y nunca se daña ni se…" } },
    ],
  },
  {
    id: "hell",
    names: { pt: "Inferno", en: "Hell", es: "Infierno" },
    passages: [
      { bookId: "MAT", chapter: 25, verseStart: 46, verseEnd: null, snippet: { pt: "E estes irão ao tormento eterno, porém os justos à…", en: "These will go away into eternal punishment, but the righteous…", es: "Ellos se irán a la condenación eterna, pero los justos…" } },
      { bookId: "REV", chapter: 20, verseStart: 14, verseEnd: 15, snippet: { pt: "E a morte e o Xeol foram lançados no lago…", en: "Death and Hades were thrown into the lake of fire.…", es: "Entonces la muerte y el Hades fueron arrojados al lago…" } },
      { bookId: "LUK", chapter: 16, verseStart: 23, verseEnd: 24, snippet: { pt: "E estando no Xeol em tormentos, ele levantou seus olhos,…", en: "In Hades, he lifted up his eyes, being in torment,…", es: "En el Hades, donde estaba atormentado, el hombre rico miró…" } },
      { bookId: "2TH", chapter: 1, verseStart: 8, verseEnd: 9, snippet: { pt: "Com labareda de fogo, vingando os que não conhecem a…", en: "giving vengeance to those who don’t know God, and to…", es: "y trayendo juicio sobre aquellos que rechazan a Dios y…" } },
      { bookId: "MAT", chapter: 10, verseStart: 28, verseEnd: null, snippet: { pt: "E não temais os que matam o corpo, mas não…", en: "Don’t be afraid of those who kill the body, but…", es: "No tengan miedo de aquellos que pueden matarlos físicamente, pero…" } },
      { bookId: "MRK", chapter: 9, verseStart: 43, verseEnd: null, snippet: { pt: "E se a tua mão te faz pecar, corta-a; melhor…", en: "If your hand causes you to stumble, cut it off.…", es: "Si una mano te hace pecar, ¡córtala! Es mejor entrar…" } },
    ],
  },
  {
    id: "resurrection",
    names: { pt: "Ressurreição", en: "Resurrection", es: "Resurrección" },
    passages: [
      { bookId: "1CO", chapter: 15, verseStart: 20, verseEnd: 22, snippet: { pt: "Mas de fato Cristo ressuscitou dos mortos, e foi feito…", en: "But now Christ has been raised from the dead. He…", es: "Pero Cristo fue levantado de los muertos, las primicias de…" } },
      { bookId: "JHN", chapter: 11, verseStart: 25, verseEnd: null, snippet: { pt: "Disse-lhe Jesus: Eu sou a ressurreição, e a vida; quem…", en: "Jesus said to her, “I am the resurrection and the…", es: "Jesús dijo: “Yo soy la resurrección y la vida. Aquellos…" } },
      { bookId: "ROM", chapter: 6, verseStart: 5, verseEnd: null, snippet: { pt: "Pois, se fomos unidos a ele na semelhança de sua…", en: "For if we have become united with him in the…", es: "Si hemos sido hechos uno con él, al morir como…" } },
      { bookId: "1TH", chapter: 4, verseStart: 14, verseEnd: null, snippet: { pt: "Pois, se cremos que Jesus morreu e ressuscitou, assim também…", en: "For if we believe that Jesus died and rose again,…", es: "Puesto que estamos convencidos de que Jesús murió y se…" } },
      { bookId: "DAN", chapter: 12, verseStart: 2, verseEnd: null, snippet: { pt: "E muitos dos que dormem no pó da terra ressuscitarão,…", en: "Many of those who sleep in the dust of the…", es: "Millones dormidos en la tierra en la muerte despertarán, unos…" } },
      { bookId: "PHP", chapter: 3, verseStart: 10, verseEnd: 11, snippet: { pt: "para eu conhecer a ele, assim como o poder de…", en: "that I may know him, and the power of his…", es: "¡Quiero conocerlo verdaderamente, y al poder de su resurrección, tener…" } },
    ],
  },
  {
    id: "identity",
    names: { pt: "Identidade em Cristo", en: "Identity in Christ", es: "Identidad en Cristo" },
    passages: [
      { bookId: "2CO", chapter: 5, verseStart: 17, verseEnd: null, snippet: { pt: "Portanto, se alguém está em Cristo, uma nova criatura é…", en: "Therefore if anyone is in Christ, he is a new…", es: "Por eso todo el que está en Cristo es un…" } },
      { bookId: "GAL", chapter: 2, verseStart: 20, verseEnd: null, snippet: { pt: "Já estou crucificado com Cristo. Estou vivendo não mais eu,…", en: "I have been crucified with Christ, and it is no…", es: "He sido justificado con Cristo, de modo que ya no…" } },
      { bookId: "EPH", chapter: 2, verseStart: 10, verseEnd: null, snippet: { pt: "Pois nós fomos feitos por ele, criados em Cristo Jesus…", en: "For we are his workmanship, created in Christ Jesus for…", es: "Somos el resultado de la obra de Dios, creados en…" } },
      { bookId: "1PE", chapter: 2, verseStart: 9, verseEnd: null, snippet: { pt: "Mas vós sois a geração escolhida, o sacerdócio real, a…", en: "But you are a chosen race, a royal priesthood, a…", es: "En cambio, ustedes son una familia elegida de manera especial,…" } },
      { bookId: "ROM", chapter: 8, verseStart: 16, verseEnd: 17, snippet: { pt: "O próprio Espírito dá testemunho com o nosso espírito de…", en: "The Spirit himself testifies with our spirit that we are…", es: "El Espíritu mismo está de acuerdo con nosotros en que…" } },
      { bookId: "COL", chapter: 3, verseStart: 3, verseEnd: null, snippet: { pt: "Pois já morrestes, e a vossa vida está escondida com…", en: "For you died, and your life is hidden with Christ…", es: "Ustedes ya murieron, y sus vidas están seguras con Cristo,…" } },
    ],
  },
  {
    id: "armor",
    names: { pt: "Armadura de Deus", en: "Armor of God", es: "Armadura de Dios" },
    passages: [
      { bookId: "EPH", chapter: 6, verseStart: 10, verseEnd: 18, snippet: { pt: "Por fim, fortalecei-vos no Senhor e na força do seu…", en: "Finally, be strong in the Lord, and in the strength…", es: "Por último, manténganse firmes en el Señor, y en su…" } },
      { bookId: "2CO", chapter: 10, verseStart: 4, verseEnd: null, snippet: { pt: "Porque as armas de nossa batalha não são carnais, mas…", en: "for the weapons of our warfare are not of the…", es: "Nuestras armas no son de este mundo, pero tenemos el…" } },
      { bookId: "1TH", chapter: 5, verseStart: 8, verseEnd: null, snippet: { pt: "Mas nós, que somos do dia, sejamos sóbrios, e nos…", en: "But let us, since we belong to the day, be…", es: "Pero como nosotros pertenecemos al día, debemos mantener nuestras mentes…" } },
      { bookId: "ROM", chapter: 13, verseStart: 12, verseEnd: null, snippet: { pt: "A noite está se acabando, e o dia, chegando. Deixemos,…", en: "The night is far gone, and the day is near.…", es: "¡La noche casi termina, el día casi está aquí! Así…" } },
      { bookId: "ISA", chapter: 59, verseStart: 17, verseEnd: null, snippet: { pt: "Pois ele se vestu de justiça como uma armadura, e…", en: "He put on righteousness as a breastplate, and a helmet…", es: "Se puso la integridad como coraza y el casco de…" } },
    ],
  },
  {
    id: "fruit",
    names: { pt: "Fruto do Espírito", en: "Fruit of the Spirit", es: "Fruto del Espíritu" },
    passages: [
      { bookId: "GAL", chapter: 5, verseStart: 22, verseEnd: 23, snippet: { pt: "Mas o fruto do Espírito é: amor, alegria, paz, paciência,…", en: "But the fruit of the Spirit is love, joy, peace,…", es: "Pero el fruto del Espíritu es amor, gozo, paz, paciencia,…" } },
      { bookId: "JHN", chapter: 15, verseStart: 4, verseEnd: 5, snippet: { pt: "Estai em mim, e eu em vós; como o ramo…", en: "Remain in me, and I in you. As the branch…", es: "Permanezcan en mí, y yo permaneceré en ustedes. Así como…" } },
      { bookId: "COL", chapter: 1, verseStart: 10, verseEnd: null, snippet: { pt: "para que possais andar dignamente diante do Senhor, agradando-lhe em…", en: "that you may walk worthily of the Lord, to please…", es: "De este modo, vivirán vidas que representen correctamente al Señor…" } },
      { bookId: "MAT", chapter: 7, verseStart: 16, verseEnd: 20, snippet: { pt: "Vós os conhecereis pelos seus frutos. Por acaso se colhem…", en: "By their fruits you will know them. Do you gather…", es: "Pueden reconocerlos por sus frutos. ¿Acaso las personas cosechan uvas…" } },
      { bookId: "EPH", chapter: 5, verseStart: 9, verseEnd: null, snippet: { pt: "(porque o fruto da luz consiste em toda bondade, justiça,…", en: "for the fruit of the Spirit is in all goodness…", es: "(y el fruto de la luz es todo lo bueno…" } },
    ],
  },
  {
    id: "gifts",
    names: { pt: "Dons espirituais", en: "Spiritual gifts", es: "Dones espirituales" },
    passages: [
      { bookId: "1CO", chapter: 12, verseStart: 4, verseEnd: 11, snippet: { pt: "E há variedade de dons, mas o Espírito é o…", en: "Now there are various kinds of gifts, but the same…", es: "Ahora, hay diferentes tipos de dones espirituales, pero provienen del…" } },
      { bookId: "ROM", chapter: 12, verseStart: 6, verseEnd: 8, snippet: { pt: "Temos, contudo, diferentes dons, segundo a graça que nos foi…", en: "Having gifts differing according to the grace that was given…", es: "Cada uno tiene dones diferentes, que varían conforme a la…" } },
      { bookId: "1PE", chapter: 4, verseStart: 10, verseEnd: null, snippet: { pt: "Cada um sirva aos outros segundo o dom que recebeu,…", en: "As each has received a gift, employ it in serving…", es: "Cualquiera sea el don que hayan recibido, compártanlo con otros…" } },
      { bookId: "EPH", chapter: 4, verseStart: 11, verseEnd: 12, snippet: { pt: "E ele mesmo deu uns como apóstolos, outros como profetas,…", en: "He gave some to be apostles; and some, prophets; and…", es: "Los dones que él dio fueron tantos que algunos pudieron…" } },
      { bookId: "1CO", chapter: 14, verseStart: 1, verseEnd: null, snippet: { pt: "Segui o amor, e desejai com zelo pelos dons espirituais;…", en: "Follow after love, and earnestly desire spiritual gifts, but especially…", es: "¡Hagan del amor su objetivo más importante! Pero también hagan…" } },
    ],
  },
  {
    id: "unity",
    names: { pt: "Unidade", en: "Unity", es: "Unidad" },
    passages: [
      { bookId: "PSA", chapter: 133, verseStart: 1, verseEnd: null, snippet: { pt: "Cântico dos degraus, de Davi:Vede como é bom e agradável…", en: "See how good and how pleasant it is for brothers…", es: "Un cántico de los peregrinos que van a Jerusalén. Un…" } },
      { bookId: "EPH", chapter: 4, verseStart: 3, verseEnd: 6, snippet: { pt: "Procurai guardar a unidade do Espírito pelo vínculo da paz.", en: "being eager to keep the unity of the Spirit in…", es: "Esfuércense por seguir siendo uno en el Espíritu mediante la…" } },
      { bookId: "JHN", chapter: 17, verseStart: 21, verseEnd: null, snippet: { pt: "Para que todos sejam um; como tu, Pai, em mim,…", en: "that they may all be one; even as you, Father,…", es: "Oro para que todos puedan ser uno, así como tú,…" } },
      { bookId: "1CO", chapter: 1, verseStart: 10, verseEnd: null, snippet: { pt: "Mas eu vos rogo, irmãos, pelo nome do nosso Senhor…", en: "Now I beg you, brothers, through the name of our…", es: "Hermanos y hermanas, les ruego en el nombre de nuestro…" } },
      { bookId: "PHP", chapter: 2, verseStart: 2, verseEnd: null, snippet: { pt: "completai a minha alegria: que penseis da mesma maneira, tenhais…", en: "make my joy full, by being like-minded, having the same…", es: "entonces completen mi alegría teniendo un mismo modo de pensar…" } },
      { bookId: "COL", chapter: 3, verseStart: 14, verseEnd: null, snippet: { pt: "E acima de tudo isto, revesti-vos do amor, que é…", en: "Above all these things, walk in love, which is the…", es: "Sobre todas las cosas, ámense unos a otros, que es…" } },
    ],
  },
  {
    id: "false-teaching",
    names: { pt: "Falso ensino", en: "False teaching", es: "Falsa enseñanza" },
    passages: [
      { bookId: "2TI", chapter: 4, verseStart: 3, verseEnd: 4, snippet: { pt: "Pois virá tempo em que não suportarão a sã doutrina;…", en: "For the time will come when they will not listen…", es: "Pues viene el tiempo cuando las personas no se interesarán…" } },
      { bookId: "MAT", chapter: 7, verseStart: 15, verseEnd: null, snippet: { pt: "Tende cuidado, com os falsos profetas, que vêm a vós…", en: "Beware of false prophets, who come to you in sheep’s…", es: "Tengan cuidado con los falsos profetas que vienen vestidos de…" } },
      { bookId: "1JN", chapter: 4, verseStart: 1, verseEnd: null, snippet: { pt: "Amados, não creiais em todo espírito, mas provai se os…", en: "Beloved, don’t believe every spirit, but test the spirits, whether…", es: "Queridos amigos, no confien en todos los espíritus, sino pruébenlos…" } },
      { bookId: "GAL", chapter: 1, verseStart: 8, verseEnd: null, snippet: { pt: "Porém, ainda que nós mesmos, ou um anjo do céu…", en: "But even though we, or an angel from heaven, should…", es: "Pero si alguno, incluso nosotros mismos, o incluso si un…" } },
      { bookId: "2PE", chapter: 2, verseStart: 1, verseEnd: null, snippet: { pt: "E também houve falsos profetas entre o povo, assim como…", en: "But false prophets also arose among the people, as false…", es: "Pero así como había falsos profetas entre el pueblo en…" } },
      { bookId: "ACT", chapter: 20, verseStart: 29, verseEnd: 30, snippet: { pt: "Porque isto eu sei, que depois de minha partida, entrarão…", en: "For I know that after my departure, vicious wolves will…", es: "Yo sé que después de marcharme vendrán lobos rapaces entre…" } },
    ],
  },
  {
    id: "persecution",
    names: { pt: "Perseguição", en: "Persecution", es: "Persecución" },
    passages: [
      { bookId: "2TI", chapter: 3, verseStart: 12, verseEnd: null, snippet: { pt: "E também todos os que querem viver devotamente em Cristo…", en: "Yes, and all who desire to live godly in Christ…", es: "Sin duda, todos los que quieren vivir una vida de…" } },
      { bookId: "MAT", chapter: 5, verseStart: 10, verseEnd: 12, snippet: { pt: "Benditos são os que sofrem perseguição por causa da justiça,…", en: "Blessed are those who have been persecuted for righteousness’ sake,…", es: "Benditos aquellos que son perseguidos por lo que es justo,…" } },
      { bookId: "JHN", chapter: 15, verseStart: 18, verseEnd: 20, snippet: { pt: "Se o mundo vos odeia, sabei que odiou a mim…", en: "If the world hates you, you know that it has…", es: "Si el mundo los odia, recuerden que ya me odió…" } },
      { bookId: "1PE", chapter: 4, verseStart: 14, verseEnd: null, snippet: { pt: "Se vós sois insultados por causa do nome de Cristo,…", en: "If you are insulted for the name of Christ, you…", es: "Si alguien los maldice en el nombre de Cristo, en…" } },
      { bookId: "ROM", chapter: 8, verseStart: 35, verseEnd: null, snippet: { pt: "Quem nos separará do amor de Cristo? A aflição, a…", en: "Who shall separate us from the love of Christ? Could…", es: "¿Quién puede separarnos del amor de Cristo? ¿Acaso la opresión,…" } },
      { bookId: "ACT", chapter: 14, verseStart: 22, verseEnd: null, snippet: { pt: "Confirmando os ânimos dos discípulos, e exortando-os para que permanecessem…", en: "confirming the souls of the disciples, exhorting them to continue…", es: "Entonces animaron a los creyentes a mantenerse firmes y a…" } },
    ],
  },
  {
    id: "courage",
    names: { pt: "Coragem", en: "Courage", es: "Valor" },
    passages: [
      { bookId: "JOS", chapter: 1, verseStart: 9, verseEnd: null, snippet: { pt: "Olha que te mando que te esforces e sejas valente:…", en: "Haven’t I commanded you? Be strong and courageous. Don’t be…", es: "No te olvides lo que te dije: ¡Sé fuerte! ¡Sé…" } },
      { bookId: "DEU", chapter: 31, verseStart: 6, verseEnd: null, snippet: { pt: "Esforçai-vos e tende ânimo; não temais, nem tenhais medo deles:…", en: "Be strong and courageous. Don’t be afraid or scared of…", es: "¡Sean fuertes! Sean valientes! No tengan miedo ni terror, porque…" } },
      { bookId: "PSA", chapter: 27, verseStart: 14, verseEnd: null, snippet: { pt: "Espera no SENHOR, esforça-te, e ele fortalecerá o teu coração;…", en: "Wait for Yahweh. Be strong, and let your heart take…", es: "¡Confía en el Señor! Confía, ¡Él te dará fuerza! ¡Confía…" } },
      { bookId: "1CO", chapter: 16, verseStart: 13, verseEnd: null, snippet: { pt: "Vigiai, ficai firmes na fé, sede corajosos, e vos esforçai.", en: "Watch! Stand firm in the faith! Be courageous! Be strong!", es: "Estén alerta. Manténganse firmes en su confianza en Dios. Tengan…" } },
      { bookId: "2TI", chapter: 1, verseStart: 7, verseEnd: null, snippet: { pt: "Pois Deus não nos deu espírito de medo; mas sim…", en: "For God didn’t give us a spirit of fear, but…", es: "Dios no nos dio un espíritu de temor, sino un…" } },
      { bookId: "ISA", chapter: 41, verseStart: 13, verseEnd: null, snippet: { pt: "Porque eu, o SENHOR teu Deus, te seguro pela tua…", en: "For I, Yahweh your God, will hold your right hand,…", es: "Porque yo, el Señor, te cogeré de la mano y…" } },
    ],
  },
  {
    id: "waiting",
    names: { pt: "Esperar em Deus", en: "Waiting on God", es: "Esperar en Dios" },
    passages: [
      { bookId: "ISA", chapter: 40, verseStart: 31, verseEnd: null, snippet: { pt: "Mas os que confiam no SENHOR renovarão as forças, subirão…", en: "But those who wait for Yahweh will renew their strength.…", es: "Pero los que confían en el Señor verán renovadas sus…" } },
      { bookId: "PSA", chapter: 27, verseStart: 14, verseEnd: null, snippet: { pt: "Espera no SENHOR, esforça-te, e ele fortalecerá o teu coração;…", en: "Wait for Yahweh. Be strong, and let your heart take…", es: "¡Confía en el Señor! Confía, ¡Él te dará fuerza! ¡Confía…" } },
      { bookId: "LAM", chapter: 3, verseStart: 25, verseEnd: 26, snippet: { pt: "Bom é o SENHOR para os que nele esperam, para…", en: "Yahweh is good to those who wait for him, to…", es: "El Señor es bueno con los que confían en él,…" } },
      { bookId: "PSA", chapter: 37, verseStart: 7, verseEnd: null, snippet: { pt: "Descansa no SENHOR, e espera nele; não te irrites contra…", en: "Rest in Yahweh, and wait patiently for him. Don’t fret…", es: "Mantente en la presencia de Dios y espera pacientemente en…" } },
      { bookId: "HAB", chapter: 2, verseStart: 3, verseEnd: null, snippet: { pt: "Pois a visão ainda é para um tempo determinado, mas…", en: "For the vision is yet for the appointed time, and…", es: "Porque la visión es para un tiempo futuro. Es sobre…" } },
      { bookId: "MIC", chapter: 7, verseStart: 7, verseEnd: null, snippet: { pt: "Eu, porém, observarei ao SENHOR, esperarei ao Deus de minha…", en: "But as for me, I will look to Yahweh. I…", es: "Pero en cuanto a mi, yo pongo mis ojos en…" } },
    ],
  },
  {
    id: "guidance",
    names: { pt: "Direção", en: "Guidance", es: "Guía" },
    passages: [
      { bookId: "PRO", chapter: 3, verseStart: 5, verseEnd: 6, snippet: { pt: "Confia no SENHOR com todo o teu coração; e não…", en: "Trust in Yahweh with all your heart, and don’t lean…", es: "Pon tu confianza totalmente en el Señor, y no te…" } },
      { bookId: "PSA", chapter: 32, verseStart: 8, verseEnd: null, snippet: { pt: "Eu te instruirei, e de ensinarei o caminho que deves…", en: "I will instruct you and teach you in the way…", es: "Yo te instruiré, enseñándote el camino a seguir. Te advertiré,…" } },
      { bookId: "ISA", chapter: 30, verseStart: 21, verseEnd: null, snippet: { pt: "E quando virardes para a direita ou para a esquerda,…", en: "and when you turn to the right hand, and when…", es: "Cuando caminen a la derecha o a la izquierda, oirán…" } },
      { bookId: "JHN", chapter: 16, verseStart: 13, verseEnd: null, snippet: { pt: "Porém quando vier aquele Espírito de verdade, ele vos guiará…", en: "However when he, the Spirit of truth, has come, he…", es: "Sin embargo, cuando el Espíritu de verdad venga, él les…" } },
      { bookId: "PSA", chapter: 119, verseStart: 105, verseEnd: null, snippet: { pt: "Nun :Tua palavra é lâmpada para meus pés e luz…", en: "Your word is a lamp to my feet, and a…", es: "Tu palabra es una lámpara que me muestra por dónde…" } },
      { bookId: "JAS", chapter: 1, verseStart: 5, verseEnd: null, snippet: { pt: "Se algum de vós tem falta de sabedoria, peça a…", en: "But if any of you lacks wisdom, let him ask…", es: "Si alguno de ustedes necesita sabiduría, pídala a Dios, que…" } },
    ],
  },
  {
    id: "promises",
    names: { pt: "Promessas", en: "Promises", es: "Promesas" },
    passages: [
      { bookId: "2CO", chapter: 1, verseStart: 20, verseEnd: null, snippet: { pt: "Porque todas as promessas nele são “sim”, e nele se…", en: "For however many are the promises of God, in him…", es: "No importa cuántas promesas Dios haya hecho, en Cristo la…" } },
      { bookId: "JOS", chapter: 21, verseStart: 45, verseEnd: null, snippet: { pt: "Não faltou palavra de todas as boas coisas que o…", en: "Nothing failed of any good thing which Yahweh had spoken…", es: "No faltó ni una sola de las cosas buenas que…" } },
      { bookId: "2PE", chapter: 1, verseStart: 4, verseEnd: null, snippet: { pt: "Pelas quais nos são dadas grandíssimas e preciosas promessas, para…", en: "by which he has granted to us his precious and…", es: "Por medio de estas promesas podemos participar de la naturaleza…" } },
      { bookId: "NUM", chapter: 23, verseStart: 19, verseEnd: null, snippet: { pt: "Deus não é homem, para que minta; nem filho de…", en: "God is not a man, that he should lie, nor…", es: "Dios no es un ser humano que mentiría. No es…" } },
      { bookId: "HEB", chapter: 10, verseStart: 23, verseEnd: null, snippet: { pt: "mantenhamos firme a esperança que declararmos ter, sem abalo algum,…", en: "let us hold fast the confession of our hope without…", es: "Así que aferrémonos a la esperanza de la cual les…" } },
      { bookId: "ROM", chapter: 4, verseStart: 21, verseEnd: null, snippet: { pt: "e teve plena certeza de que aquele que havia prometido…", en: "and being fully assured that what he had promised, he…", es: "Él estaba completamente convencido que Dios tenía el poder para…" } },
    ],
  },
  {
    id: "the-cross",
    names: { pt: "A cruz", en: "The cross", es: "La cruz" },
    passages: [
      { bookId: "1CO", chapter: 1, verseStart: 18, verseEnd: null, snippet: { pt: "Porque a palavra da cruz é loucura para os que…", en: "For the word of the cross is foolishness to those…", es: "Porque el mensaje de la cruz no tiene sentido para…" } },
      { bookId: "GAL", chapter: 6, verseStart: 14, verseEnd: null, snippet: { pt: "Mas longe de mim esteja me orgulhar, a não ser…", en: "But far be it from me to boast, except in…", es: "Ojalá yo nunca me jacte de nada, excepto en la…" } },
      { bookId: "LUK", chapter: 9, verseStart: 23, verseEnd: null, snippet: { pt: "E dizia a todos: “Se alguém quer vir após mim,…", en: "He said to all, “If anyone desires to come after…", es: "Si alguno de ustedes quiere seguirme debe negarse así mismo,…" } },
      { bookId: "ISA", chapter: 53, verseStart: 5, verseEnd: null, snippet: { pt: "Porém ele foi ferido por nossas transgressões, e esmagado por…", en: "But he was pierced for our transgressions. He was crushed…", es: "Pero fue herido por nuestros actos rebeldes, fue aplastado por…" } },
      { bookId: "COL", chapter: 2, verseStart: 14, verseEnd: null, snippet: { pt: "Ele riscou a certidão de nossa dívida em ordenanças, a…", en: "wiping out the handwriting in ordinances which was against us;…", es: "Él borró el registro de nuestras deudas conforme a la…" } },
      { bookId: "PHP", chapter: 2, verseStart: 8, verseEnd: null, snippet: { pt: "e, quando se encontrava em forma humana, ele humilhou a…", en: "And being found in human form, he humbled himself, becoming…", es: "Y al venir en forma humana, humillándose a sí mismo,…" } },
    ],
  },
  {
    id: "blood",
    names: { pt: "O sangue", en: "The blood", es: "La sangre" },
    passages: [
      { bookId: "HEB", chapter: 9, verseStart: 22, verseEnd: null, snippet: { pt: "Segundo a Lei, quase todas as coisas são purificadas com…", en: "According to the law, nearly everything is cleansed with blood,…", es: "Conforme a la ley ceremonial, casi todo se purificaba con…" } },
      { bookId: "1JN", chapter: 1, verseStart: 7, verseEnd: null, snippet: { pt: "Porém, se andamos na luz, como ele está na luz,…", en: "But if we walk in the light, as he is…", es: "Pero si vivimos en la luz, así como él está…" } },
      { bookId: "EPH", chapter: 1, verseStart: 7, verseEnd: null, snippet: { pt: "Nele temos a libertação pelo seu sangue, o perdão dos…", en: "in whom we have our redemption through his blood, the…", es: "A través de él obtenemos la salvación mediante su sangre,…" } },
      { bookId: "REV", chapter: 12, verseStart: 11, verseEnd: null, snippet: { pt: "E eles o venceram pelo sangue do Cordeiro, e pela…", en: "They overcame him because of the Lamb’s blood, and because…", es: "Ellos lo vencieron mediante la sangre del Cordero y por…" } },
      { bookId: "1PE", chapter: 1, verseStart: 18, verseEnd: 19, snippet: { pt: "e sabei que não foi por coisas destrutíveis, como prata…", en: "knowing that you were redeemed, not with corruptible things, with…", es: "Ya saben que no fueron liberados por su vana forma…" } },
      { bookId: "MAT", chapter: 26, verseStart: 28, verseEnd: null, snippet: { pt: "porque este é o meu sangue, o sangue do testamento,…", en: "for this is my blood of the new covenant, which…", es: "Porque esta es mi sangre del pacto, derramada por muchos…" } },
    ],
  },
  {
    id: "name-of-jesus",
    names: { pt: "O nome de Jesus", en: "The name of Jesus", es: "El nombre de Jesús" },
    passages: [
      { bookId: "PHP", chapter: 2, verseStart: 9, verseEnd: 11, snippet: { pt: "Por isso Deus também o exaltou supremamente, e lhe deu…", en: "Therefore God also highly exalted him, and gave to him…", es: "Por ello Dios lo colocó en la posición de mayor…" } },
      { bookId: "ACT", chapter: 4, verseStart: 12, verseEnd: null, snippet: { pt: "E em nenhum outro há salvação; porque nenhum outro nome…", en: "There is salvation in none other, for neither is there…", es: "No hay salvación en ningún otro; no hay otro nombre…" } },
      { bookId: "COL", chapter: 3, verseStart: 17, verseEnd: null, snippet: { pt: "E tudo quanto fizerdes, por palavras ou por obras, fazei…", en: "Whatever you do, in word or in deed, do all…", es: "Todo lo que hagan, sea de palabra o de hecho,…" } },
      { bookId: "JHN", chapter: 14, verseStart: 13, verseEnd: 14, snippet: { pt: "E tudo quanto pedirdes em meu nome, eu o farei;…", en: "Whatever you will ask in my name, that will I…", es: "Yo haré cualquier cosa que ustedes pidan en mi nombre,…" } },
      { bookId: "PRO", chapter: 18, verseStart: 10, verseEnd: null, snippet: { pt: "O nome do SENHOR é uma torre forte; o justo…", en: "Yahweh’s name is a strong tower: the righteous run to…", es: "El Señor es una torre protectora para los justos, bajo…" } },
      { bookId: "ACT", chapter: 3, verseStart: 6, verseEnd: null, snippet: { pt: "E Pedro disse: Prata e ouro eu não tenho; mas…", en: "But Peter said, “Silver and gold have I none, but…", es: "No tengo plata ni oro”, le dijo Pedro, “pero te…" } },
    ],
  },
  {
    id: "lordship",
    names: { pt: "Senhorio de Cristo", en: "Lordship of Christ", es: "Señorío de Cristo" },
    passages: [
      { bookId: "ROM", chapter: 10, verseStart: 9, verseEnd: null, snippet: { pt: "Pois, se com a tua boca declarares que Jesus é…", en: "that if you will confess with your mouth that Jesus…", es: "Porque si declaras que aceptas a Jesús como Señor, y…" } },
      { bookId: "PHP", chapter: 2, verseStart: 11, verseEnd: null, snippet: { pt: "e toda língua confesse que Jesus Cristo é o Senhor,…", en: "and that every tongue should confess that Jesus Christ is…", es: "y todos declararán que Jesucristo es Señor, para la gloria…" } },
      { bookId: "COL", chapter: 1, verseStart: 18, verseEnd: null, snippet: { pt: "E ele é a cabeça do corpo, da Igreja; ele…", en: "He is the head of the body, the assembly, who…", es: "Él también es la cabeza del cuerpo, que es la…" } },
      { bookId: "LUK", chapter: 6, verseStart: 46, verseEnd: null, snippet: { pt: "E por que me chamais: “Senhor!”, “Senhor!”, e não fazeis…", en: "Why do you call me, ‘Lord, Lord,’ and don’t do…", es: "¿Por qué, entonces, se molestan en llamarme ‘Señor, Señor,’ si…" } },
      { bookId: "ACT", chapter: 2, verseStart: 36, verseEnd: null, snippet: { pt: "Saiba então com certeza toda a casa de Israel, que…", en: "Let all the house of Israel therefore know certainly that…", es: "Ahora esté todo Israel convencido de esto: ¡Dios ha puesto…" } },
      { bookId: "REV", chapter: 19, verseStart: 16, verseEnd: null, snippet: { pt: "E ele tem sobre sua roupa e sobre sua coxa…", en: "He has on his garment and on his thigh a…", es: "Y sobre su túnica y en su muslo estaba escrito…" } },
    ],
  },
  {
    id: "obedience",
    names: { pt: "Obediência", en: "Obedience", es: "Obediencia" },
    passages: [
      { bookId: "JHN", chapter: 14, verseStart: 15, verseEnd: null, snippet: { pt: "Se me amais, guardai meus mandamentos.", en: "If you love me, keep my commandments.", es: "Si ustedes me aman, guardarán mis mandamientos." } },
      { bookId: "1SA", chapter: 15, verseStart: 22, verseEnd: null, snippet: { pt: "E Samuel disse: Tem o SENHOR tanto contentamento com os…", en: "Samuel said, “Has Yahweh as great delight in burnt offerings…", es: "¿Qué crees que prefiere el Señor? ¿Los holocaustos y los…" } },
      { bookId: "JAS", chapter: 1, verseStart: 22, verseEnd: null, snippet: { pt: "e sede praticantes da palavra, e não somente ouvintes, enganando…", en: "But be doers of the word, and not only hearers,…", es: "Hagan, más bien, lo que dice la palabra. No escuchen…" } },
      { bookId: "DEU", chapter: 5, verseStart: 33, verseEnd: null, snippet: { pt: "Andai em todo caminho que o SENHOR vosso Deus vos…", en: "You shall walk in all the way which Yahweh your…", es: "Sigue todos los caminos que el Señor tu Dios te…" } },
      { bookId: "LUK", chapter: 11, verseStart: 28, verseEnd: null, snippet: { pt: "Mas ele disse: Antes bem-aventurados os que ouvem a palavra…", en: "But he said, “On the contrary, blessed are those who…", es: "Pero Jesús dijo: “Más benditos aún son los que oyen…" } },
      { bookId: "1JN", chapter: 5, verseStart: 3, verseEnd: null, snippet: { pt: "Pois este é o amor de Deus: que guardemos os…", en: "For this is the love of God, that we keep…", es: "Amar a Dios quiere decir que seguimos sus mandamientos, y…" } },
    ],
  },
  {
    id: "faith-and-works",
    names: { pt: "Fé e obras", en: "Faith and works", es: "Fe y obras" },
    passages: [
      { bookId: "JAS", chapter: 2, verseStart: 17, verseEnd: 18, snippet: { pt: "Assim também a fé, se não tiver obras, é morta…", en: "Even so faith, if it has no works, is dead…", es: "Porque la fe basada en la confianza en Dios por…" } },
      { bookId: "EPH", chapter: 2, verseStart: 8, verseEnd: 10, snippet: { pt: "Porque pela graça sois salvos, por meio da fé; e…", en: "for by grace you have been saved through faith, and…", es: "Porque ustedes han sido salvos por gracia, por la fe…" } },
      { bookId: "MAT", chapter: 7, verseStart: 21, verseEnd: null, snippet: { pt: "Não é qualquer um que me diz: “Senhor, Senhor” que…", en: "Not everyone who says to me, ‘Lord, Lord,’ will enter…", es: "No todo el que me dice ‘Señor, Señor’ entrará al…" } },
      { bookId: "GAL", chapter: 5, verseStart: 6, verseEnd: null, snippet: { pt: "porque, em Cristo Jesus, nem a circuncisão nem a incircuncisão…", en: "For in Christ Jesus neither circumcision amounts to anything, nor…", es: "Porque en Cristo Jesús, ser circuncidado o no circuncidado no…" } },
      { bookId: "TIT", chapter: 3, verseStart: 8, verseEnd: null, snippet: { pt: "Esta palavra é fiel, e isto quero que insistas em…", en: "This saying is faithful, and concerning these things I desire…", es: "Puedes confiar en lo que te digo, y quiero que…" } },
      { bookId: "1JN", chapter: 3, verseStart: 18, verseEnd: null, snippet: { pt: "Filhinhos, amemos não de palavra, nem de língua, mas sim…", en: "My little children, let’s not love in word only, neither…", es: "Queridos amigos, no digamos que amamos solo con palabras, sino…" } },
    ],
  },
  {
    id: "confession",
    names: { pt: "Confissão", en: "Confession", es: "Confesión" },
    passages: [
      { bookId: "1JN", chapter: 1, verseStart: 9, verseEnd: null, snippet: { pt: "Se confessarmos nossos pecados, ele é fiel e justo para…", en: "If we confess our sins, he is faithful and righteous…", es: "Pero si confesamos nuestros pecados, él es fiel y justo…" } },
      { bookId: "JAS", chapter: 5, verseStart: 16, verseEnd: null, snippet: { pt: "Confessai as vossas culpas uns aos outros, e orai uns…", en: "Confess your offenses to one another, and pray for one…", es: "Admitan unos delante de otros los errores que han cometido,…" } },
      { bookId: "PRO", chapter: 28, verseStart: 13, verseEnd: null, snippet: { pt: "Quem encobre suas transgressões nunca prosperará, mas aquele que as…", en: "He who conceals his sins doesn’t prosper, but whoever confesses…", es: "Los que ocultan sus pecados no prosperarán; pero los que…" } },
      { bookId: "PSA", chapter: 32, verseStart: 5, verseEnd: null, snippet: { pt: "Eu reconheci meu pecado a ti, e não escondi minha…", en: "I acknowledged my sin to you. I didn’t hide my…", es: "Entonces confesé mis pecados a ti. No escondí los errores…" } },
      { bookId: "ROM", chapter: 10, verseStart: 9, verseEnd: 10, snippet: { pt: "Pois, se com a tua boca declarares que Jesus é…", en: "that if you will confess with your mouth that Jesus…", es: "Porque si declaras que aceptas a Jesús como Señor, y…" } },
      { bookId: "PSA", chapter: 51, verseStart: 1, verseEnd: 4, snippet: { pt: "Salmo de Davi, para o regente, quando o profeta Natã…", en: "Have mercy on me, God, according to your loving kindness.…", es: "Para el director del coro. Un salmo de David. Cuando…" } },
    ],
  },
  {
    id: "new-life",
    names: { pt: "Nova vida", en: "New life", es: "Nueva vida" },
    passages: [
      { bookId: "2CO", chapter: 5, verseStart: 17, verseEnd: null, snippet: { pt: "Portanto, se alguém está em Cristo, uma nova criatura é…", en: "Therefore if anyone is in Christ, he is a new…", es: "Por eso todo el que está en Cristo es un…" } },
      { bookId: "ROM", chapter: 6, verseStart: 4, verseEnd: null, snippet: { pt: "Por isso, estamos sepultados com ele pelo batismo na morte;…", en: "We were buried therefore with him through baptism to death,…", es: "A través del bautismo fuimos sepultados con él en la…" } },
      { bookId: "EPH", chapter: 4, verseStart: 22, verseEnd: 24, snippet: { pt: "quanto ao comportamento passado, que deveis abandonar o velho ser…", en: "that you put away, as concerning your former way of…", es: "¡Entonces abandonen su antigua forma de vivir, y dejen esa…" } },
      { bookId: "JHN", chapter: 3, verseStart: 3, verseEnd: null, snippet: { pt: "Respondeu Jesus e disse-lhe: Em verdade, em verdade te digo,…", en: "Jesus answered him, “Most certainly, I tell you, unless one…", es: "Te digo la verdad” respondió Jesús, “A menos que vuelvas…" } },
      { bookId: "COL", chapter: 3, verseStart: 1, verseEnd: 3, snippet: { pt: "Portanto, se fostes ressuscitados com Cristo, buscai as coisas de…", en: "If then you were raised together with Christ, seek the…", es: "Así que si han sido traídos de regreso a la…" } },
      { bookId: "TIT", chapter: 3, verseStart: 5, verseEnd: null, snippet: { pt: "Não pelas obras de justiça que nós tivéssemos feito, mas…", en: "not by works of righteousness, which we did ourselves, but…", es: "no porque hubiésemos hecho algo bueno, sino por su misericordia.…" } },
    ],
  },
  {
    id: "light",
    names: { pt: "Luz", en: "Light", es: "Luz" },
    passages: [
      { bookId: "JHN", chapter: 8, verseStart: 12, verseEnd: null, snippet: { pt: "Falou-lhes pois Jesus outra vez, dizendo: Eu sou a luz…", en: "Again, therefore, Jesus spoke to them, saying, “I am the…", es: "Jesús habló una vez más al pueblo, diciéndoles: “Yo soy…" } },
      { bookId: "MAT", chapter: 5, verseStart: 14, verseEnd: 16, snippet: { pt: "Vós sois a luz do mundo; não se pode esconder…", en: "You are the light of the world. A city located…", es: "Ustedes son la luz del mundo. Una ciudad que está…" } },
      { bookId: "PSA", chapter: 119, verseStart: 105, verseEnd: null, snippet: { pt: "Nun :Tua palavra é lâmpada para meus pés e luz…", en: "Your word is a lamp to my feet, and a…", es: "Tu palabra es una lámpara que me muestra por dónde…" } },
      { bookId: "1JN", chapter: 1, verseStart: 5, verseEnd: 7, snippet: { pt: "E esta é a mensagem que dele ouvimos, e vos…", en: "This is the message which we have heard from him…", es: "Este es el mensaje que recibimos de él y que…" } },
      { bookId: "ISA", chapter: 9, verseStart: 2, verseEnd: null, snippet: { pt: "O povo que andava em trevas viu uma grande luz;…", en: "The people who walked in darkness have seen a great…", es: "El pueblo que camina en la oscuridad verá una luz…" } },
      { bookId: "EPH", chapter: 5, verseStart: 8, verseEnd: null, snippet: { pt: "Pois antes vós éreis trevas, mas agora sois luz no…", en: "For you were once darkness, but are now light in…", es: "En un tiempo ustedes estaban en tinieblas, pero ahora ustedes…" } },
    ],
  },
  {
    id: "truth",
    names: { pt: "Verdade", en: "Truth", es: "Verdad" },
    passages: [
      { bookId: "JHN", chapter: 8, verseStart: 32, verseEnd: null, snippet: { pt: "E conhecereis a verdade, e a verdade vos libertará.", en: "You will know the truth, and the truth will make…", es: "Conocerán la verdad y la verdad los hará libres”." } },
      { bookId: "JHN", chapter: 14, verseStart: 6, verseEnd: null, snippet: { pt: "Jesus lhe disse: Eu sou o caminho, e a verdade,…", en: "Jesus said to him, “I am the way, the truth,…", es: "Jesús respondió: “Yo soy el camino, la verdad y la…" } },
      { bookId: "JHN", chapter: 17, verseStart: 17, verseEnd: null, snippet: { pt: "Santifica-os em tua verdade; tua palavra é a verdade.", en: "Sanctify them in your truth. Your word is truth.", es: "Santifícalos por la verdad; tu palabra es verdad." } },
      { bookId: "EPH", chapter: 4, verseStart: 15, verseEnd: null, snippet: { pt: "Pelo contrário, sigamos a verdade em amor, e cresçamos em…", en: "but speaking truth in love, we may grow up in…", es: "sino que hablando la verdad en amor debemos crecer en…" } },
      { bookId: "PSA", chapter: 119, verseStart: 160, verseEnd: null, snippet: { pt: "O princípio de tua palavra é fiel, e o juízo…", en: "All of your words are truth. Every one of your…", es: "¡Tu palabra es verdad! Y todas tus leyes permanecerán para…" } },
      { bookId: "2TI", chapter: 2, verseStart: 15, verseEnd: null, snippet: { pt: "Procura apresentar-te aprovado a Deuscomo um trabalhador que não tem…", en: "Give diligence to present yourself approved by God, a workman…", es: "Esfuérzate arduamente en poder presentarte ante Dios y ser aprobado…" } },
    ],
  },
  {
    id: "mercy",
    names: { pt: "Misericórdia", en: "Mercy", es: "Misericordia" },
    passages: [
      { bookId: "LAM", chapter: 3, verseStart: 22, verseEnd: 23, snippet: { pt: "É pelas bondades do SENHOR que não somos consumidos, porque…", en: "It is because of Yahweh’s loving kindnesses that we are…", es: "Es por el amor fiel del Señor que nuestras vidas…" } },
      { bookId: "MIC", chapter: 6, verseStart: 8, verseEnd: null, snippet: { pt: "Ele já declarou a ti, ó ser humano, o que…", en: "He has shown you, O man, what is good. What…", es: "Pueblo, el Señor te ha dicho lo que es bueno,…" } },
      { bookId: "PSA", chapter: 103, verseStart: 8, verseEnd: null, snippet: { pt: "Misericordioso e piedoso é o SENHOR, que demora para se…", en: "Yahweh is merciful and gracious, slow to anger, and abundant…", es: "El Señor es amable y lleno de gracia, y no…" } },
      { bookId: "MAT", chapter: 5, verseStart: 7, verseEnd: null, snippet: { pt: "Benditos são os misericordiosos, porque eles alcançarão misericórdia.", en: "Blessed are the merciful, for they shall obtain mercy.", es: "Benditos aquellos que son misericordiosos, porque a ellos se les…" } },
      { bookId: "EPH", chapter: 2, verseStart: 4, verseEnd: 5, snippet: { pt: "Mas Deus, que é rico em misericórdia, pelo seu muito…", en: "But God, being rich in mercy, for his great love…", es: "Pero Dios, en su gran misericordia, por el maravilloso amor…" } },
      { bookId: "TIT", chapter: 3, verseStart: 5, verseEnd: null, snippet: { pt: "Não pelas obras de justiça que nós tivéssemos feito, mas…", en: "not by works of righteousness, which we did ourselves, but…", es: "no porque hubiésemos hecho algo bueno, sino por su misericordia.…" } },
    ],
  },
  {
    id: "compassion",
    names: { pt: "Compaixão", en: "Compassion", es: "Compasión" },
    passages: [
      { bookId: "COL", chapter: 3, verseStart: 12, verseEnd: null, snippet: { pt: "Por isso, como escolhidos de Deus, santos e amados, revesti-vos…", en: "Put on therefore, as God’s chosen ones, holy and beloved,…", es: "Siendo que ustedes son el pueblo especial de Dios, santo…" } },
      { bookId: "MAT", chapter: 9, verseStart: 36, verseEnd: null, snippet: { pt: "Quando ele viu as multidões, teve compaixão delas, porque andavam…", en: "But when he saw the multitudes, he was moved with…", es: "Cuando veía las multitudes, Jesús sentía gran compasión por ellos,…" } },
      { bookId: "PSA", chapter: 103, verseStart: 13, verseEnd: null, snippet: { pt: "Assim como um pai se compadece dos filhos, assim também…", en: "Like a father has compassion on his children, so Yahweh…", es: "Como un padre amoroso, el Señor es amable y compasivo…" } },
      { bookId: "1PE", chapter: 3, verseStart: 8, verseEnd: null, snippet: { pt: "E por fim, sede todos de uma mesma mentalidade, compassivos,…", en: "Finally, be all like-minded, compassionate, loving as brothers, tender hearted,…", es: "Finalmente, tengan todos un mismo propósito. Sean amables y amorosos…" } },
      { bookId: "LUK", chapter: 10, verseStart: 33, verseEnd: 37, snippet: { pt: "Porém um certo samaritano, que ia pelo caminho, veio junto…", en: "But a certain Samaritan, as he traveled, came where he…", es: "Finalmente pasó un samaritano. Cuando pasaba por allí, vio al…" } },
      { bookId: "EPH", chapter: 4, verseStart: 32, verseEnd: null, snippet: { pt: "Em vez disso, sede benignos uns com os outros, misericordiosos,…", en: "And be kind to one another, tender hearted, forgiving each…", es: "Sean amables y compasivos unos con otros, perdonándose unos a…" } },
    ],
  },
  {
    id: "integrity",
    names: { pt: "Integridade", en: "Integrity", es: "Integridad" },
    passages: [
      { bookId: "PRO", chapter: 10, verseStart: 9, verseEnd: null, snippet: { pt: "Aquele que anda em sinceridade anda seguro; mas o que…", en: "He who walks blamelessly walks surely, but he who perverts…", es: "Las personas honestas viven confiadas, pero los que se comportan…" } },
      { bookId: "PSA", chapter: 15, verseStart: 1, verseEnd: 2, snippet: { pt: "Salmo de Davi:SENHOR, quem morará em tua tenda? Quem habitará…", en: "Yahweh, who shall dwell in your sanctuary? Who shall live…", es: "Un Salmo de David. ¿Quién puede entrar en tu santuario,…" } },
      { bookId: "PRO", chapter: 11, verseStart: 3, verseEnd: null, snippet: { pt: "A integridade dos corretos os guia; mas a perversidade dos…", en: "The integrity of the upright shall guide them, but the…", es: "La honestidad es la guía de los que hacen el…" } },
      { bookId: "JOB", chapter: 2, verseStart: 3, verseEnd: null, snippet: { pt: "E o SENHOR disse a Satanás: Tendes visto meu servo…", en: "Yahweh said to Satan, “Have you considered my servant Job?…", es: "¿Te has fijado en mi siervo Job?” , le preguntó…" } },
      { bookId: "PSA", chapter: 25, verseStart: 21, verseEnd: null, snippet: { pt: "Integridade e justiça me guardem, porque eu espero em ti.", en: "Let integrity and uprightness preserve me, for I wait for…", es: "Que la integridad y la honestidad me defiendan, porque puse…" } },
      { bookId: "2CO", chapter: 8, verseStart: 21, verseEnd: null, snippet: { pt: "Procurando o que é honesto, não somente diante do Senhor,…", en: "Having regard for honorable things, not only in the sight…", es: "Nos interesa hacer las cosas de manera correcta, no solo…" } },
    ],
  },
  {
    id: "speech",
    names: { pt: "Palavras", en: "Speech", es: "Palabras" },
    passages: [
      { bookId: "EPH", chapter: 4, verseStart: 29, verseEnd: null, snippet: { pt: "Não saia de vossa boca palavra imoral; mas sim a…", en: "Let no corrupt speech proceed out of your mouth, but…", es: "No usen lenguaje sucio. Digan palabras que animen a las…" } },
      { bookId: "PRO", chapter: 18, verseStart: 21, verseEnd: null, snippet: { pt: "A morte e a vida estão no poder da língua;…", en: "Death and life are in the power of the tongue;…", es: "Tus palabras tienen el poder de traer vida o muerte;…" } },
      { bookId: "JAS", chapter: 3, verseStart: 5, verseEnd: 10, snippet: { pt: "Assim também a língua é um pequeno membro, mas se…", en: "So the tongue is also a little member, and boasts…", es: "Del mismo modo, la lengua es una parte del cuerpo…" } },
      { bookId: "PRO", chapter: 15, verseStart: 1, verseEnd: null, snippet: { pt: "A resposta suave desvia o furor, mas a palavra pesada…", en: "A gentle answer turns away wrath, but a harsh word…", es: "Una respuesta amable evitará la ira, pero las palabras hirientes…" } },
      { bookId: "COL", chapter: 4, verseStart: 6, verseEnd: null, snippet: { pt: "A vossa palavra seja sempre com graça, temperada com sal,…", en: "Let your speech always be with grace, seasoned with salt,…", es: "Tengan gracia al hablar. Asegúrense de hablar con buen gusto,…" } },
      { bookId: "MAT", chapter: 12, verseStart: 36, verseEnd: null, snippet: { pt: "Eu, porém, vos digo que de toda palavra imprudente que…", en: "I tell you that every idle word that men speak,…", es: "Yo les digo, ustedes tendrán que dar cuenta en el…" } },
    ],
  },
  {
    id: "purity",
    names: { pt: "Pureza", en: "Purity", es: "Pureza" },
    passages: [
      { bookId: "MAT", chapter: 5, verseStart: 8, verseEnd: null, snippet: { pt: "Benditos são os limpos de coração, porque eles verão a…", en: "Blessed are the pure in heart, for they shall see…", es: "Benditos son; los corazón puro, porque ellos verán a Dios." } },
      { bookId: "1TH", chapter: 4, verseStart: 3, verseEnd: 4, snippet: { pt: "Pois esta é a vontade de Deus: a vossa santificação,…", en: "For this is the will of God: your sanctification, that…", es: "Lo que Dios quiere es que vivan vidas santas. Así…" } },
      { bookId: "PSA", chapter: 51, verseStart: 10, verseEnd: null, snippet: { pt: "Cria em mim um coração puro, ó Deus; e renova…", en: "Create in me a clean heart, O God. Renew a…", es: "Crea en mí, oh Dios, un corazón puro, y hazme…" } },
      { bookId: "PHP", chapter: 4, verseStart: 8, verseEnd: null, snippet: { pt: "No restante, meus irmãos, tudo o que é verdadeiro, tudo…", en: "Finally, brothers, whatever things are true, whatever things are honorable,…", es: "Por último, piensen en todo lo que es verdadero, todo…" } },
      { bookId: "1TI", chapter: 4, verseStart: 12, verseEnd: null, snippet: { pt: "Ninguém despreze a tua juventude, mas sê exemplo aos crentes,…", en: "Let no man despise your youth; but be an example…", es: "No permitas que nadie te menosprecie por ser joven. Sé…" } },
      { bookId: "2TI", chapter: 2, verseStart: 22, verseEnd: null, snippet: { pt: "Foge também dos desejos da juventude; e segue a justiça,…", en: "Flee from youthful lusts; but pursue righteousness, faith, love, and…", es: "Huye de todo lo que incite tus deseos juveniles. Busca…" } },
    ],
  },
  {
    id: "contentment",
    names: { pt: "Contentamento", en: "Contentment", es: "Contentamiento" },
    passages: [
      { bookId: "PHP", chapter: 4, verseStart: 11, verseEnd: 13, snippet: { pt: "Não digo isso por causa de alguma necessidade, pois já…", en: "Not that I speak in respect to lack, for I…", es: "No les hablo de mis necesidades, porque ya he aprendido…" } },
      { bookId: "1TI", chapter: 6, verseStart: 6, verseEnd: 8, snippet: { pt: "Mas grande lucro é a devoção divina acompanhada de contentamento.", en: "But godliness with contentment is great gain.", es: "¡Pero conocer y seguir a Dios es tan satisfactorio!" } },
      { bookId: "HEB", chapter: 13, verseStart: 5, verseEnd: null, snippet: { pt: "A vossa maneira de viver seja sem ganância, contentando-vos com…", en: "Be free from the love of money, content with such…", es: "No amen el dinero. Estén contentos con lo que tienen.…" } },
      { bookId: "PRO", chapter: 30, verseStart: 8, verseEnd: null, snippet: { pt: "Afasta de mim a inutilidade e palavra mentirosa; e não…", en: "Remove far from me falsehood and lies. Give me neither…", es: "No dejes que sea falso, ayúdame a no decir mentiras.…" } },
      { bookId: "PSA", chapter: 23, verseStart: 1, verseEnd: null, snippet: { pt: "Salmo de Davi:O SENHOR é meu pastor, nada me faltará.", en: "Yahweh is my shepherd: I shall lack nothing.", es: "Un Salmo de David. El Señor es mi pastor, y…" } },
      { bookId: "LUK", chapter: 12, verseStart: 15, verseEnd: null, snippet: { pt: "E disse-lhes: Olhai, e tomai cuidado com a ganância; porque…", en: "He said to them, “Beware! Keep yourselves from covetousness, for…", es: "Estén alerta, y cuídense de todo pensamiento y acción de…" } },
    ],
  },
  {
    id: "generosity",
    names: { pt: "Generosidade", en: "Generosity", es: "Generosidad" },
    passages: [
      { bookId: "2CO", chapter: 9, verseStart: 6, verseEnd: 7, snippet: { pt: "Digo , porém isto, que o que semeia pouco, também…", en: "Remember this: he who sows sparingly will also reap sparingly.…", es: "Quisiera recordarles esto: Si siembran poco, cosecharán poco; pero si…" } },
      { bookId: "PRO", chapter: 11, verseStart: 24, verseEnd: 25, snippet: { pt: "Há quem dá generosamente e tem cada vez mais; e…", en: "There is one who scatters, and increases yet more. There…", es: "Si das con generosidad, recibirás más; pero si eres mezquino…" } },
      { bookId: "LUK", chapter: 6, verseStart: 38, verseEnd: null, snippet: { pt: "Dai, e será vos dado; medida boa, comprimida, sacudida e…", en: "Give, and it will be given to you: good measure,…", es: "den, y recibirán de vuelta con generosidad. ¡Cuando a ustedes…" } },
      { bookId: "ACT", chapter: 20, verseStart: 35, verseEnd: null, snippet: { pt: "Em tudo eu vos tenho mostrado que trabalhando assim, é…", en: "In all things I gave you an example, that so…", es: "Les he dado ejemplo en todo: trabajen para ayudar a…" } },
      { bookId: "MAL", chapter: 3, verseStart: 10, verseEnd: null, snippet: { pt: "Trazei todos os dízimos à casa do tesouro, para que…", en: "Bring the whole tithe into the storehouse, that there may…", es: "Traigan todo el diezmo a la tesorería para que haya…" } },
      { bookId: "1TI", chapter: 6, verseStart: 18, verseEnd: null, snippet: { pt: "que façam o bem, sejam ricos em boas obras, dispostos…", en: "that they do good, that they be rich in good…", es: "Díles que hagan el bien, y que se vuelvan ricos…" } },
    ],
  },
  {
    id: "fathers",
    names: { pt: "Pais", en: "Fathers", es: "Padres" },
    passages: [
      { bookId: "EPH", chapter: 6, verseStart: 4, verseEnd: null, snippet: { pt: "Pais, não provoqueis à ira os vossos filhos, mas criai-os…", en: "You fathers, don’t provoke your children to wrath, but nurture…", es: "Padres, no enojen a sus hijos, sino cuiden de ellos,…" } },
      { bookId: "PRO", chapter: 20, verseStart: 7, verseEnd: null, snippet: { pt: "O justo caminha em sua integridade; bem-aventurados serão seus filhos…", en: "A righteous man walks in integrity. Blessed are his children…", es: "El pueblo de Dios vive con honestidad. ¡Cuán felices son…" } },
      { bookId: "PSA", chapter: 103, verseStart: 13, verseEnd: null, snippet: { pt: "Assim como um pai se compadece dos filhos, assim também…", en: "Like a father has compassion on his children, so Yahweh…", es: "Como un padre amoroso, el Señor es amable y compasivo…" } },
      { bookId: "COL", chapter: 3, verseStart: 21, verseEnd: null, snippet: { pt: "Pais, não provoqueis aos vossos filhos, para que não percam…", en: "Fathers, don’t provoke your children, so that they won’t be…", es: "Padres, no hagan enojar a sus hijos, para que no…" } },
      { bookId: "DEU", chapter: 6, verseStart: 6, verseEnd: 7, snippet: { pt: "E estas palavras que eu te mando hoje, estarão sobre…", en: "These words, which I command you this day, shall be…", es: "Las órdenes que les doy hoy deben permanecer en sus…" } },
      { bookId: "PRO", chapter: 4, verseStart: 1, verseEnd: 4, snippet: { pt: "Ouvi, filhos, a correção do pai; e prestai atenção, para…", en: "Listen, sons, to a father’s instruction. Pay attention and know…", es: "Escuchen, hijos, la instrucción de un padre. Estén atentos al…" } },
    ],
  },
  {
    id: "mothers",
    names: { pt: "Mães", en: "Mothers", es: "Madres" },
    passages: [
      { bookId: "PRO", chapter: 31, verseStart: 26, verseEnd: 28, snippet: { pt: "Ela abre sua boca com sabedoria; e o ensinamento bondoso…", en: "She opens her mouth with wisdom. Faithful instruction is on…", es: "Ella habla con sabiduría, y es bondadosa al dar instrucciones." } },
      { bookId: "ISA", chapter: 66, verseStart: 13, verseEnd: null, snippet: { pt: "Tal como alguém a quem sua mãe consola, assim também…", en: "As one whom his mother comforts, so will I comfort…", es: "Como una madre que consuela a su hijo, yo te…" } },
      { bookId: "PRO", chapter: 1, verseStart: 8, verseEnd: 9, snippet: { pt: "Filho meu, ouve a instrução de teu pai; e não…", en: "My son, listen to your father’s instruction, and don’t forsake…", es: "Hijo mío, presta atención a la instrucción de tu padre,…" } },
      { bookId: "2TI", chapter: 1, verseStart: 5, verseEnd: null, snippet: { pt: "Trago à memória a fé não fingida que há em…", en: "having been reminded of the sincere faith that is in…", es: "En mi mente siempre está el recuerdo de tu fe…" } },
      { bookId: "PSA", chapter: 113, verseStart: 9, verseEnd: null, snippet: { pt: "Que faz a estéril habitar em família, como alegre mãe…", en: "He settles the barren woman in her home, as a…", es: "Alegra el hogar de la mujer estériles dándoles hijos. ¡Alaben…" } },
      { bookId: "EXO", chapter: 2, verseStart: 9, verseEnd: null, snippet: { pt: "À qual disse a filha de Faraó: Leva este menino,…", en: "Pharaoh’s daughter said to her, “Take this child away, and…", es: "Toma a este niño y amamántalo por mí”, le dijo…" } },
    ],
  },
  {
    id: "widows",
    names: { pt: "Viúvas", en: "Widows", es: "Viudas" },
    passages: [
      { bookId: "JAS", chapter: 1, verseStart: 27, verseEnd: null, snippet: { pt: "A religião pura e não contaminada para com Deus e…", en: "Pure religion and undefiled before our God and Father is…", es: "Ante los ojos de nuestro Dios y Padre, la religión…" } },
      { bookId: "1TI", chapter: 5, verseStart: 3, verseEnd: null, snippet: { pt: "Honra as viúvas que são verdadeiramente viúvas.", en: "Honor widows who are widows indeed.", es: "Ayuda a las viudas que no tienen familia." } },
      { bookId: "PSA", chapter: 68, verseStart: 5, verseEnd: null, snippet: { pt: "Ele é o pai dos órfãos, e juiz que defende…", en: "A father of the fatherless, and a defender of the…", es: "Él es el padre de los huérfanos y protector de…" } },
      { bookId: "DEU", chapter: 10, verseStart: 18, verseEnd: null, snippet: { pt: "Que faz justiça ao órfão e à viúva; que ama…", en: "He does execute justice for the fatherless and widow, and…", es: "Se asegura de que los huérfanos y las viudas reciban…" } },
      { bookId: "ISA", chapter: 1, verseStart: 17, verseEnd: null, snippet: { pt: "Aprendei a fazer o bem; procurai o que é justo;…", en: "Learn to do well. Seek justice. Relieve the oppressed. Judge…", es: "Aprendan a hacer el bien; luchen por la justicia, condenen…" } },
      { bookId: "ACT", chapter: 6, verseStart: 1, verseEnd: null, snippet: { pt: "Naqueles dias, ao se multiplicar o número de discípulos, houve…", en: "Now in those days, when the number of the disciples…", es: "Durante este tiempo, cuando el número de creyentes crecía rápidamente,…" } },
    ],
  },
  {
    id: "government",
    names: { pt: "Autoridades", en: "Government", es: "Autoridades" },
    passages: [
      { bookId: "ROM", chapter: 13, verseStart: 1, verseEnd: 4, snippet: { pt: "Toda pessoa esteja sujeita às autoridades superiores, porque não há…", en: "Let every soul be in subjection to the higher authorities,…", es: "Todos deben obedecer a las autoridades de gobierno, porque nadie…" } },
      { bookId: "1PE", chapter: 2, verseStart: 13, verseEnd: 17, snippet: { pt: "Sujeitai-vos a toda autoridade humana, por causa do Senhor; seja…", en: "Therefore subject yourselves to every ordinance of man for the…", es: "Obedezcan a la autoridad humana, por causa del Señor, ya…" } },
      { bookId: "1TI", chapter: 2, verseStart: 1, verseEnd: 2, snippet: { pt: "Por isso eu te exorto, antes de tudo, que se…", en: "I exhort therefore, first of all, that petitions, prayers, intercessions,…", es: "En primer lugar quiero animarte a orar por todos: haz…" } },
      { bookId: "PRO", chapter: 21, verseStart: 1, verseEnd: null, snippet: { pt: "Como ribeiros de águas é o coração do rei na…", en: "The king’s heart is in Yahweh’s hand like the watercourses.…", es: "El Señor dirige las decisiones del rey como si fuera…" } },
      { bookId: "TIT", chapter: 3, verseStart: 1, verseEnd: null, snippet: { pt: "Relembra-os para se sujeitarem aos governantes e às autoridades, sejam…", en: "Remind them to be in subjection to rulers and to…", es: "Recuérdales que deben seguir lo que los gobernantes les dicen,…" } },
      { bookId: "DAN", chapter: 2, verseStart: 21, verseEnd: null, snippet: { pt: "E ele é o que muda os tempos e as…", en: "He changes the times and the seasons; he removes kings,…", es: "Él está a cargo del tiempo y de la historia.…" } },
    ],
  },
  {
    id: "israel",
    names: { pt: "Israel", en: "Israel", es: "Israel" },
    passages: [
      { bookId: "GEN", chapter: 12, verseStart: 2, verseEnd: 3, snippet: { pt: "E farei de ti uma grande nação, e te abençoarei,…", en: "I will make of you a great nation. I will…", es: "Te convertiré en el predecesor de una gran nación y…" } },
      { bookId: "ROM", chapter: 11, verseStart: 1, verseEnd: 2, snippet: { pt: "Então pergunto: por acaso Deus rejeitou seu povo? De maneira…", en: "I ask then, did God reject his people? May it…", es: "Pero entonces pregunto: “¿Acaso Dios ha rechazado a su pueblo?”…" } },
      { bookId: "PSA", chapter: 122, verseStart: 6, verseEnd: null, snippet: { pt: "Orai pela paz de Jerusalém; prosperem os que te amam.", en: "Pray for the peace of Jerusalem. Those who love you…", es: "Oren para que Jerusalén pueda estar en paz. Que todos…" } },
      { bookId: "ISA", chapter: 43, verseStart: 1, verseEnd: null, snippet: { pt: "Porém agora assim diz o SENHOR, o teu Criador, ó…", en: "But now thus says Yahweh who created you, Jacob, and…", es: "Pero ahora esto es lo que el Señor dice a…" } },
      { bookId: "JER", chapter: 31, verseStart: 35, verseEnd: 37, snippet: { pt: "Assim diz o SENHOR, que dá o sol para a…", en: "Thus says Yahweh, who gives the sun for a light…", es: "Esto es lo que dice el Señor, que dispone el…" } },
      { bookId: "ZEC", chapter: 2, verseStart: 8, verseEnd: null, snippet: { pt: "Porque assim diz o SENHOR dos exércitos: Foi por causa…", en: "For thus says Yahweh of Armies: ‘For honor he has…", es: "Porque esto es lo que dice el Señor Todopoderoso: Después,…" } },
    ],
  },
  {
    id: "beatitudes",
    names: { pt: "Bem-aventuranças", en: "Beatitudes", es: "Bienaventuranzas" },
    passages: [
      { bookId: "MAT", chapter: 5, verseStart: 3, verseEnd: 12, snippet: { pt: "Benditos são os humildes de espírito, porque deles é o…", en: "Blessed are the poor in spirit, for theirs is the…", es: "Benditos son los que reconocen que son pobres espiritualmente, porque…" } },
      { bookId: "LUK", chapter: 6, verseStart: 20, verseEnd: 23, snippet: { pt: "Ele levantou os olhos aos seus discípulos, e disse: Benditos…", en: "He lifted up his eyes to his disciples, and said,…", es: "Mirando a sus discípulos, Jesús les dijo:" } },
      { bookId: "PSA", chapter: 1, verseStart: 1, verseEnd: null, snippet: { pt: "Bem-aventurado o homem que não anda no conselho dos maus,…", en: "Blessed is the man who doesn’t walk in the counsel…", es: "Felices los que no siguen los consejos del malvado, los…" } },
      { bookId: "REV", chapter: 1, verseStart: 3, verseEnd: null, snippet: { pt: "Bem-aventurado é aquele que lê, e também os que ouvem…", en: "Blessed is he who reads and those who hear the…", es: "Bendito es todo aquél que lee esto, así como los…" } },
    ],
  },
  {
    id: "love-god",
    names: { pt: "Amar a Deus", en: "Loving God", es: "Amar a Dios" },
    passages: [
      { bookId: "DEU", chapter: 6, verseStart: 4, verseEnd: 5, snippet: { pt: "Ouve, Israel: o SENHOR nosso Deus, o SENHOR um é:", en: "Hear, Israel: Yahweh is our God. Yahweh is one.", es: "Escucha, pueblo de Israel, el Señor nuestro Dios, el Señor…" } },
      { bookId: "MAT", chapter: 22, verseStart: 37, verseEnd: null, snippet: { pt: "E Jesus lhe respondeu: Amarás ao Senhor teu Deus com…", en: "Jesus said to him, “‘You shall love the Lord your…", es: "Jesús les dijo: “‘Ama al Señor tu Dios en todo…" } },
      { bookId: "JHN", chapter: 14, verseStart: 15, verseEnd: null, snippet: { pt: "Se me amais, guardai meus mandamentos.", en: "If you love me, keep my commandments.", es: "Si ustedes me aman, guardarán mis mandamientos." } },
      { bookId: "1JN", chapter: 4, verseStart: 19, verseEnd: null, snippet: { pt: "Nós amamos, porque ele nos amou primeiro.", en: "We love him, because he first loved us.", es: "Nosotros amamos porque él nos amó primero." } },
      { bookId: "JOS", chapter: 22, verseStart: 5, verseEnd: null, snippet: { pt: "Somente que com diligência cuideis de pôr por obra o…", en: "Only take diligent heed to do the commandment and the…", es: "Pero asegúrense de cumplir los mandamientos y la ley, tal…" } },
      { bookId: "PSA", chapter: 18, verseStart: 1, verseEnd: null, snippet: { pt: "Para o regente. Do servo do SENHOR, chamado Davi, o…", en: "I love you, Yahweh, my strength.", es: "Para el director del coro. Un salmo de David, el…" } },
    ],
  },
  {
    id: "love-neighbor",
    names: { pt: "Amar o próximo", en: "Loving neighbor", es: "Amar al prójimo" },
    passages: [
      { bookId: "MAT", chapter: 22, verseStart: 39, verseEnd: null, snippet: { pt: "O segundo, semelhante a este, é : Amarás o teu…", en: "A second likewise is this, ‘You shall love your neighbor…", es: "El segundo es similar: ‘Ama a tu prójimo como a…" } },
      { bookId: "LEV", chapter: 19, verseStart: 18, verseEnd: null, snippet: { pt: "Não te vingarás, nem guardarás rancor aos filhos de teu…", en: "‘You shall not take vengeance, nor bear any grudge against…", es: "No busques venganza ni guardes rencor a nadie, sino ama…" } },
      { bookId: "ROM", chapter: 13, verseStart: 9, verseEnd: 10, snippet: { pt: "Porque estes mandamentos : não adulterarás, não matarás, não roubarás,…", en: "For the commandments, “You shall not commit adultery,” “You shall…", es: "No cometan adulterio, no maten, no roben, no deseen para…" } },
      { bookId: "GAL", chapter: 5, verseStart: 14, verseEnd: null, snippet: { pt: "Pois toda a Lei se cumpre em uma só regra,…", en: "For the whole law is fulfilled in one word, in…", es: "Pues toda la ley se resume en este mandamiento: “Amarás…" } },
      { bookId: "LUK", chapter: 10, verseStart: 27, verseEnd: 37, snippet: { pt: "E respondendo ele, disse: Amarás ao Senhor teu Deus de…", en: "He answered, “You shall love the Lord your God with…", es: "Amarás al Señor tu Dios con todo tu corazón, y…" } },
      { bookId: "JAS", chapter: 2, verseStart: 8, verseEnd: null, snippet: { pt: "Se de fato cumpris a lei real conforme a Escritura:…", en: "However, if you fulfill the royal law, according to the…", es: "Si ustedes realmente observan la ley real de la Escritura:…" } },
    ],
  },
  {
    id: "prodigal",
    names: { pt: "Filho pródigo", en: "The prodigal son", es: "El hijo pródigo" },
    passages: [
      { bookId: "LUK", chapter: 15, verseStart: 11, verseEnd: 24, snippet: { pt: "E disse: Um certo homem tinha dois filhos.", en: "He said, “A certain man had two sons.", es: "Había un hombre que tenía dos hijos”, explicó Jesús." } },
      { bookId: "PSA", chapter: 103, verseStart: 8, verseEnd: 13, snippet: { pt: "Misericordioso e piedoso é o SENHOR, que demora para se…", en: "Yahweh is merciful and gracious, slow to anger, and abundant…", es: "El Señor es amable y lleno de gracia, y no…" } },
      { bookId: "ISA", chapter: 55, verseStart: 7, verseEnd: null, snippet: { pt: "Que o perverso deixe seu caminho, e o homem maligno…", en: "let the wicked forsake his way, and the unrighteous man…", es: "Los malvados deben cambiar sus costumbres y dejar de pensar…" } },
      { bookId: "JOL", chapter: 2, verseStart: 13, verseEnd: null, snippet: { pt: "Rasgai vosso coração, e não vossas vestes.Convertei-vos ao SENHOR vosso…", en: "Tear your heart, and not your garments, and turn to…", es: "Rasguen sus corazones y no sus vestiduras”. Vuelvan al Señor,…" } },
    ],
  },
  {
    id: "good-shepherd",
    names: { pt: "Bom Pastor", en: "Good Shepherd", es: "Buen Pastor" },
    passages: [
      { bookId: "JHN", chapter: 10, verseStart: 11, verseEnd: 14, snippet: { pt: "Eu sou o bom Pastor; o bom Pastor dá sua…", en: "I am the good shepherd.The good shepherd lays down his…", es: "Yo soy el buen pastor. El buen pastor entrega su…" } },
      { bookId: "PSA", chapter: 23, verseStart: 1, verseEnd: 4, snippet: { pt: "Salmo de Davi:O SENHOR é meu pastor, nada me faltará.", en: "Yahweh is my shepherd: I shall lack nothing.", es: "Un Salmo de David. El Señor es mi pastor, y…" } },
      { bookId: "EZK", chapter: 34, verseStart: 11, verseEnd: 12, snippet: { pt: "Porque assim diz o Senhor DEUS: Eis que eu, eu…", en: "For thus says the Lord Yahweh: Behold, I myself, even…", es: "Porque esto es lo que dice el Señor Dios: Mira…" } },
      { bookId: "ISA", chapter: 40, verseStart: 11, verseEnd: null, snippet: { pt: "Como pastor ele apascentará seu rebanho; em seus braços recolherá…", en: "He will feed his flock like a shepherd. He will…", es: "Cuida de su rebaño como un pastor. Coge a los…" } },
      { bookId: "1PE", chapter: 5, verseStart: 4, verseEnd: null, snippet: { pt: "E quando o Pastor Principal aparecer, vós recebereis a indestrutível…", en: "When the chief Shepherd is revealed, you will receive the…", es: "Cuando aparezca el Pastor supremo, ustedes recibirán una corona de…" } },
    ],
  },
  {
    id: "bread-of-life",
    names: { pt: "Pão da vida", en: "Bread of life", es: "Pan de vida" },
    passages: [
      { bookId: "JHN", chapter: 6, verseStart: 35, verseEnd: null, snippet: { pt: "E Jesus lhes disse: Eu sou o pão da vida;…", en: "Jesus said to them, “I am the bread of life.…", es: "Yo soy el pan de vida”, respondió Jesús. “Cualquiera que…" } },
      { bookId: "JHN", chapter: 6, verseStart: 48, verseEnd: 51, snippet: { pt: "Eu sou o pão da vida.", en: "I am the bread of life.", es: "Yo soy el pan de vida." } },
      { bookId: "MAT", chapter: 4, verseStart: 4, verseEnd: null, snippet: { pt: "Mas Jesus respondeu: Está escrito: Não só de pão viverá…", en: "But he answered, “It is written, ‘Man shall not live…", es: "Jesús respondió: “Como dicen las Escrituras, ‘los seres humanos no…" } },
      { bookId: "DEU", chapter: 8, verseStart: 3, verseEnd: null, snippet: { pt: "E te afligiu, e te fez ter fome, e te…", en: "He humbled you, and allowed you to be hungry, and…", es: "Te humilló y, cuando tuviste hambre, te dio a comer…" } },
      { bookId: "LUK", chapter: 22, verseStart: 19, verseEnd: null, snippet: { pt: "E tomando o pão, e tendo agradecido a Deus ,partiu-o,…", en: "He took bread, and when he had given thanks, he…", es: "Luego tomó el pan, y después de haber dado gracias,…" } },
    ],
  },
  {
    id: "the-vine",
    names: { pt: "A videira", en: "The vine", es: "La vid" },
    passages: [
      { bookId: "JHN", chapter: 15, verseStart: 1, verseEnd: 5, snippet: { pt: "Eu sou a videira verdadeira, e meu Pai é o…", en: "I am the true vine, and my Father is the…", es: "Yo soy la vid verdadera y mi padre es el…" } },
      { bookId: "JHN", chapter: 15, verseStart: 8, verseEnd: null, snippet: { pt: "Nisto é glorificado meu Pai, em que deis muito fruto;…", en: "In this is my Father glorified, that you bear much…", es: "Mi Padre es glorificado cuando ustedes producen mucho fruto, demostrando…" } },
      { bookId: "PSA", chapter: 80, verseStart: 8, verseEnd: null, snippet: { pt: "Tu transportaste tua vinha do Egito, tiraste as nações, e…", en: "You brought a vine out of Egypt. You drove out…", es: "Nos sacaste de Egipto como una vid, expulsaste a las…" } },
      { bookId: "ISA", chapter: 5, verseStart: 1, verseEnd: 2, snippet: { pt: "Agora cantarei a meu amado o cântico de meu querido…", en: "Let me sing for my well beloved a song of…", es: "Permítanme cantar una canción para mi amor, sobre su viñedo.…" } },
    ],
  },
  {
    id: "comfort",
    names: { pt: "Consolo", en: "Comfort", es: "Consuelo" },
    passages: [
      { bookId: "2CO", chapter: 1, verseStart: 3, verseEnd: 4, snippet: { pt: "Bendito seja o Deus e Pai de nosso Senhor Jesus…", en: "Blessed be the God and Father of our Lord Jesus…", es: "¡Alaben a Dios, el padre de nuestro Señor Jesucristo! Él…" } },
      { bookId: "PSA", chapter: 34, verseStart: 18, verseEnd: null, snippet: { pt: "O SENHOR está perto daqueles que estão com o coração…", en: "Yahweh is near to those who have a broken heart,…", es: "El Señor está cerca de los que tienen el corazón…" } },
      { bookId: "ISA", chapter: 61, verseStart: 1, verseEnd: 3, snippet: { pt: "O Espírito do Senhor DEUS está sobre mim; pois o…", en: "The Spirit of the Lord Yahweh is on me; because…", es: "El Espíritu del Señor Dios está sobre mí, porque el…" } },
      { bookId: "MAT", chapter: 5, verseStart: 4, verseEnd: null, snippet: { pt: "Benditos são os que choram, porque eles serão consolados.", en: "Blessed are those who mourn, for they shall be comforted.", es: "Benditos son los que lloran, porque ellos serán consolados." } },
      { bookId: "JHN", chapter: 14, verseStart: 16, verseEnd: 18, snippet: { pt: "E eu rogarei ao Pai, e ele vos dará outro…", en: "I will pray to the Father, and he will give…", es: "Yo le pediré al padre, y él les enviará a…" } },
      { bookId: "PSA", chapter: 23, verseStart: 4, verseEnd: null, snippet: { pt: "Ainda que eu venha a andar pelo vale da sombra…", en: "Even though I walk through the valley of the shadow…", es: "Incluso cuando camino por el valle oscuro de la muerte,…" } },
    ],
  },
  {
    id: "praise",
    names: { pt: "Louvor", en: "Praise", es: "Alabanza" },
    passages: [
      { bookId: "PSA", chapter: 150, verseStart: 6, verseEnd: null, snippet: { pt: "Tudo quanto tem fôlego, louve ao SENHOR! Aleluia!", en: "Let everything that has breath praise Yah! Praise Yah!", es: "¡Que todo lo que respire alabe al Señor! ¡Alaben al…" } },
      { bookId: "PSA", chapter: 100, verseStart: 1, verseEnd: 2, snippet: { pt: "Salmo de louvor: Gritai de alegria ao SENHOR toda a…", en: "Shout for joy to Yahweh, all you lands!", es: "Un salmo de acción de gracias. ¡Griten de alegría al…" } },
      { bookId: "HEB", chapter: 13, verseStart: 15, verseEnd: null, snippet: { pt: "Portanto, por meio dele, ofereçamos continuamente sacrifício de louvor a…", en: "Through him, then, let us offer up a sacrifice of…", es: "Ofrezcamos, pues, por medio de Jesús, un sacrificio continuo de…" } },
      { bookId: "PSA", chapter: 34, verseStart: 1, verseEnd: null, snippet: { pt: "Salmo de Davi, quando ele mudou seu comportamento perante Abimeleque,…", en: "I will bless Yahweh at all times. His praise will…", es: "Un salmo de David sobre la vez que aparentó estar…" } },
      { bookId: "ISA", chapter: 25, verseStart: 1, verseEnd: null, snippet: { pt: "Ó SENHOR, tu és meu Deus; eu te exaltarei, e…", en: "Yahweh, you are my God. I will exalt you! I…", es: "Señor, tú eres mi Dios. Te honraré y alabaré quien…" } },
      { bookId: "REV", chapter: 5, verseStart: 12, verseEnd: null, snippet: { pt: "que diziam em alta voz: “Digno é o Cordeiro que…", en: "saying with a loud voice, “Worthy is the Lamb who…", es: "diciendo juntos, a gran voz: “El Cordero que fue inmolado…" } },
    ],
  },
  {
    id: "revival",
    names: { pt: "Avivamento", en: "Revival", es: "Avivamiento" },
    passages: [
      { bookId: "2CH", chapter: 7, verseStart: 14, verseEnd: null, snippet: { pt: "Se se humilhar meu povo, sobre os quais nem nome…", en: "if my people, who are called by my name, shall…", es: "y si mi pueblo, llamado por mi nombre, se humillara…" } },
      { bookId: "HAB", chapter: 3, verseStart: 2, verseEnd: null, snippet: { pt: "Ó SENHOR, ouvido tenho tua fama; temi, Ó SENHOR, a…", en: "Yahweh, I have heard of your fame. I stand in…", es: "He oído lo que se dice de ti, Señor. Me…" } },
      { bookId: "PSA", chapter: 85, verseStart: 6, verseEnd: null, snippet: { pt: "Não voltará a dar-nos vida, para que o teu povo…", en: "Won’t you revive us again, that your people may rejoice…", es: "¿No restaurarás nuestras vidas, de tal modo que tu pueblo…" } },
      { bookId: "ISA", chapter: 57, verseStart: 15, verseEnd: null, snippet: { pt: "Porque assim diz o Alto e Sublime, que habita na…", en: "For thus says the high and lofty One who inhabits…", es: "Esto es lo que dice el que está por encima…" } },
      { bookId: "ACT", chapter: 3, verseStart: 19, verseEnd: null, snippet: { pt: "Arrependei-vos, pois, e convertei-vos, para que vosso pecados sejam apagados,…", en: "Repent therefore, and turn again, that your sins may be…", es: "Ahora, arrepiéntanse, y cambien sus caminos, para que sus pecados…" } },
      { bookId: "JOL", chapter: 2, verseStart: 28, verseEnd: null, snippet: { pt: "E será depois que derramarei meu Espírito sobre toda carne;…", en: "It will happen afterward, that I will pour out my…", es: "Después de esto derramaré mi Espíritu sobre todos. Sus hijos…" } },
    ],
  },
  {
    id: "freedom",
    names: { pt: "Liberdade", en: "Freedom", es: "Libertad" },
    passages: [
      { bookId: "JHN", chapter: 8, verseStart: 36, verseEnd: null, snippet: { pt: "Portanto, se o Filho vos libertar, verdadeiramente sereis livres.", en: "If therefore the Son makes you free, you will be…", es: "Si el Hijo los libera, entonces ustedes son verdaderamente libres." } },
      { bookId: "GAL", chapter: 5, verseStart: 1, verseEnd: null, snippet: { pt: "Para a liberdade Cristo nos libertou; portanto, estai firmes, e…", en: "Stand firm therefore in the liberty by which Christ has…", es: "Cristo nos libertó para que pudiéramos tener verdadera libertad. Así…" } },
      { bookId: "2CO", chapter: 3, verseStart: 17, verseEnd: null, snippet: { pt: "O Senhor é o Espírito; e onde está o Espírito…", en: "Now the Lord is the Spirit and where the Spirit…", es: "Ahora bien, el Señor es el Espíritu, y dondequiera está…" } },
      { bookId: "ROM", chapter: 8, verseStart: 1, verseEnd: 2, snippet: { pt: "Portanto, agora, nenhuma condenação há para os que estão em…", en: "There is therefore now no condemnation to those who are…", es: "Así que ahora no hay condenación para los que están…" } },
      { bookId: "GAL", chapter: 5, verseStart: 13, verseEnd: null, snippet: { pt: "Pois vós, irmãos, fostes chamados para a liberdade. Somente não…", en: "For you, brothers, were called for freedom. Only don’t use…", es: "¡Ustedes, mis hermanos y hermanas, fueron llamados para ser libres!…" } },
      { bookId: "ISA", chapter: 61, verseStart: 1, verseEnd: null, snippet: { pt: "O Espírito do Senhor DEUS está sobre mim; pois o…", en: "The Spirit of the Lord Yahweh is on me; because…", es: "El Espíritu del Señor Dios está sobre mí, porque el…" } },
    ],
  },
  {
    id: "grief",
    names: { pt: "Luto", en: "Grief", es: "Duelo" },
    passages: [
      { bookId: "PSA", chapter: 34, verseStart: 18, verseEnd: null, snippet: { pt: "O SENHOR está perto daqueles que estão com o coração…", en: "Yahweh is near to those who have a broken heart,…", es: "El Señor está cerca de los que tienen el corazón…" } },
      { bookId: "MAT", chapter: 5, verseStart: 4, verseEnd: null, snippet: { pt: "Benditos são os que choram, porque eles serão consolados.", en: "Blessed are those who mourn, for they shall be comforted.", es: "Benditos son los que lloran, porque ellos serán consolados." } },
      { bookId: "1TH", chapter: 4, verseStart: 13, verseEnd: 14, snippet: { pt: "Mas irmãos, não queremos que desconheçais acerca dos que morreram,…", en: "But we don’t want you to be ignorant, brothers, concerning…", es: "No queremos que se confundan en cuanto a lo que…" } },
      { bookId: "REV", chapter: 21, verseStart: 4, verseEnd: null, snippet: { pt: "E Deus limpará toda lágrima dos olhos deles; e não…", en: "He will wipe away from them every tear from their…", es: "El enjugará toda lágrima de sus ojos, y la muerte…" } },
      { bookId: "PSA", chapter: 147, verseStart: 3, verseEnd: null, snippet: { pt: "Ele sara aos de coração partido, e os cura de…", en: "He heals the broken in heart, and binds up their…", es: "Él sana a los de corazón quebrantado, y venda las…" } },
      { bookId: "ISA", chapter: 53, verseStart: 4, verseEnd: null, snippet: { pt: "Verdadeiramente ele tomou sobre si nossas enfermidades, e nossas dores…", en: "Surely he has borne our sickness, and carried our suffering;…", es: "Sin embargo, era él quien cargaba con nuestras debilidades, estaba…" } },
    ],
  },
  {
    id: "doubt",
    names: { pt: "Dúvida", en: "Doubt", es: "Duda" },
    passages: [
      { bookId: "MRK", chapter: 9, verseStart: 24, verseEnd: null, snippet: { pt: "Logo o pai do menino, clamando, disse: Creio! Ajuda-me na…", en: "Immediately the father of the child cried out with tears,…", es: "Yo creo en ti”, gritó el hombre de inmediato. “Ayúdame…" } },
      { bookId: "JAS", chapter: 1, verseStart: 6, verseEnd: null, snippet: { pt: "Porém deves pedi-la em fé, duvidando em nada; pois quem…", en: "But let him ask in faith, without any doubting, for…", es: "Pero cuando pidan, recuerden confiar en Dios. Háganlo sin dudas.…" } },
      { bookId: "JHN", chapter: 20, verseStart: 27, verseEnd: 29, snippet: { pt: "Depois disse a Tomé: Põe teu dedo aqui, e vê…", en: "Then he said to Thomas, “Reach here your finger, and…", es: "Entonces le dijo a Tomás: “Coloca aquí tu dedo, y…" } },
      { bookId: "JUD", chapter: 1, verseStart: 22, verseEnd: null, snippet: { pt: "E tende misericórdia de alguns que estão em dúvida; salvai…", en: "On some have compassion, making a distinction,", es: "Muestren bondad con los que dudan." } },
      { bookId: "MAT", chapter: 14, verseStart: 31, verseEnd: null, snippet: { pt: "Imediatamente Jesus estendeu a mão, segurou-o, e disse-lhe: Homem de…", en: "Immediately Jesus stretched out his hand, took hold of him,…", es: "De inmediato Jesús se extendió y lo tomó, y le…" } },
      { bookId: "PSA", chapter: 73, verseStart: 26, verseEnd: null, snippet: { pt: "Minha carne e meu coração desfalecem; porém Deus será a…", en: "My flesh and my heart fails, but God is the…", es: "Mi cuerpo y mi mente podrás fallar, pero Dios es…" } },
    ],
  },
  {
    id: "calling",
    names: { pt: "Chamado", en: "Calling", es: "Llamado" },
    passages: [
      { bookId: "EPH", chapter: 4, verseStart: 1, verseEnd: null, snippet: { pt: "Portanto, eu, o prisioneiro no Senhor, rogo-vos que andeis como…", en: "I therefore, the prisoner in the Lord, beg you to…", es: "Así que yo, —este prisionero en el Señor—los animo a…" } },
      { bookId: "2TI", chapter: 1, verseStart: 9, verseEnd: null, snippet: { pt: "Ele nos salvou, e chamou com um chamado santo; não…", en: "who saved us and called us with a holy calling,…", es: "Él es el que nos ha salvado y nos ha…" } },
      { bookId: "ROM", chapter: 8, verseStart: 28, verseEnd: null, snippet: { pt: "E sabemos que todas as coisas juntamente contribuem para o…", en: "We know that all things work together for good for…", es: "Sabemos que en todas las cosas Dios obra para el…" } },
      { bookId: "1PE", chapter: 2, verseStart: 9, verseEnd: null, snippet: { pt: "Mas vós sois a geração escolhida, o sacerdócio real, a…", en: "But you are a chosen race, a royal priesthood, a…", es: "En cambio, ustedes son una familia elegida de manera especial,…" } },
      { bookId: "ISA", chapter: 6, verseStart: 8, verseEnd: null, snippet: { pt: "Depois disso ouvi a voz do Senhor, que dizia: A…", en: "I heard the Lord’s voice, saying, “Whom shall I send,…", es: "Entonces oí al Señor preguntar: “¿A quién enviaré? ¿Quién irá…" } },
      { bookId: "PHP", chapter: 3, verseStart: 14, verseEnd: null, snippet: { pt: "e prossigo para o alvo, ao prêmio do chamado de…", en: "I press on toward the goal for the prize of…", es: "Corro hacia la meta para ganar el premio de la…" } },
    ],
  },
  {
    id: "women",
    names: { pt: "Mulheres", en: "Women", es: "Mujeres" },
    passages: [
      { bookId: "PRO", chapter: 31, verseStart: 30, verseEnd: null, snippet: { pt: "A beleza é enganosa, e a formosura é passageira; mas…", en: "Charm is deceitful, and beauty is vain; but a woman…", es: "El encanto es engañoso, y la belleza se desvanece; pero…" } },
      { bookId: "GAL", chapter: 3, verseStart: 28, verseEnd: null, snippet: { pt: "Assim, não há judeu nem grego; não há servo nem…", en: "There is neither Jew nor Greek, there is neither slave…", es: "Ya no hay más judío o griego, esclavo o libre,…" } },
      { bookId: "LUK", chapter: 8, verseStart: 1, verseEnd: 3, snippet: { pt: "E aconteceu depois disso, que Jesus andava de cidade em…", en: "Soon afterwards, he went about through cities and villages, preaching…", es: "Poco después de esto, Jesús fue por las ciudades y…" } },
      { bookId: "JDG", chapter: 4, verseStart: 4, verseEnd: null, snippet: { pt: "E governava naquele tempo a Israel uma mulher, Débora, profetisa,…", en: "Now Deborah, a prophetess, the wife of Lappidoth, she judged…", es: "Débora, esposa de Lapidot, era profeta y dirigía a Israel…" } },
      { bookId: "ACT", chapter: 16, verseStart: 14, verseEnd: 15, snippet: { pt: "E uma certa mulher, por nome Lídia, vendedora de púrpura,…", en: "A certain woman named Lydia, a seller of purple, of…", es: "Una de ellas se llamaba Lidia, era de la ciudad…" } },
      { bookId: "ROM", chapter: 16, verseStart: 1, verseEnd: 2, snippet: { pt: "Eu vos recomendo a nossa irmã Febe, que é servidora…", en: "I commend to you Phoebe, our sister, who is a…", es: "Les encomiendo a nuestra hermana Febe, quien es diaconisa en…" } },
    ],
  },
  {
    id: "men",
    names: { pt: "Homens", en: "Men", es: "Hombres" },
    passages: [
      { bookId: "1CO", chapter: 16, verseStart: 13, verseEnd: null, snippet: { pt: "Vigiai, ficai firmes na fé, sede corajosos, e vos esforçai.", en: "Watch! Stand firm in the faith! Be courageous! Be strong!", es: "Estén alerta. Manténganse firmes en su confianza en Dios. Tengan…" } },
      { bookId: "MIC", chapter: 6, verseStart: 8, verseEnd: null, snippet: { pt: "Ele já declarou a ti, ó ser humano, o que…", en: "He has shown you, O man, what is good. What…", es: "Pueblo, el Señor te ha dicho lo que es bueno,…" } },
      { bookId: "JOS", chapter: 1, verseStart: 9, verseEnd: null, snippet: { pt: "Olha que te mando que te esforces e sejas valente:…", en: "Haven’t I commanded you? Be strong and courageous. Don’t be…", es: "No te olvides lo que te dije: ¡Sé fuerte! ¡Sé…" } },
      { bookId: "1TI", chapter: 6, verseStart: 11, verseEnd: null, snippet: { pt: "Porém tu, homem de Deus, foge dessas coisas. Segue a…", en: "But you, man of God, flee these things, and follow…", es: "Pero tú, como hombre de Dios, debes alejarte de tales…" } },
      { bookId: "PRO", chapter: 20, verseStart: 7, verseEnd: null, snippet: { pt: "O justo caminha em sua integridade; bem-aventurados serão seus filhos…", en: "A righteous man walks in integrity. Blessed are his children…", es: "El pueblo de Dios vive con honestidad. ¡Cuán felices son…" } },
      { bookId: "EPH", chapter: 5, verseStart: 25, verseEnd: null, snippet: { pt: "Maridos, amai as vossas próprias esposas, assim como também Cristo…", en: "Husbands, love your wives, even as Christ also loved the…", es: "Esposos, amen a sus esposas de la misma manera que…" } },
    ],
  },
  {
    id: "end-times",
    names: { pt: "Fim dos tempos", en: "End times", es: "Tiempos finales" },
    passages: [
      { bookId: "MAT", chapter: 24, verseStart: 6, verseEnd: 14, snippet: { pt: "E ouvireis de guerras, e de rumores de guerras. Olhai…", en: "You will hear of wars and rumors of wars. See…", es: "Ustedes oirán de guerras de y rumores de guerras, pero…" } },
      { bookId: "2TI", chapter: 3, verseStart: 1, verseEnd: 5, snippet: { pt: "Sabe porém isto, que nos últimos dias virão tempos difíceis.", en: "But know this, that in the last days, grievous times…", es: "Debes saber que habrá momentos difíciles en los últimos días." } },
      { bookId: "1TH", chapter: 5, verseStart: 2, verseEnd: 6, snippet: { pt: "pois vós mesmos bem sabeis que o dia do Senhor…", en: "For you yourselves know well that the day of the…", es: "Ustedes mismos saben bien que el día del Señor vendrá…" } },
      { bookId: "2PE", chapter: 3, verseStart: 10, verseEnd: null, snippet: { pt: "Mas o dia do Senhor virá como um ladrão durante…", en: "But the day of the Lord will come as a…", es: "Sin embargo, el día del Señor vendrá, y será inesperadamente,…" } },
      { bookId: "DAN", chapter: 12, verseStart: 4, verseEnd: null, snippet: { pt: "Porém tu, Daniel, guarda em segredo estas palavras e sela…", en: "But you, Daniel, shut up the words, and seal the…", es: "Pero en cuanto a ti, Daniel, mantén este mensaje en…" } },
      { bookId: "REV", chapter: 1, verseStart: 7, verseEnd: null, snippet: { pt: "Eis que ele vem com as nuvens, e todo olho…", en: "Behold, he is coming with the clouds, and every eye…", es: "Miren que viene rodeado de nubes, y todos lo verán,…" } },
    ],
  },
  {
    id: "new-covenant",
    names: { pt: "Nova aliança", en: "New covenant", es: "Nuevo pacto" },
    passages: [
      { bookId: "JER", chapter: 31, verseStart: 31, verseEnd: 34, snippet: { pt: "Eis que vêm dias,diz o SENHOR, em que farei um…", en: "Behold, the days come, says Yahweh, that I will make…", es: "¡Mira! Se acerca el momento, dice el Señor, en que…" } },
      { bookId: "HEB", chapter: 8, verseStart: 6, verseEnd: 13, snippet: { pt: "Mas agora Jesus obteve um ofício mais relevante, como é…", en: "But now he has obtained a more excellent ministry, by…", es: "Pero a Jesús se le ha dado un ministerio mucho…" } },
      { bookId: "LUK", chapter: 22, verseStart: 20, verseEnd: null, snippet: { pt: "De modo semelhante também com o copo, depois da ceia,…", en: "Likewise, he took the cup after supper, saying, “This cup…", es: "De la misma manera, después de haber terminado de cenar,…" } },
      { bookId: "2CO", chapter: 3, verseStart: 6, verseEnd: null, snippet: { pt: "O qual também nos fez capazes para sermos ministros do…", en: "who also made us sufficient as servants of a new…", es: "También nos da la capacidad de ser ministros de un…" } },
      { bookId: "HEB", chapter: 9, verseStart: 15, verseEnd: null, snippet: { pt: "E por isso ele é o Mediador de um Novo…", en: "For this reason he is the mediator of a new…", es: "Por eso él es el mediador de una nueva relación…" } },
    ],
  },
  {
    id: "sabbath",
    names: { pt: "Sábado / descanso", en: "Sabbath", es: "Sábado" },
    passages: [
      { bookId: "EXO", chapter: 20, verseStart: 8, verseEnd: 11, snippet: { pt: "Tu te lembrarás do dia do repouso, para santificá-lo:", en: "Remember the Sabbath day, to keep it holy.", es: "Recuerda el sábado para santificarlo." } },
      { bookId: "MRK", chapter: 2, verseStart: 27, verseEnd: null, snippet: { pt: "Disse-lhes mais: O sábado foi feito por causa do ser…", en: "He said to them, “The Sabbath was made for man,…", es: "El sábado fue hecho para beneficio de ustedes, y no…" } },
      { bookId: "ISA", chapter: 58, verseStart: 13, verseEnd: 14, snippet: { pt: "Se quanto ao sábado recusares fazer tua vontade no meu…", en: "If you turn away your foot from the Sabbath, from…", es: "Si se aseguran de no quebrantar el sábado haciendo lo…" } },
      { bookId: "HEB", chapter: 4, verseStart: 9, verseEnd: 10, snippet: { pt: "Portanto, ainda resta um repouso como o do sábado para…", en: "There remains therefore a Sabbath rest for the people of…", es: "De modo que el reposo del Sábado todavía permanece para…" } },
      { bookId: "GEN", chapter: 2, verseStart: 2, verseEnd: 3, snippet: { pt: "E acabou Deus no dia sétimo sua obra que fez,…", en: "On the seventh day God finished his work which he…", es: "Cuando llegó el séptimo día, Dios había terminado el trabajo…" } },
    ],
  },
  {
    id: "angels",
    names: { pt: "Anjos", en: "Angels", es: "Ángeles" },
    passages: [
      { bookId: "PSA", chapter: 91, verseStart: 11, verseEnd: null, snippet: { pt: "Porque ele ordenou aos anjos quanto a ti, para que…", en: "For he will put his angels in charge of you,…", es: "Porque él mandará a sus ángeles para que te cuiden…" } },
      { bookId: "HEB", chapter: 1, verseStart: 14, verseEnd: null, snippet: { pt: "Por acaso não são todos eles espíritos servidores, enviados para…", en: "Aren’t they all serving spirits, sent out to do service…", es: "¿Qué son los ángeles? Son seres que sirven, que han…" } },
      { bookId: "LUK", chapter: 2, verseStart: 13, verseEnd: 14, snippet: { pt: "E no mesmo instante apareceu com o anjo uma multidão…", en: "Suddenly, there was with the angel a multitude of the…", es: "De repente aparecieron muchos seres celestiales, alabando a Dios, y…" } },
      { bookId: "MAT", chapter: 18, verseStart: 10, verseEnd: null, snippet: { pt: "Olhai para que não desprezeis a algum destes pequeninos; porque…", en: "See that you don’t despise one of these little ones,…", es: "Asegúrense de no menospreciar a estos pequeños. Yo les digo…" } },
      { bookId: "PSA", chapter: 34, verseStart: 7, verseEnd: null, snippet: { pt: "O anjo do SENHOR fica ao redor daqueles que o…", en: "Yahweh’s angel encamps around those who fear him, and delivers…", es: "El ángel del Señor permanece vigilante sobre los que le…" } },
      { bookId: "HEB", chapter: 13, verseStart: 2, verseEnd: null, snippet: { pt: "Não vos esqueçais de mostrar hospitalidade, porque através dela alguns,…", en: "Don’t forget to show hospitality to strangers, for in doing…", es: "No olviden mostrar amor por los extranjeros también, porque al…" } },
    ],
  },
  {
    id: "creation-care",
    names: { pt: "Cuidado da criação", en: "Creation care", es: "Cuidado de la creación" },
    passages: [
      { bookId: "GEN", chapter: 2, verseStart: 15, verseEnd: null, snippet: { pt: "Então o SENHOR Deus tomou o homem, e o pôs…", en: "Yahweh God took the man, and put him into the…", es: "El Señor Dios puso al hombre en el Jardín de…" } },
      { bookId: "PSA", chapter: 24, verseStart: 1, verseEnd: null, snippet: { pt: "Salmo de Davi:Ao SENHOR pertence a terra, e sua plenitude;…", en: "The earth is Yahweh’s, with its fullness; the world, and…", es: "Un Salmo de David. La tierra es del Señor, y…" } },
      { bookId: "GEN", chapter: 1, verseStart: 28, verseEnd: null, snippet: { pt: "E Deus os abençoou; e disse-lhes Deus: Frutificai e multiplicai,…", en: "God blessed them. God said to them, “Be fruitful, multiply,…", es: "Dios los bendijo y les dijo: “Reprodúzcanse y multiplíquense; vayan…" } },
      { bookId: "COL", chapter: 1, verseStart: 16, verseEnd: 17, snippet: { pt: "porque nele foram criadas todas as coisas que há nos…", en: "For by him all things were created, in the heavens…", es: "porque todo fue creado por medio de él, ya sea…" } },
      { bookId: "PSA", chapter: 104, verseStart: 24, verseEnd: null, snippet: { pt: "Como são muitas as suas obras, SENHOR! Tu fizeste todas…", en: "Yahweh, how many are your works! In wisdom have you…", es: "Señor, ¡Cuántas cosas has hecho, todas ellas sabiamente formadas! La…" } },
    ],
  },
  {
    id: "fast-and-pray",
    names: { pt: "Vigília", en: "Watch and pray", es: "Velad y orad" },
    passages: [
      { bookId: "MAT", chapter: 26, verseStart: 41, verseEnd: null, snippet: { pt: "Vigiai e orai, para que não entreis em tentação. De…", en: "Watch and pray, that you don’t enter into temptation. The…", es: "Estén despiertos y oren, para que no caigan en tentación.…" } },
      { bookId: "COL", chapter: 4, verseStart: 2, verseEnd: null, snippet: { pt: "Perseverai na oração, vigiando nela com gratidão.", en: "Continue steadfastly in prayer, watching therein with thanksgiving;", es: "No olviden seguir en oración, con sus mentes alertas y…" } },
      { bookId: "1PE", chapter: 5, verseStart: 8, verseEnd: null, snippet: { pt: "Sede sóbrios! Vigiai! O vosso adversário, o diabo, anda ao…", en: "Be sober and self-controlled. Be watchful. Your adversary, the devil,…", es: "Sean responsables, y estén vigilantes. El diablo, su enemigo, anda…" } },
      { bookId: "LUK", chapter: 21, verseStart: 36, verseEnd: null, snippet: { pt: "Então vigiai sempre, orando para que sejais considerados dignos de…", en: "Therefore be watchful all the time, praying that you may…", es: "Manténganse despiertos y oren, para que puedan escapar de todas…" } },
      { bookId: "EPH", chapter: 6, verseStart: 18, verseEnd: null, snippet: { pt: "orando em todo tempo com toda oração e súplica no…", en: "with all prayer and requests, praying at all times in…", es: "Siempre oren en el Espíritu al hacer todo esto. Estén…" } },
    ],
  },
];

export function collectionById(id: string): Collection | undefined {
  return COLLECTIONS.find((item) => item.id === id);
}

export function searchCollections(query: string, locale: Locale): Collection[] {
  const q = fold(query);
  const list = !q ? COLLECTIONS : COLLECTIONS.filter((item) => haystack(item, locale).includes(q));
  return sortCollections(list, locale);
}

function sortCollections(items: Collection[], locale: Locale): Collection[] {
  const collator = new Intl.Collator(locale === "pt" ? "pt" : locale === "es" ? "es" : "en", {
    sensitivity: "base",
  });
  return [...items].sort((a, b) => collator.compare(a.names[locale], b.names[locale]));
}

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function haystack(item: Collection, locale: Locale): string {
  const parts = [item.names.pt, item.names.en, item.names.es, item.id.replaceAll("-", " ")];
  for (const passage of item.passages) {
    const book = bookById(passage.bookId);
    parts.push(passage.bookId, passage.snippet.pt, passage.snippet.en, passage.snippet.es);
    if (book) {
      parts.push(book.names.pt, book.names.en, book.names.es, book.abbr.pt, book.abbr.en, book.abbr.es);
      parts.push(formatPassage(book, passage, locale));
    }
  }
  return fold(parts.join(" "));
}
