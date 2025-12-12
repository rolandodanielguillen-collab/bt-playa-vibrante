-- Create junction table for tournament-category many-to-many relationship
CREATE TABLE public.tournament_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, category_id)
);

-- Enable RLS
ALTER TABLE public.tournament_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Tournament categories are viewable by everyone"
ON public.tournament_categories
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage tournament categories"
ON public.tournament_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for better query performance
CREATE INDEX idx_tournament_categories_tournament ON public.tournament_categories(tournament_id);
CREATE INDEX idx_tournament_categories_category ON public.tournament_categories(category_id);