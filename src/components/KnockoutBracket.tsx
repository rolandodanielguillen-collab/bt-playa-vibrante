import { Card } from "@/components/ui/card";
import { Trophy, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface BracketMatch {
  team1: string;
  team2: string;
  score?: string;
  winner?: 1 | 2;
}

interface KnockoutBracketProps {
  quarterfinals: BracketMatch[];
  semifinals: BracketMatch[];
  final: BracketMatch;
  champion?: {
    name: string;
    score: string;
  };
}

// Format player name: first name uppercase, last name below
const formatPlayerName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return {
      firstName: parts[0].toUpperCase(),
      lastName: parts.slice(1).join(" ")
    };
  }
  return { firstName: fullName.toUpperCase(), lastName: "" };
};

// Parse team name into two players
const parseTeamPlayers = (name: string): { player1: { firstName: string; lastName: string }; player2: { firstName: string; lastName: string } | null } => {
  // Handle multiline names (newline separated)
  const lines = name.split('\n');
  if (lines.length >= 2) {
    return {
      player1: formatPlayerName(lines[0]),
      player2: formatPlayerName(lines[1])
    };
  }
  // Handle " / " separated pairs
  const parts = name.split(" / ");
  if (parts.length === 2) {
    return {
      player1: formatPlayerName(parts[0]),
      player2: formatPlayerName(parts[1])
    };
  }
  // Single player
  return {
    player1: formatPlayerName(name),
    player2: null
  };
};

// Stacked team name display
const StackedTeamName = ({ name, isWinner, compact = false }: { name: string; isWinner: boolean; compact?: boolean }) => {
  const { player1, player2 } = parseTeamPlayers(name);
  
  return (
    <div className="flex flex-col gap-0">
      <div className="flex flex-col">
        <span className={`${compact ? 'text-[8px]' : 'text-[9px]'} md:text-[10px] font-semibold leading-tight ${isWinner ? 'text-primary' : 'text-foreground'}`}>
          {player1.firstName}
        </span>
        {player1.lastName && (
          <span className={`${compact ? 'text-[6px]' : 'text-[7px]'} md:text-[8px] text-muted-foreground leading-tight`}>
            {player1.lastName}
          </span>
        )}
      </div>
      {player2 && (
        <div className="flex flex-col mt-0.5">
          <span className={`${compact ? 'text-[8px]' : 'text-[9px]'} md:text-[10px] font-semibold leading-tight ${isWinner ? 'text-primary' : 'text-foreground'}`}>
            {player2.firstName}
          </span>
          {player2.lastName && (
            <span className={`${compact ? 'text-[6px]' : 'text-[7px]'} md:text-[8px] text-muted-foreground leading-tight`}>
              {player2.lastName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const MatchCard = ({ match, idx, showNumber, variant = "default" }: { 
  match: BracketMatch; 
  idx: number; 
  showNumber?: boolean;
  variant?: "default" | "final";
}) => (
  <Card
    className={`p-2 transition-all border-l-4 ${
      variant === "final" 
        ? "border-l-primary bg-gradient-to-r from-primary/10 to-transparent min-w-[120px]" 
        : match.winner === 1
          ? "border-l-primary bg-primary/5 min-w-[110px]"
          : match.winner === 2
            ? "border-l-primary bg-primary/5 min-w-[110px]"
            : "border-l-border min-w-[110px]"
    }`}
  >
    <div className="space-y-1">
      <div className={`${match.winner === 1 ? '' : ''}`}>
        {showNumber && <span className="text-[8px] text-muted-foreground">{idx + 1}.</span>}
        <StackedTeamName name={match.team1} isWinner={match.winner === 1} compact />
      </div>
      {match.score && (
        <div className="text-[8px] md:text-[10px] text-center text-muted-foreground font-mono py-0.5 border-y border-border/30">
          {match.score}
        </div>
      )}
      <div>
        {showNumber && <span className="text-[8px] text-muted-foreground">{idx + 2}.</span>}
        <StackedTeamName name={match.team2} isWinner={match.winner === 2} compact />
      </div>
    </div>
  </Card>
);

const ChampionCard = ({ champion }: { champion: { name: string; score: string } }) => (
  <Card className="p-2 md:p-3 border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-background to-yellow-500/5 shadow-xl min-w-[120px] md:min-w-[140px]">
    <div className="flex flex-col items-center text-center space-y-1 h-full justify-center">
      <div className="p-1 md:p-1.5 bg-yellow-500/20 rounded-full">
        <Trophy className="w-4 h-4 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
      </div>
      <div>
        <h3 className="text-[8px] md:text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wide">
          🏆 Campeones
        </h3>
        <div className="mt-1">
          <StackedTeamName name={champion.name} isWinner={false} />
        </div>
        {champion.score && (
          <p className="text-[8px] md:text-[10px] text-muted-foreground font-mono mt-0.5">
            {champion.score}
          </p>
        )}
      </div>
    </div>
  </Card>
);

const ConnectionLine = ({ isMobile }: { isMobile: boolean }) => (
  <div className={`flex items-center justify-center ${isMobile ? 'px-1' : ''}`}>
    <ChevronRight className={`text-muted-foreground ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
  </div>
);

export const KnockoutBracket = ({ quarterfinals, semifinals, final, champion }: KnockoutBracketProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      {/* Champion prominently displayed on mobile */}
      {isMobile && champion && (
        <div className="flex justify-center mb-4">
          <ChampionCard champion={champion} />
        </div>
      )}

      {/* Swipe indicator for mobile */}
      {isMobile && (
        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mb-2">
          <ChevronRight className="w-3 h-3" />
          <span>Desliza para ver el bracket completo</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      )}

      {/* Horizontal scrolling bracket */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex items-center gap-1 md:gap-4 min-w-max justify-start md:justify-center">
          {/* Quarterfinals */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] md:text-sm font-bold text-center text-foreground">Cuartos</h3>
            <div className="flex flex-col gap-2">
              {quarterfinals.map((match, idx) => (
                <MatchCard key={idx} match={match} idx={idx} showNumber />
              ))}
            </div>
          </div>

          <ConnectionLine isMobile={isMobile} />

          {/* Semifinals */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] md:text-sm font-bold text-center text-foreground">Semis</h3>
            <div className="flex flex-col gap-2">
              {semifinals.map((match, idx) => (
                <MatchCard key={idx} match={match} idx={idx} />
              ))}
            </div>
          </div>

          <ConnectionLine isMobile={isMobile} />

          {/* Final */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] md:text-sm font-bold text-center text-foreground">Final</h3>
            <MatchCard match={final} idx={0} variant="final" />
            
            {/* Champion on desktop only (mobile shows at top) */}
            {!isMobile && champion && (
              <ChampionCard champion={champion} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
