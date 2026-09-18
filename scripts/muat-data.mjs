/**
 * Memuat berkas data TypeScript di src/data/ sebagai objek JavaScript biasa,
 * supaya skrip pembuat SQL selalu memakai angka yang sama persis dengan yang
 * dipakai aplikasi.
 *
 * Memakai transpiler TypeScript yang memang sudah menjadi dependensi proyek,
 * bukan pemotongan teks dengan regex — cara itu gampang patah begitu ada
 * anotasi tipe yang sedikit lebih rumit.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import ts from "typescript";

const akar = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * @param {string} berkas   nama berkas di src/data, contoh "menu.ts"
 * @param {object} modulLain modul yang boleh di-impor berkas itu,
 *                           dipetakan dari penggalan jalurnya.
 *                           Contoh: { "data/menu": { menuAwal } }
 */
export function muatData(berkas, modulLain = {}) {
  const sumber = readFileSync(join(akar, "src/data", berkas), "utf8");

  const { outputText } = ts.transpileModule(sumber, {
    fileName: berkas,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const modul = { exports: {} };

  const requirePalsu = (jalur) => {
    const cocok = Object.keys(modulLain).find((kunci) => jalur.includes(kunci));
    if (cocok) return modulLain[cocok];
    // Impor tipe sudah dibuang transpiler, jadi sisanya pasti kekeliruan.
    throw new Error(`Modul tidak tersedia untuk skrip: ${jalur} (dari ${berkas})`);
  };

  new Function("exports", "require", "module", outputText)(
    modul.exports,
    requirePalsu,
    modul,
  );

  return modul.exports;
}
