import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

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

export const KnockoutBracket = ({ quarterfinals, semifinals, final, champion }: KnockoutBracketProps) => {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto pb-4">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-12 min-w-max lg:min-w-0">
          {/* Quarterfinals */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs md:text-sm font-bold text-center text-foreground mb-1">Cuartos</h3>
            <div className="flex flex-col gap-3">
            {quarterfinals.map((match, idx) => (
              <Card
                key={idx}
                className={`p-2 min-w-[140px] border-l-4 transition-all ${
                match.winner === 1
                  ? "border-l-primary bg-primary/5"
                  : match.winner === 2
                  ? "border-l-muted"
                  : "border-l-border"
                }`}
              >
                <div className="space-y-1">
                  <div
                    className={`text-[10px] md:text-xs font-medium ${
                      match.winner === 1 ? "text-primary font-bold" : "text-foreground"
                    }`}
                  >
                    {idx + 1}. {match.team1}
                  </div>
                  <div
                    className={`text-[10px] md:text-xs font-medium ${
                      match.winner === 2 ? "text-primary font-bold" : "text-foreground"
                    }`}
                  >
                    {idx + 2}. {match.team2}
                  </div>
                </div>
              </Card>
            ))}
            </div>
          </div>

          {/* Connection Line */}
          <div className="hidden lg:block w-6 h-px bg-border self-center" />

          {/* Semifinals */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs md:text-sm font-bold text-center text-foreground mb-1">Semifinales</h3>
            <div className="flex flex-col gap-3">
            {semifinals.map((match, idx) => (
              <Card
                key={idx}
                className={`p-2 min-w-[140px] border-l-4 transition-all ${
                match.winner === 1
                  ? "border-l-primary bg-primary/5"
                  : match.winner === 2
                  ? "border-l-muted"
                  : "border-l-border"
                }`}
              >
                <div className="space-y-1">
                  <div
                    className={`text-[10px] md:text-xs font-medium ${
                      match.winner === 1 ? "text-primary font-bold" : "text-foreground"
                    }`}
                  >
                    {match.team1}
                  </div>
                  {match.score && (
                    <div className="text-[9px] md:text-[10px] text-center text-muted-foreground font-mono">
                      {match.score}
                    </div>
                  )}
                  <div
                    className={`text-[10px] md:text-xs font-medium ${
                      match.winner === 2 ? "text-primary font-bold" : "text-foreground"
                    }`}
                  >
                    {match.team2}
                  </div>
                </div>
              </Card>
            ))}
            </div>
          </div>

          {/* Connection Line */}
          <div className="hidden lg:block w-6 h-px bg-border self-center" />

          {/* Final and Champion */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs md:text-sm font-bold text-center text-foreground mb-1">Final</h3>
            <div className="flex flex-col gap-3">
              <Card
                className={`p-3 min-w-[140px] border-l-4 border-l-primary bg-gradient-to-r from-primary/10 to-transparent`}
              >
                <div className="space-y-1.5">
                  <div
                    className={`text-xs md:text-sm font-medium ${
                      final.winner === 1 ? "text-primary font-bold" : "text-foreground"
                    }`}
                  >
                    {final.team1}
                  </div>
                  {final.score && (
                    <div className="text-[10px] md:text-xs text-center text-muted-foreground font-mono font-bold">
                      {final.score}
                    </div>
                  )}
                  <div
                    className={`text-xs md:text-sm font-medium ${
                      final.winner === 2 ? "text-primary font-bold" : "text-foreground"
                    }`}
                  >
                    {final.team2}
                  </div>
                </div>
              </Card>

              {/* Champion Card */}
              {champion && (
                <Card className="p-3 min-w-[140px] border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-background to-yellow-500/5 shadow-xl">
                  <div className="flex flex-col items-center text-center space-y-1.5 h-full justify-center">
                    <div className="p-1.5 bg-yellow-500/20 rounded-full">
                      <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-[9px] md:text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wide mb-0.5">
                        🏆 Campeones
                      </h3>
                      <p className="text-[10px] md:text-xs font-bold text-foreground whitespace-pre-line">
                        {champion.name}
                      </p>
                      {champion.score && (
                        <p className="text-[9px] md:text-[10px] text-muted-foreground font-mono mt-0.5">
                          {champion.score}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
