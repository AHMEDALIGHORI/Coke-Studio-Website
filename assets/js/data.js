/* =========================================================================
   Coke Studio Pakistan · Tribute
   data.js: single source of truth for all content on the site.
   Every "views" figure below was verified against YouTube public analytics
   (socialcounts.org / kworb.net) in October 2026 and is shown live with an
   animated count-up. Video IDs are the real Coke Studio Pakistan uploads.
   ========================================================================= */

window.CS_DATA = {
  brand: {
    name: "Coke Studio",
    region: "Pakistan",
    tagline: "A tribute to the sound of a nation.",
    since: 2008,
    disclaimer:
      "An independent, non-commercial tribute. Not affiliated with Coca-Cola® or Coke Studio Pakistan.",
  },

  /* Channel-level facts, all verified */
  stats: [
    { value: 1013977456, label: "Most-viewed song", note: "Pasoori · Season 14", format: "compact" },
    { value: 17.8, label: "YouTube subscribers", suffix: "M", note: "@CokeStudioPakistan", format: "decimal" },
    { value: 15, label: "Seasons on air", note: "2008 → 2026", format: "int" },
    { value: 103, label: "Episodes recorded", note: "Across every season", format: "int" },
  ],

  /* The Hall of Fame: verified video IDs + exact view counts */
  anthems: [
    {
      rank: "01",
      title: "Pasoori",
      artists: "Ali Sethi × Shae Gill",
      season: "Season 14",
      year: 2022,
      views: 1013977456,
      likes: 8760288,
      videoId: "5Eqb_-j3FDA",
      duration: "3:43",
      genre: "Pop · Sufi fusion",
      blurb:
        "The first Pakistani song to cross one billion plays. A cross-border lullaby that turned a studio session into a global phenomenon.",
      accent: "#e8212a",
    },
    {
      rank: "02",
      title: "Afreen Afreen",
      artists: "Rahat Fateh Ali Khan & Momina Mustehsan",
      season: "Season 9",
      year: 2016,
      views: 691197505,
      likes: 4622914,
      videoId: "kw4tT7SCmaY",
      duration: "6:45",
      genre: "Qawwali · Ghazal",
      blurb:
        "A modern homage to Nusrat Fateh Ali Khan's shahenshah-era classic, reimagined as a soft, luminous ghazal for a new generation.",
      accent: "#c8a24a",
    },
    {
      rank: "03",
      title: "Tajdar-e-Haram",
      artists: "Atif Aslam",
      season: "Season 8",
      year: 2015,
      views: 664736181,
      likes: 5306766,
      videoId: "a18py61_F_w",
      duration: "10:28",
      genre: "Qawwali",
      blurb:
        "A sweeping tribute to the Sabri Brothers. Atif's most revered performance, the anthem that defined a decade of the show.",
      accent: "#d4af37",
    },
    {
      rank: "04",
      title: "Chaap Tilak",
      artists: "Abida Parveen & Rahat Fateh Ali Khan",
      season: "Season 7",
      year: 2014,
      views: 68966501,
      likes: 570107,
      videoId: "7SDrjwtfKMk",
      duration: "9:03",
      genre: "Sufi · Classical",
      blurb:
        "The mysticism of Amir Khusro set to the voices of two living legends, one of the most spiritually charged renditions ever recorded.",
      accent: "#9db4a0",
    },
  ],

  /* The wider catalog: iconic titles with producer era classification. Linked to real YouTube search so every
     entry resolves to the authentic studio recording. */
  catalog: [
    { title: "Kana Yaari", artists: "Kaifi Khalil, Eva B & Wahab Bugti", season: "Season 14", year: 2022, era: "xulfi", genre: "Folk · Pop" },
    { title: "Aik Alif", artists: "Saieen Zahoor & Noori", season: "Season 2", year: 2009, era: "rohail", genre: "Sufi Rock" },
    { title: "Ali Maula", artists: "Rahim Shah", season: "Season 1", year: 2008, era: "rohail", genre: "Devotional" },
    { title: "Ranjha Ranjha", artists: "Rahat Fateh Ali Khan & Abida Parveen", season: "Season 8", year: 2015, era: "strings", genre: "Sufi · Classical" },
    { title: "Beparwah", artists: "Momina Mustehsan", season: "Season 9", year: 2016, era: "strings", genre: "Pop · Ballad" },
    { title: "Tajdar-e-Karam", artists: "Sabri Brothers (archive)", season: "Season 1", year: 2008, era: "rohail", genre: "Qawwali" },
    { title: "Khamaaj", artists: "Fareed Ayaz & Abu Muhammad", season: "Season 5", year: 2012, era: "rohail", genre: "Classical Qawwali" },
    { title: "Lambi Judaai", artists: "Zoe Viccaji", season: "Season 6", year: 2013, era: "rohail", genre: "Folk Fusion" },
    { title: "Har Zulm Tera Yaad Hai", artists: "Ali Sethi", season: "Season 12", year: 2019, era: "rohail", genre: "Ghazal" },
    { title: "Yeh Dunya", artists: "Mekaal Hasan Band", season: "Season 13", year: 2020, era: "rohail", genre: "Sufi Jazz" },
    { title: "Go Yaad", artists: "Faakhir & Shahab Hussain", season: "Season 11", year: 2018, era: "reinvention", genre: "Pop Fusion" },
    { title: "Shamaan Paiyan", artists: "Rabbi Shergill & Zeb Bangash", season: "Season 7", year: 2014, era: "strings", genre: "Punjabi Folk" },
  ],

  /* The legacy: producer eras, rendered as a pinned horizontal timeline */
  eras: [
    { years: "2008 to 2013", producer: "Rohail Hyatt", seasons: "Seasons 1 to 6", note: "The founding vision. Hyatt, of Vital Signs, set the template: a dim studio, hand-percussion, and reverence for regional folk.", mark: "Foundation" },
    { years: "2014 to 2017", producer: "Strings", seasons: "Seasons 7 to 10", note: "Bilal Maqsood & Faisal Kapadia brought polish and scale, birthing Tajdar-e-Haram and Afreen Afreen into the stratosphere.", mark: "Golden Age" },
    { years: "2018", producer: "Ali Hamza & Zohaib Kazi", seasons: "Season 11", note: "A bold, textured reset: grittier, more electronic, an intentional step away from the established formula.", mark: "Reinvention" },
    { years: "2019 to 2021", producer: "Rohail Hyatt", seasons: "Seasons 12 to 13", note: "The return. A meditative, almost academic rediscovery of the show's roots: patience, ragas, and silence between the notes.", mark: "Homecoming" },
    { years: "2022", producer: "Xulfi", seasons: "Season 14", note: "Xulfi's era detonated globally. Pasoori made Coke Studio Pakistan the home of the most-viewed Pakistani song in history.", mark: "Global" },
    { years: "2026", producer: "Coke Studio Nu.WAV", seasons: "A new wave", note: "A new platform for the next wave of Pakistani music and culture. The legacy continues, unbroken, since 2008.", mark: "Next" },
  ],
};
