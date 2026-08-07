import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env file manually
const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

const supabaseUrl = envVars["VITE_SUPABASE_URL"] || "https://xqoqmkvqtnbhedftpyme.supabase.co";
const supabaseKey = envVars["VITE_SUPABASE_ANON_KEY"] || "";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key length:", supabaseKey.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
  console.log("Checking Supabase Storage buckets...");
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error("Error listing buckets:", error);
    return;
  }
  
  console.log("Existing Buckets:", buckets);
  
  const materialsBucket = buckets.find(b => b.name === "materials");
  if (!materialsBucket) {
    console.log("Creating 'materials' bucket...");
    const { data, error: createError } = await supabase.storage.createBucket("materials", {
      public: true
    });
    
    if (createError) {
      console.error("Error creating bucket:", createError);
    } else {
      console.log("Successfully created 'materials' bucket!", data);
    }
  } else {
    console.log("'materials' bucket already exists. Is it public?", materialsBucket.public);
    if (!materialsBucket.public) {
      console.log("Updating 'materials' bucket to be public...");
      const { data, error: updateError } = await supabase.storage.updateBucket("materials", {
        public: true
      });
      if (updateError) {
        console.error("Error making bucket public:", updateError);
      } else {
        console.log("Successfully set 'materials' bucket to public!");
      }
    }
  }
}

checkStorage();
