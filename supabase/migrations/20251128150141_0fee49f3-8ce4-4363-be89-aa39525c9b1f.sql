-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'judge', 'player', 'spectator');

-- Create enum for tournament status
CREATE TYPE public.tournament_status AS ENUM ('draft', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled');

-- Create enum for match status
CREATE TYPE public.match_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Create enum for registration status
CREATE TYPE public.registration_status AS ENUM ('pending_payment', 'paid', 'confirmed', 'cancelled');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  max_teams INTEGER NOT NULL,
  entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  status tournament_status NOT NULL DEFAULT 'draft',
  category TEXT NOT NULL,
  image_url TEXT,
  rules_url TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  player1_name TEXT NOT NULL,
  player1_email TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  player2_email TEXT NOT NULL,
  captain_user_id UUID REFERENCES public.profiles(id),
  city TEXT,
  ranking_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  status registration_status NOT NULL DEFAULT 'pending_payment',
  registered_by UUID REFERENCES public.profiles(id) NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  UNIQUE(tournament_id, team_id)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_reference TEXT,
  payment_date TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create group_teams table (many-to-many)
CREATE TABLE public.group_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  seed_position INTEGER,
  points INTEGER NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  matches_lost INTEGER NOT NULL DEFAULT 0,
  UNIQUE(group_id, team_id)
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  round TEXT NOT NULL,
  match_number INTEGER NOT NULL,
  team1_id UUID REFERENCES public.teams(id),
  team2_id UUID REFERENCES public.teams(id),
  team1_score INTEGER,
  team2_score INTEGER,
  winner_team_id UUID REFERENCES public.teams(id),
  scheduled_time TIMESTAMPTZ,
  court_number TEXT,
  status match_status NOT NULL DEFAULT 'scheduled',
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user is admin or judge
CREATE OR REPLACE FUNCTION public.is_admin_or_judge(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'judge')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Roles are viewable by everyone"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tournaments
CREATE POLICY "Tournaments are viewable by everyone"
  ON public.tournaments FOR SELECT
  USING (true);

CREATE POLICY "Only admins can create tournaments"
  ON public.tournaments FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update tournaments"
  ON public.tournaments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete tournaments"
  ON public.tournaments FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for teams
CREATE POLICY "Teams are viewable by everyone"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Team captains and admins can update teams"
  ON public.teams FOR UPDATE
  USING (captain_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for registrations
CREATE POLICY "Registrations are viewable by everyone"
  ON public.registrations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create registrations"
  ON public.registrations FOR INSERT
  WITH CHECK (auth.uid() = registered_by);

CREATE POLICY "Admins can update registrations"
  ON public.registrations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.id = registration_id AND r.registered_by = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authenticated users can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can update payments"
  ON public.payments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for groups
CREATE POLICY "Groups are viewable by everyone"
  ON public.groups FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage groups"
  ON public.groups FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for group_teams
CREATE POLICY "Group teams are viewable by everyone"
  ON public.group_teams FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage group teams"
  ON public.group_teams FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for matches
CREATE POLICY "Matches are viewable by everyone"
  ON public.matches FOR SELECT
  USING (true);

CREATE POLICY "Only admins can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins and judges can update matches"
  ON public.matches FOR UPDATE
  USING (public.is_admin_or_judge(auth.uid()));

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign spectator role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'spectator');
  
  RETURN new;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournaments_start_date ON public.tournaments(start_date);
CREATE INDEX idx_registrations_tournament_id ON public.registrations(tournament_id);
CREATE INDEX idx_registrations_team_id ON public.registrations(team_id);
CREATE INDEX idx_registrations_status ON public.registrations(status);
CREATE INDEX idx_payments_registration_id ON public.payments(registration_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_matches_tournament_id ON public.matches(tournament_id);
CREATE INDEX idx_matches_group_id ON public.matches(group_id);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_group_teams_group_id ON public.group_teams(group_id);
CREATE INDEX idx_group_teams_team_id ON public.group_teams(team_id);