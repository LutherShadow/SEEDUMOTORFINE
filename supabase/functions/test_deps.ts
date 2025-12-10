
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

console.log("Supabase JS imported successfully");

try {
    const url = Deno.env.get('SUPABASE_URL') || 'https://example.com';
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'example-key';
    const client = createClient(url, key);
    console.log("Supabase Client created");
} catch (e) {
    console.error("Error creating client:", e);
}
