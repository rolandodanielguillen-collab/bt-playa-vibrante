-- Create function to update group standings when a match is completed
CREATE OR REPLACE FUNCTION public.update_group_standings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points_for_win INTEGER := 3;
  points_for_loss INTEGER := 0;
BEGIN
  -- Only process if the match is completed and has a group_id
  IF NEW.status = 'completed' AND NEW.group_id IS NOT NULL AND NEW.winner_team_id IS NOT NULL THEN
    -- Update winner stats
    UPDATE group_teams
    SET 
      matches_played = matches_played + 1,
      matches_won = matches_won + 1,
      points = points + points_for_win
    WHERE group_id = NEW.group_id AND team_id = NEW.winner_team_id;
    
    -- Determine loser and update their stats
    IF NEW.winner_team_id = NEW.team1_id THEN
      UPDATE group_teams
      SET 
        matches_played = matches_played + 1,
        matches_lost = matches_lost + 1,
        points = points + points_for_loss
      WHERE group_id = NEW.group_id AND team_id = NEW.team2_id;
    ELSE
      UPDATE group_teams
      SET 
        matches_played = matches_played + 1,
        matches_lost = matches_lost + 1,
        points = points + points_for_loss
      WHERE group_id = NEW.group_id AND team_id = NEW.team1_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update standings when match status changes to completed
CREATE TRIGGER on_match_completed
AFTER UPDATE OF status ON public.matches
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
EXECUTE FUNCTION public.update_group_standings();

-- Also add games_won and games_lost for tie-breaker scenarios
ALTER TABLE public.group_teams 
ADD COLUMN IF NOT EXISTS games_won INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS games_lost INTEGER NOT NULL DEFAULT 0;