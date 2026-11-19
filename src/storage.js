const { createClient } = require('@supabase/supabase-js');

// Khoi tao tre de import app khong can key Supabase.
let client;
function bucket() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error('Thieu SUPABASE_URL hoac SUPABASE_SERVICE_KEY');
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return client.storage.from('attachments');
}

module.exports = { bucket };
