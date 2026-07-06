const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const targetEmail = 'care.msgreplier@gmail.com';
  console.log(`Checking if ${targetEmail} exists in Supabase Auth...`);
  
  // List users with paging to search for the email
  let page = 1;
  let found = false;
  let hasMore = true;
  
  while (hasMore) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: 100
    });
    
    if (error) {
      console.error("Error listing users:", error);
      break;
    }
    
    const users = data.users || [];
    if (users.length === 0) {
      break;
    }
    
    const matchedUser = users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
    if (matchedUser) {
      console.log(`User FOUND:`);
      console.log(`- Email: ${matchedUser.email}`);
      console.log(`- ID: ${matchedUser.id}`);
      console.log(`- Confirmed At: ${matchedUser.email_confirmed_at}`);
      console.log(`- Created At: ${matchedUser.created_at}`);
      found = true;
      break;
    }
    
    page++;
    if (users.length < 100) {
      hasMore = false;
    }
  }
  
  if (!found) {
    console.log(`User ${targetEmail} NOT found in Supabase Auth.`);
  }
}

main();
