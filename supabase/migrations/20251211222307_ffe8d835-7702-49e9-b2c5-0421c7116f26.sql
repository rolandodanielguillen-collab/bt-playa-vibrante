-- Add whatsapp_group to profiles for community group link
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_group TEXT,
ADD COLUMN IF NOT EXISTS document_number TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('masculino', 'femenino'));

-- Create tournament_participants view/table to track tournament history with partner and stage reached
CREATE TABLE public.tournament_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id),
  partner_name TEXT,
  stage_reached TEXT NOT NULL DEFAULT 'groups',
  final_position INTEGER,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tournament_id)
);

-- Enable RLS
ALTER TABLE public.tournament_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Tournament history is viewable by everyone" 
ON public.tournament_history FOR SELECT USING (true);

CREATE POLICY "Users can insert their own history" 
ON public.tournament_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all history" 
ON public.tournament_history FOR ALL 
USING (has_role(auth.uid(), 'admin'));