-- ===========================================================================
-- Asri Catering — Isi menu dalam bahasa Inggris
--
-- Jalankan SETELAH 03-seed.sql. Aman dijalankan ulang.
--
-- Menambah kolom opsional nama_en, deskripsi_en, deskripsi_panjang_en, dan
-- isi_en pada menus. Situs memakai versi Inggris saat pengunjung memilih EN;
-- kolom yang kosong otomatis jatuh ke teks bahasa Indonesia. Menu baru bisa
-- diisi versi Inggrisnya dari Panel Admin → Menu → Ubah.
--
-- Terjemahan hanya diisi bila teks bahasa Indonesianya masih sama dengan
-- bawaan. Kolom yang sudah disunting di panel admin dibiarkan kosong supaya
-- versi Inggrisnya tidak menggambarkan isi yang berbeda.
-- ===========================================================================

alter table public.menus
  add column if not exists nama_en              text   not null default '',
  add column if not exists deskripsi_en         text   not null default '',
  add column if not exists deskripsi_panjang_en text   not null default '',
  add column if not exists isi_en               text[] not null default '{}';

update public.menus set
  nama_en              = case when nama = 'Paket Nasi Kuning Bento Royal' then 'Royal Yellow Rice Bento' else nama_en end,
  deskripsi_en         = case when deskripsi = 'Nasi kuning gurih, ayam bakar madu, mi goreng, sambal goreng kentang, dan telur dadar iris dalam kotak bento bersekat.' then 'Savoury yellow rice, honey grilled chicken, fried noodles, spicy potato, and sliced omelette in a compartment bento box.' else deskripsi_en end,
  deskripsi_panjang_en = case when deskripsi_panjang = 'Menu andalan untuk syukuran, ulang tahun kantor, dan jamuan tamu. Nasi kuning dimasak dengan santan dan kunyit segar, disajikan bersama ayam bakar olesan madu kecap, mi goreng jawa, sambal goreng kentang, telur dadar iris, sambal, dan kerupuk. Dikemas dalam kotak bento bersekat supaya lauk tidak saling bercampur selama pengantaran.' then 'Our signature for thanksgivings, office birthdays, and hosting guests. Yellow rice is cooked with coconut milk and fresh turmeric, served with chicken grilled in honey-soy glaze, Javanese fried noodles, spicy fried potato, sliced omelette, chilli sauce, and crackers. Packed in a compartment bento box so the dishes stay separate on the way.' else deskripsi_panjang_en end,
  isi_en               = case when isi = array['Nasi kuning santan', 'Ayam bakar madu kecap', 'Mi goreng jawa', 'Sambal goreng kentang', 'Telur dadar iris', 'Sambal & kerupuk']::text[] then array['Coconut yellow rice', 'Honey-soy grilled chicken', 'Javanese fried noodles', 'Spicy fried potato', 'Sliced omelette', 'Chilli sauce & crackers']::text[] else isi_en end
where slug = 'paket-nasi-kuning-bento-royal';

update public.menus set
  nama_en              = case when nama = 'Paket Nasi Kotak Acara Kantor' then 'Office Event Rice Box' else nama_en end,
  deskripsi_en         = case when deskripsi = 'Nasi pulen, ayam goreng lengkuas, tahu tempe bacem, oseng buncis wortel, sambal, dan lalapan.' then 'Fluffy rice, galangal fried chicken, sweet braised tofu and tempeh, stir-fried green beans and carrots, chilli sauce, and fresh vegetables.' else deskripsi_en end,
  deskripsi_panjang_en = case when deskripsi_panjang = 'Paket yang paling sering dipesan untuk rapat, pelatihan, dan acara kantor. Nasi putih pandan wangi disajikan bersama ayam goreng lengkuas, tahu tempe bacem, oseng buncis wortel, lalapan, sambal, dan kerupuk. Porsi dan rasa dijaga sama dari box pertama sampai box terakhir.' then 'Our most ordered package for meetings, trainings, and office events. Fragrant pandan rice is served with galangal fried chicken, sweet braised tofu and tempeh, stir-fried green beans and carrots, fresh vegetables, chilli sauce, and crackers. Portion and taste stay the same from the first box to the last.' else deskripsi_panjang_en end,
  isi_en               = case when isi = array['Nasi putih pandan wangi', 'Ayam goreng lengkuas', 'Tahu tempe bacem', 'Oseng buncis wortel', 'Lalapan & sambal', 'Kerupuk']::text[] then array['Fragrant pandan rice', 'Galangal fried chicken', 'Sweet braised tofu & tempeh', 'Stir-fried green beans & carrots', 'Fresh vegetables & chilli sauce', 'Crackers']::text[] else isi_en end
where slug = 'paket-nasi-kotak-acara-kantor';

update public.menus set
  nama_en              = case when nama = 'Paket Nasi Kotak Rendang VIP' then 'VIP Beef Rendang Rice Box' else nama_en end,
  deskripsi_en         = case when deskripsi = 'Rendang sapi yang dimasak empat jam, udang balado, tumis sayur, pisang, dan air mineral.' then 'Beef rendang slow-cooked for four hours, spicy balado prawns, sautéed vegetables, banana, and bottled water.' else deskripsi_en end,
  deskripsi_panjang_en = case when deskripsi_panjang = 'Paket premium untuk jamuan resmi, pernikahan, dan tamu penting. Rendang sapi dimasak perlahan kurang lebih empat jam sampai bumbu meresap dan daging empuk, disajikan bersama nasi putih, udang balado, tumis sayur, buah pisang, dan air mineral gelas. Satu kotak sudah lengkap tanpa perlu tambahan minuman.' then 'A premium package for formal dinners, weddings, and important guests. Beef rendang is slow-cooked for about four hours until the spices soak in and the meat is tender, served with white rice, spicy balado prawns, sautéed vegetables, a banana, and a cup of mineral water. One box is complete with no extra drinks needed.' else deskripsi_panjang_en end,
  isi_en               = case when isi = array['Nasi putih pandan wangi', 'Rendang sapi', 'Udang balado', 'Tumis sayur', 'Buah pisang', 'Air mineral gelas']::text[] then array['Fragrant pandan rice', 'Beef rendang', 'Balado prawns', 'Sautéed vegetables', 'Banana', 'Cup of mineral water']::text[] else isi_en end
where slug = 'paket-nasi-kotak-rendang-vip';

update public.menus set
  nama_en              = case when nama = 'Paket Nasi Kotak Nila Bakar Rica' then 'Grilled Tilapia Rica Rice Box' else nama_en end,
  deskripsi_en         = case when deskripsi = 'Ikan nila bakar bumbu rica, tempe goreng, lalapan selada dan timun, serta sambal matah.' then 'Tilapia grilled with spicy rica seasoning, fried tempeh, lettuce and cucumber, and sambal matah.' else deskripsi_en end,
  deskripsi_panjang_en = case when deskripsi_panjang = 'Ikan nila segar ukuran sedang dibakar dengan bumbu rica hingga harum, disajikan bersama nasi putih, tempe goreng, lalapan selada dan timun, serta sambal matah. Pilihan untuk tamu yang menghindari daging merah.' then 'Fresh medium-sized tilapia grilled with rica spices until fragrant, served with white rice, fried tempeh, lettuce and cucumber, and Balinese sambal matah. A good choice for guests who avoid red meat.' else deskripsi_panjang_en end,
  isi_en               = case when isi = array['Nasi putih pandan wangi', 'Nila bakar bumbu rica', 'Tempe goreng', 'Lalapan selada & timun', 'Sambal matah']::text[] then array['Fragrant pandan rice', 'Rica grilled tilapia', 'Fried tempeh', 'Lettuce & cucumber', 'Sambal matah']::text[] else isi_en end
where slug = 'paket-nasi-kotak-nila-bakar';

update public.menus set
  nama_en              = case when nama = 'Tumpeng Mini' then 'Mini Tumpeng' else nama_en end,
  deskripsi_en         = case when deskripsi = 'Tumpeng nasi kuning ukuran kecil untuk 5-7 orang. Cocok untuk syukuran sederhana.' then 'A small yellow rice tumpeng for 5–7 people. Perfect for a simple thanksgiving.' else deskripsi_en end,
  deskripsi_panjang_en = case when deskripsi_panjang = 'Tumpeng nasi kuning setinggi kurang lebih 20 cm di atas tampah bambu berhias daun pisang. Dilengkapi tujuh lauk pendamping: ayam ungkep, telur balado, tempe orek, mi goreng, urap sayur, perkedel kentang, dan sambal goreng. Cukup untuk 5 sampai 7 orang.' then 'A yellow rice cone about 20 cm tall on a bamboo tray lined with banana leaves. Comes with seven side dishes: braised chicken, balado egg, sweet tempeh, fried noodles, vegetable urap, potato fritters, and spicy sambal goreng. Enough for 5 to 7 people.' else deskripsi_panjang_en end,
  isi_en               = case when isi = array['Nasi kuning tampah bambu', 'Ayam ungkep', 'Telur balado', 'Tempe orek', 'Mi goreng', 'Urap sayur', 'Perkedel kentang']::text[] then array['Yellow rice on a bamboo tray', 'Braised chicken', 'Balado egg', 'Sweet tempeh', 'Fried noodles', 'Vegetable urap', 'Potato fritters']::text[] else isi_en end
where slug = 'tumpeng-mini';

update public.menus set
  nama_en              = case when nama = 'Snack Box Isi 3' then 'Snack Box (3 Treats)' else nama_en end,
  deskripsi_en         = case when deskripsi = 'Tiga jajanan pasar rumahan dalam satu dus, ditambah air mineral gelas.' then 'Three homemade traditional snacks in one box, plus a cup of mineral water.' else deskripsi_en end,
  deskripsi_panjang_en = case when deskripsi_panjang = 'Berisi tiga jenis kue pilihan hari itu, misalnya risoles, lemper, dan bolu kukus, ditambah satu air mineral gelas. Semua kue dibuat pagi hari sebelum dikirim sehingga tekstur tetap lembut.' then 'Contains three of the day''s snacks, such as risoles, lemper, and steamed sponge cake, plus a cup of mineral water. Everything is made in the morning before delivery so the texture stays soft.' else deskripsi_panjang_en end,
  isi_en               = case when isi = array['3 jenis kue pilihan', 'Air mineral gelas', 'Dus snack + tisu']::text[] then array['3 assorted snacks', 'Cup of mineral water', 'Snack box + tissue']::text[] else isi_en end
where slug = 'snack-box-isi-3';
