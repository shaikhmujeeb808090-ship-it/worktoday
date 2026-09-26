const SUPABASE_URL = "https://jyttrouqlkuoxdhgcdkl.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_psAw5SPc15J3FLmweScpVQ_48HcaIum";

if (
    typeof window.supabase === "undefined" ||
    typeof window.supabase.createClient !== "function"
) {
    console.error("Supabase library load nahi hui.");
} else {
    window.supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    console.log("WorkToday Supabase connected successfully.");
}