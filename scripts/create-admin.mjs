// One-off script to create the first Admin user.
// Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password>

import { createClient } from "@supabase/supabase-js";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error(
    "Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password>"
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Failed to create user:", error.message);
  process.exit(1);
}

const { error: profileError } = await supabase
  .from("profiles")
  .update({ role: "admin" })
  .eq("id", data.user.id);

if (profileError) {
  console.error("User created but failed to set admin role:", profileError.message);
  process.exit(1);
}

console.log(`Admin user created: ${email} (id: ${data.user.id})`);
