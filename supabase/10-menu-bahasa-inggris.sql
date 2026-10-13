-- ===========================================================================
-- Asri Catering — Isi menu dalam bahasa Inggris
--
-- Jalankan SETELAH 03-seed.sql. Aman dijalankan ulang.
--
-- Menambah kolom opsional nama_en, deskripsi_en, deskripsi_panjang_en, dan
-- isi_en pada menus. Situs memakai versi Inggris saat pengunjung memilih EN;
-- kolom yang kosong otomatis jatuh ke teks bahasa Indonesia. Menu baru bisa
-- diisi versi Inggrisnya dari Panel Admin → Menu → Ubah.
-- ===========================================================================

alter table public.menus
  add column if not exists nama_en              text   not null default '',
  add column if not exists deskripsi_en         text   not null default '',
  add column if not exists deskripsi_panjang_en text   not null default '',
  add column if not exists isi_en               text[] not null default '{}';

update public.menus set
  nama_en = 'Royal Yellow Rice Bento',
  deskripsi_en = 'Savoury yellow rice, honey grilled chicken, fried noodles, spicy potato, and sliced omelette in a compartment bento box.',
  deskripsi_panjang_en = 'Our signature for thanksgivings, office birthdays, and hosting guests. Yellow rice is cooked with coconut milk and fresh turmeric, served with chicken grilled in honey-soy glaze, Javanese fried noodles, spicy fried potato, sliced omelette, chilli sauce, and crackers. Packed in a compartment bento box so the dishes stay separate on the way.',
  isi_en = array['Coconut yellow rice', 'Honey-soy grilled chicken', 'Javanese fried noodles', 'Spicy fried potato', 'Sliced omelette', 'Chilli sauce & crackers']
where slug = 'paket-nasi-kuning-bento-royal';

update public.menus set
  nama_en = 'Office Event Rice Box',
  deskripsi_en = 'Fluffy rice, galangal fried chicken, sweet braised tofu and tempeh, stir-fried green beans and carrots, chilli sauce, and fresh vegetables.',
  deskripsi_panjang_en = 'Our most ordered package for meetings, trainings, and office events. Fragrant pandan rice is served with galangal fried chicken, sweet braised tofu and tempeh, stir-fried green beans and carrots, fresh vegetables, chilli sauce, and crackers. Portion and taste stay the same from the first box to the last.',
  isi_en = array['Fragrant pandan rice', 'Galangal fried chicken', 'Sweet braised tofu & tempeh', 'Stir-fried green beans & carrots', 'Fresh vegetables & chilli sauce', 'Crackers']
where slug = 'paket-nasi-kotak-acara-kantor';

update public.menus set
  nama_en = 'VIP Beef Rendang Rice Box',
  deskripsi_en = 'Beef rendang slow-cooked for four hours, spicy balado prawns, sautéed vegetables, banana, and bottled water.',
  deskripsi_panjang_en = 'A premium package for formal dinners, weddings, and important guests. Beef rendang is slow-cooked for about four hours until the spices soak in and the meat is tender, served with white rice, spicy balado prawns, sautéed vegetables, a banana, and a cup of mineral water. One box is complete with no extra drinks needed.',
  isi_en = array['Fragrant pandan rice', 'Beef rendang', 'Balado prawns', 'Sautéed vegetables', 'Banana', 'Cup of mineral water']
where slug = 'paket-nasi-kotak-rendang-vip';

update public.menus set
  nama_en = 'Grilled Tilapia Rica Rice Box',
  deskripsi_en = 'Tilapia grilled with spicy rica seasoning, fried tempeh, lettuce and cucumber, and sambal matah.',
  deskripsi_panjang_en = 'Fresh medium-sized tilapia grilled with rica spices until fragrant, served with white rice, fried tempeh, lettuce and cucumber, and Balinese sambal matah. A good choice for guests who avoid red meat.',
  isi_en = array['Fragrant pandan rice', 'Rica grilled tilapia', 'Fried tempeh', 'Lettuce & cucumber', 'Sambal matah']
where slug = 'paket-nasi-kotak-nila-bakar';

update public.menus set
  nama_en = 'Mini Tumpeng',
  deskripsi_en = 'A small yellow rice tumpeng for 5–7 people. Perfect for a simple thanksgiving.',
  deskripsi_panjang_en = 'A yellow rice cone about 20 cm tall on a bamboo tray lined with banana leaves. Comes with seven side dishes: braised chicken, balado egg, sweet tempeh, fried noodles, vegetable urap, potato fritters, and spicy sambal goreng. Enough for 5 to 7 people.',
  isi_en = array['Yellow rice on a bamboo tray', 'Braised chicken', 'Balado egg', 'Sweet tempeh', 'Fried noodles', 'Vegetable urap', 'Potato fritters']
where slug = 'tumpeng-mini';

update public.menus set
  nama_en = 'Snack Box (3 Treats)',
  deskripsi_en = 'Three homemade traditional snacks in one box, plus a cup of mineral water.',
  deskripsi_panjang_en = 'Contains three of the day''s snacks, such as risoles, lemper, and steamed sponge cake, plus a cup of mineral water. Everything is made in the morning before delivery so the texture stays soft.',
  isi_en = array['3 assorted snacks', 'Cup of mineral water', 'Snack box + tissue']
where slug = 'snack-box-isi-3';
