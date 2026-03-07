// =============================================================
// Knowledge Base – Bidan Nisa
// Sumber: Dokumen Q&A Resmi Bidan
// Tambahkan pasangan { pertanyaan, jawaban } baru di sini
// =============================================================

const knowledgeBase = [
  // ── Kategori 1: Edukasi Dasar & Validasi ─────────────────────
  {
    kategori: "Edukasi Dasar & Validasi",
    pertanyaan: "Kenapa saya mual terus ya? Apa saya sakit parah?",
    jawaban:
      "Bunda tidak sakit parah, kok. Mual muntah (emesis) adalah tanda bahwa hormon kehamilan (HCG) Bunda sedang tinggi-tingginya. Ini kabar baik, artinya plasenta sedang bekerja keras menutrisi janin. Sekitar 80% ibu hamil merasakan hal yang sama. Bunda tidak sendirian ya!",
  },
  {
    kategori: "Edukasi Dasar & Validasi",
    pertanyaan: "Apakah muntah saya bisa menyakiti janin di dalam?",
    jawaban:
      "Sama sekali tidak, Bun. Janin terlindungi aman di dalam kantung ketuban yang penuh air. Guncangan saat Bunda muntah tidak akan mencederai bayi. Selama Bunda tetap berusaha minum sedikit-sedikit, bayi akan tetap aman mengambil cadangan nutrisi dari tubuh Bunda.",
  },
  {
    kategori: "Edukasi Dasar & Validasi",
    pertanyaan: "Sampai kapan mual ini akan berhenti? Saya capek banget.",
    jawaban:
      "Saya mengerti pasti rasanya sangat melelahkan. Umumnya, puncak mual ada di minggu ke-9. Kabar baiknya, sebagian besar ibu merasa jauh lebih lega dan nafsu makan kembali saat masuk minggu ke-16 sampai 20 (sekitar bulan ke-4). Bertahanlah sebentar lagi ya, Bunda wanita kuat!",
  },
  {
    kategori: "Edukasi Dasar & Validasi",
    pertanyaan: "Kenapa mualnya makin parah kalau pagi hari?",
    jawaban:
      "Itu karena saat bangun tidur, kadar gula darah Bunda sedang rendah-rendahnya setelah puasa semalaman. Ditambah lagi, asam lambung yang naik membuat perut terasa tidak nyaman. Istilahnya memang 'Morning Sickness', tapi wajar juga kalau terjadi sepanjang hari.",
  },
  {
    kategori: "Edukasi Dasar & Validasi",
    pertanyaan: "Apakah stres dan banyak pikiran bikin mual makin parah?",
    jawaban:
      "Betul sekali, Bun. Ada hubungan kuat antara pikiran (stres) dan lambung. Semakin Bunda cemas atau takut, otot perut makin tegang dan memicu rasa mual. Yuk, coba tarik napas panjang dan rilekskan bahu, biar perutnya juga lebih tenang.",
  },

  // ── Kategori 2: Solusi Praktis (Manajemen Nutrisi) ───────────
  {
    kategori: "Solusi Praktis (Manajemen Nutrisi)",
    pertanyaan: "Saya harus makan apa biar gak mual?",
    jawaban:
      "Kuncinya: makan 'Sedikit tapi Sering'. Jangan biarkan perut kosong. Makanlah 5-6 kali sehari dengan porsi kecil. Bunda bisa coba: Biskuit krakers asin, roti panggang, pisang, atau kentang rebus. Hindari dulu makanan bersantan atau pedas ya.",
  },
  {
    kategori: "Solusi Praktis (Manajemen Nutrisi)",
    pertanyaan: "Bangun tidur langsung mual, gimana cara cegahnya?",
    jawaban:
      "Tips jitu buat Bunda: Siapkan biskuit kering atau krakers di meja samping tempat tidur. Sebelum Bunda bangun atau turun dari kasur, makanlah 1-2 keping biskuit itu. Beri waktu 15 menit agar gula darah naik, baru bangun pelan-pelan.",
  },
  {
    kategori: "Solusi Praktis (Manajemen Nutrisi)",
    pertanyaan: "Saya gak bisa makan nasi sama sekali, bahaya gak?",
    jawaban:
      "Tidak bahaya kok. Karbohidrat tidak harus nasi. Bunda bisa ganti dengan ubi, jagung, kentang, roti gandum, atau pasta. Yang penting ada energi masuk. Jangan memaksakan makan nasi kalau baunya saja sudah bikin mual ya.",
  },
  {
    kategori: "Solusi Praktis (Manajemen Nutrisi)",
    pertanyaan: "Minum air putih saja saya muntah, solusinya apa?",
    jawaban:
      "Coba minum air dingin atau es serut, Bun. Kadang air hangat justru memicu mual. Minumlah sedikit demi sedikit (sip by sip) pakai sedotan, jangan langsung seteguk besar. Teh manis encer atau air kelapa muda juga boleh dicoba untuk ganti cairan.",
  },
  {
    kategori: "Solusi Praktis (Manajemen Nutrisi)",
    pertanyaan: "Bolehkan saya makan yang asam-asam kayak mangga muda?",
    jawaban:
      "Boleh banget! Rasa asam segar seringkali ampuh menekan rasa mual. Buah-buahan segar seperti jeruk, mangga, atau sedikit permen asam bisa membantu. Tapi ingat, jangan berlebihan ya kalau Bunda punya riwayat sakit maag.",
  },

  // ── Kategori 3: Terapi Alami (Non-Farmakologis) ──────────────
  {
    kategori: "Terapi Alami (Non-Farmakologis)",
    pertanyaan: "Ada obat alami gak buat ngurangin mual?",
    jawaban:
      "Ada, Bun! Jahe adalah sahabat ibu hamil. Riset membuktikan jahe (bisa wedang jahe hangat atau permen jahe) efektif menenangkan lambung. Cobalah minum segelas air jahe hangat di pagi atau malam hari.",
  },
  {
    kategori: "Terapi Alami (Non-Farmakologis)",
    pertanyaan: "Aromaterapi apa yang aman buat mual?",
    jawaban:
      "Bunda bisa mencoba menghirup aroma Lemon atau Peppermint. Teteskan minyak esensial di tisu, atau hirup langsung kulit buah lemon segar. Aroma segarnya mengirim sinyal ke otak untuk stop rasa mual seketika.",
  },
  {
    kategori: "Terapi Alami (Non-Farmakologis)",
    pertanyaan: "Katanya ada titik pijat buat anti mual, sebelah mana?",
    jawaban:
      "Betul, namanya titik P6 (Neiguan). Letaknya di pergelangan tangan bagian dalam, kira-kira tiga jari dari batas telapak tangan, di antara dua urat tendon. Tekan lembut titik itu selama 3-5 menit saat mual datang. Ini teknik akupresur yang terbukti ilmiah lho.",
  },
  {
    kategori: "Terapi Alami (Non-Farmakologis)",
    pertanyaan: "Apakah yoga atau olahraga ringan boleh saat mual?",
    jawaban:
      "Boleh, justru disarankan. Gerakan ringan atau jalan kaki pagi bisa membantu mengalirkan oksigen dan mengurangi hormon stres pemicu mual. Tapi lakukan pelan-pelan saja ya, jangan sampai kelelahan.",
  },
  {
    kategori: "Terapi Alami (Non-Farmakologis)",
    pertanyaan: "Kalau mualnya karena bau masakan suami/orang rumah gimana?",
    jawaban:
      "Ini wajar karena indra penciuman Bunda jadi sensitif. Solusinya: Buka jendela lebar-lebar agar sirkulasi udara lancar. Hindari dapur saat jam memasak, dan minta tolong Suami untuk pengertian tidak masak yang baunya menyengat dulu ya.",
  },

  // ── Kategori 4: Tanda Bahaya (Triage Medis) ─────────────────
  {
    kategori: "Tanda Bahaya (Triage Medis)",
    pertanyaan: "Kapan saya harus segera ke dokter?",
    jawaban:
      "Waspada ya Bun. Segera ke Bidan/Dokter jika: 1. Muntah terus menerus lebih dari 5 kali sehari. 2. Tidak bisa makan/minum sama sekali dalam 24 jam. 3. Berat badan turun drastis. 4. Merasa sangat lemas atau mau pingsan. Ini tanda Bunda butuh cairan infus.",
  },
  {
    kategori: "Tanda Bahaya (Triage Medis)",
    pertanyaan: "Air kencing saya warnanya kuning pekat, bahayakah?",
    jawaban:
      "Itu tanda peringatan Bunda mulai dehidrasi (kurang cairan). Segera coba minum cairan elektrolit (oralit atau air kelapa) sedikit-sedikit. Jika tetap tidak bisa kencing atau warnanya makin gelap lebih dari 6 jam, segera periksa ya.",
  },
  {
    kategori: "Tanda Bahaya (Triage Medis)",
    pertanyaan: "Saya muntah sampai keluar darah sedikit, gimana ini?",
    jawaban:
      "Jangan panik dulu. Kadang muntah hebat bikin lecet di tenggorokan (kerongkongan). Tapi untuk memastikannya, sebaiknya Bunda periksa ke dokter sekarang juga ya, untuk dilihat apakah butuh obat pelapis lambung.",
  },
  {
    kategori: "Tanda Bahaya (Triage Medis)",
    pertanyaan: "Apakah mual parah ini tanda anak saya kembar?",
    jawaban:
      "Bisa jadi! Kehamilan kembar memang menghasilkan hormon HCG lebih tinggi, yang seringkali bikin mualnya lebih dahsyat ('double trouble'). Tapi untuk pastinya, kita tunggu hasil USG ya Bun.",
  },
  {
    kategori: "Tanda Bahaya (Triage Medis)",
    pertanyaan:
      "Saya sedih banget karena gak bisa ngapa-ngapain, saya ibu yang buruk?",
    jawaban:
      "Ssst, jangan bicara begitu. Bunda sedang berjuang hebat membentuk manusia baru lho! Istirahat total saat ini adalah tugas mulia Bunda. Jangan merasa bersalah karena rebahan. Tubuh Bunda butuh energi itu untuk si Kecil. Semangat ya!",
  },
];

export default knowledgeBase;
