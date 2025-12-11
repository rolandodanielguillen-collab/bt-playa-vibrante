-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  min_age INTEGER,
  max_age INTEGER,
  gender TEXT CHECK (gender IN ('masculino', 'femenino', 'mixto')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" 
ON public.categories FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  document_number TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('masculino', 'femenino')),
  city TEXT,
  category_id UUID REFERENCES public.categories(id),
  ranking_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- RLS policies for players
CREATE POLICY "Players are viewable by everyone" 
ON public.players FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create players" 
ON public.players FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Players can update their own data or admins" 
ON public.players FOR UPDATE 
USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete players" 
ON public.players FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Add category_id to tournaments table
ALTER TABLE public.tournaments ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Create trigger for players updated_at
CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();