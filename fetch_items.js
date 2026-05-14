const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ziyrrpnftgjirhttbuvn.supabase.co';
const supabaseKey = 'sb_publishable_PNfHZKTfLod_Sk2pWqzxKw_xgaQ7oad';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInventory() {
  const { data, error } = await supabase.from('user_inventory').select('*').limit(5);
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

checkInventory();
