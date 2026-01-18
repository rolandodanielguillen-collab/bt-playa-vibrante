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

// Truncate team name for mobile
const truncateTeam = (name: string, isMobile: boolean) => {
  if (!isMobile) return name;
  // Handle multiline names
  const lines = name.split('\n');
  if (lines.length > 1) {
    return lines.map(line => {
      const parts = line.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}. ${parts[parts.length - 1]}`;
      }
      return line.length > 12 ? line.substring(0, 10) + "..." : line;
    }).join('\n');
  }
  // Handle single line with pairs
  const parts = name.split(" / ");
  if (parts.length === 2) {
    return parts.map(p => {
      const nameParts = p.trim().split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}. ${nameParts[nameParts.length - 1]}`;
      }
      return p.length > 10 ? p.substring(0, 10) + "..." : p;
    }).join(" / ");
  }
  return name.length > 15 ? name.substring(0, 13) + "..." : name;
};

const MatchCard = ({ match, idx, showNumber, isMobile, variant = "default" }: { 
  match: BracketMatch; 
  idx: number; 
  showNumber?: boolean;
  isMobile: boolean;
  variant?: "default" | "final";
}) => (
  <Card
    className={`p-2 transition-all border-l-4 ${
      variant === "final" 
        ? "border-l-primary bg-gradient-to-r from-primary/10 to-transparent min-w-[120px]" 
        : match.winner === 1
          ? "border-l-primary bg-primary/5 min-w-[110px]"
          : match.winner === 2
            ? "border-l-muted min-w-[110px]"
            : "border-l-border min-w-[110px]"
    }`}
  >
    <div className="space-y-0.5">
      <div
        className={`text-[9px] md:text-xs font-medium leading-tight ${
          match.winner === 1 ? "text-primary font-bold" : "text-foreground"
        }`}
      >
        {showNumber && `${idx + 1}. `}{truncateTeam(match.team1, isMobile)}
      </div>
      {match.score && (
        <div className="text-[8px] md:text-[10px] text-center text-muted-foreground font-mono">
          {match.score}
        </div>
      )}
      <div
        className={`text-[9px] md:text-xs font-medium leading-tight ${
          match.winner === 2 ? "text-primary font-bold" : "text-foreground"
        }`}
      >
        {showNumber && `${idx + 2}. `}{truncateTeam(match.team2, isMobile)}
      </div>
    </div>
  </Card>
);

const ChampionCard = ({ champion, isMobile }: { champion: { name: string; score: string }; isMobile: boolean }) => (
  <Card className={`p-2 md:p-3 border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-background to-yellow-500/5 shadow-xl ${isMobile ? 'min-w-[120px]' : 'min-w-[140px]'}`}>
    <div className="flex flex-col items-center text-center space-y-1 h-full justify-center">
      <div className="p-1 md:p-1.5 bg-yellow-500/20 rounded-full">
        <Trophy className="w-4 h-4 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
      </div>
      <div>
        <h3 className="text-[8px] md:text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wide">
          🏆 Campeones
        </h3>
        <p className="text-[9px] md:text-xs font-bold text-foreground whitespace-pre-line leading-tight">
          {truncateTeam(champion.name, isMobile)}
        </p>
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
          <ChampionCard champion={champion} isMobile={isMobile} />
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
                <MatchCard key={idx} match={match} idx={idx} showNumber isMobile={isMobile} />
              ))}
            </div>
          </div>

          <ConnectionLine isMobile={isMobile} />

          {/* Semifinals */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] md:text-sm font-bold text-center text-foreground">Semis</h3>
            <div className="flex flex-col gap-2">
              {semifinals.map((match, idx) => (
                <MatchCard key={idx} match={match} idx={idx} isMobile={isMobile} />
              ))}
            </div>
          </div>

          <ConnectionLine isMobile={isMobile} />

          {/* Final */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] md:text-sm font-bold text-center text-foreground">Final</h3>
            <MatchCard match={final} idx={0} isMobile={isMobile} variant="final" />
            
            {/* Champion on desktop only (mobile shows at top) */}
            {!isMobile && champion && (
              <ChampionCard champion={champion} isMobile={isMobile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
