import { supabase } from './src/lib/supabase.js';

async function testInsert() {
  console.log("Testing insert...");
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      title: "Test Session",
      status: "scheduled"
    })
    .select()
    .single();

  console.log("Error:", error);
  console.log("Data:", data);
}

testInsert();
