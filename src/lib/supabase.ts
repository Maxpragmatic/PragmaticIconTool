import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://otarwojevqlwwzbltume.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90YXJ3b2pldnFsd3d6Ymx0dW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTkzNDksImV4cCI6MjA2ODc3NTM0OX0.SP0dM16dN4zpELr1wcjzLpsTsf6vLd51UckqhICKFik';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const PRAGMATIC_ICON_BUCKET = 'pragmatic-icon'; 