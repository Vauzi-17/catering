import "server-only";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

/**
 * Klien Supabase untuk route handler di server.
 *
 * Memakai SUPABASE_SERVICE_ROLE_KEY yang melewati Row Level Security, jadi
 * HANYA boleh dipakai di server dan setiap route wajib memeriksa sendiri
 * siapa penggunanya (lihat penggunaDariRequest).
 */
let klien: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const kunci = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !kunci) {
    throw new GalatApi(
      503,
      "Server belum dikonfigurasi: isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  klien ??= createClient(url, kunci, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return klien;
}

export class GalatApi extends Error {
  constructor(
    public status: number,
    pesan: string,
  ) {
    super(pesan);
  }
}

/** Membaca token "Authorization: Bearer ..." dan memastikan penggunanya sah. */
export async function penggunaDariRequest(req: Request): Promise<User> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new GalatApi(401, "Silakan masuk terlebih dahulu.");
  const { data, error } = await supabaseServer().auth.getUser(token);
  if (error || !data.user) throw new GalatApi(401, "Sesi berakhir. Silakan masuk kembali.");
  return data.user;
}

export async function adalahAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseServer().from("users").select("id").eq("id", userId).maybeSingle();
  return Boolean(data);
}

/** Mengubah galat apa pun menjadi Response JSON yang rapi. */
export function jawabGalat(e: unknown): Response {
  if (e instanceof GalatApi) return Response.json({ galat: e.message }, { status: e.status });
  console.error(e);
  return Response.json({ galat: "Terjadi kesalahan di server. Coba lagi sebentar." }, { status: 500 });
}
