-- Create courts table
CREATE TABLE public.courts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  surface_type TEXT DEFAULT 'sand',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Courts are viewable by everyone"
ON public.courts FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage courts"
ON public.courts FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_courts_updated_at
BEFORE UPDATE ON public.courts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add court_id to matches table
ALTER TABLE public.matches 
ADD COLUMN court_id UUID REFERENCES public.courts(id);

-- Create index
CREATE INDEX idx_courts_is_active ON public.courts(is_active);