const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ziyrrpnftgjirhttbuvn.supabase.co';
const supabaseKey = 'sb_publishable_PNfHZKTfLod_Sk2pWqzxKw_xgaQ7oad';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateItem() {
  const { data, error } = await supabase
    .from('shop_items')
    .update({ description: 'koin akan tertarik ke arah player (10 detik).' })
    .eq('id', 2);
    
  if (error) console.error(error);
  else console.log("Updated description successfully.");
}

updateItem();
