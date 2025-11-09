import { Card } from "@/components/ui/card";

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
}

export const KnockoutBracket = ({ quarterfinals, semifinals, final }: KnockoutBracketProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-card border border-border rounded-lg">
          <span className="font-bold text-foreground">🏆 Finais</span>
          <p className="text-xs text-muted-foreground">Chave eliminatória</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Quarterfinals */}
        <div className="flex flex-col gap-12">
          {quarterfinals.map((match, idx) => (
            <Card
              key={idx}
              className={`p-4 min-w-[200px] border-l-4 transition-all ${
                match.winner === 1
                  ? "border-l-primary bg-primary/5"
                  : match.winner === 2
                  ? "border-l-muted"
                  : "border-l-border"
              }`}
            >
              <div className="space-y-2">
                <div
                  className={`text-sm font-medium ${
                    match.winner === 1 ? "text-primary font-bold" : "text-foreground"
                  }`}
                >
                  {idx + 1}. {match.team1}
                </div>
                <div
                  className={`text-sm font-medium ${
                    match.winner === 2 ? "text-primary font-bold" : "text-foreground"
                  }`}
                >
                  {idx + 2}. {match.team2}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Connection Line */}
        <div className="hidden lg:block w-8 h-px bg-border" />

        {/* Semifinals */}
        <div className="flex flex-col gap-12">
          {semifinals.map((match, idx) => (
            <Card
              key={idx}
              className={`p-4 min-w-[200px] border-l-4 transition-all ${
                match.winner === 1
                  ? "border-l-primary bg-primary/5"
                  : match.winner === 2
                  ? "border-l-muted"
                  : "border-l-border"
              }`}
            >
              <div className="space-y-2">
                <div
                  className={`text-sm font-medium ${
                    match.winner === 1 ? "text-primary font-bold" : "text-foreground"
                  }`}
                >
                  {match.team1}
                </div>
                {match.score && (
                  <div className="text-xs text-center text-muted-foreground font-mono">
                    {match.score}
                  </div>
                )}
                <div
                  className={`text-sm font-medium ${
                    match.winner === 2 ? "text-primary font-bold" : "text-foreground"
                  }`}
                >
                  {match.team2}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Connection Line */}
        <div className="hidden lg:block w-8 h-px bg-border" />

        {/* Final */}
        <div className="flex flex-col justify-center">
          <Card
            className={`p-6 min-w-[220px] border-l-4 border-l-primary bg-gradient-to-r from-primary/10 to-transparent`}
          >
            <div className="space-y-3">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
                Final
              </div>
              <div
                className={`text-base font-medium ${
                  final.winner === 1 ? "text-primary font-bold" : "text-foreground"
                }`}
              >
                {final.team1}
              </div>
              {final.score && (
                <div className="text-sm text-center text-muted-foreground font-mono font-bold">
                  {final.score}
                </div>
              )}
              <div
                className={`text-base font-medium ${
                  final.winner === 2 ? "text-primary font-bold" : "text-foreground"
                }`}
              >
                {final.team2}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
