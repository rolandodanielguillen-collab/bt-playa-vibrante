import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Match {
  team1: string;
  team2: string;
  score1?: number | string;
  score2?: number | string;
}

interface TeamStanding {
  team: string;
  match1: boolean;
  match2: boolean;
  match3: boolean;
  sg: number;
}

interface GroupStageProps {
  groupName: string;
  matches: Match[];
  standings: TeamStanding[];
}

// Format team name: first name + last name, stacked vertically
const formatTeamName = (name: string): { player1: string; player2: string } => {
  // Split by " / " for pairs
  const parts = name.split(" / ");
  if (parts.length === 2) {
    const formatPlayer = (fullName: string) => {
      const nameParts = fullName.trim().split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
      }
      return fullName;
    };
    return {
      player1: formatPlayer(parts[0]),
      player2: formatPlayer(parts[1])
    };
  }
  return { player1: name, player2: "" };
};

// Team name cell with stacked players
const TeamNameCell = ({ teamName, isWinner }: { teamName: string; isWinner: boolean }) => {
  const { player1, player2 } = formatTeamName(teamName);
  
  return (
    <div className={`py-2 px-3 ${isWinner ? 'bg-primary/10' : ''}`}>
      <div className="flex flex-col gap-0.5">
        <span className={`text-[10px] md:text-xs leading-tight ${isWinner ? 'font-semibold text-primary' : 'text-foreground'}`}>
          {player1}
        </span>
        {player2 && (
          <span className={`text-[10px] md:text-xs leading-tight ${isWinner ? 'font-semibold text-primary' : 'text-foreground'}`}>
            {player2}
          </span>
        )}
      </div>
    </div>
  );
};

const MatchesTable = ({ matches }: { matches: Match[] }) => (
  <div className="border border-border rounded-lg overflow-hidden bg-card">
    <Table>
      <TableBody>
        {matches.map((match, idx) => {
          const score1 = typeof match.score1 === 'number' ? match.score1 : 0;
          const score2 = typeof match.score2 === 'number' ? match.score2 : 0;
          const team1Won = match.score1 === 'WO' || (typeof match.score1 === 'number' && typeof match.score2 === 'number' && score1 > score2);
          const team2Won = match.score2 === 'WO' || (typeof match.score1 === 'number' && typeof match.score2 === 'number' && score2 > score1);
          
          return (
            <TableRow key={idx} className="hover:bg-muted/30 border-b border-border">
              {/* Team 1 */}
              <TableCell className="p-0 w-[40%]">
                <TeamNameCell teamName={match.team1} isWinner={team1Won} />
              </TableCell>
              
              {/* Score 1 */}
              <TableCell className={`text-center w-12 border-l border-r border-border/50 ${team1Won ? 'bg-primary/10' : 'bg-muted/30'}`}>
                {match.score1 !== undefined ? (
                  <span className={`text-[11px] md:text-sm font-bold ${team1Won ? 'text-primary' : 'text-foreground'}`}>
                    {match.score1}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              
              {/* X separator */}
              <TableCell className="text-center w-6 px-0 bg-muted/20">
                <span className="text-[10px] text-muted-foreground font-medium">x</span>
              </TableCell>
              
              {/* Score 2 */}
              <TableCell className={`text-center w-12 border-l border-r border-border/50 ${team2Won ? 'bg-primary/10' : 'bg-muted/30'}`}>
                {match.score2 !== undefined ? (
                  <span className={`text-[11px] md:text-sm font-bold ${team2Won ? 'text-primary' : 'text-foreground'}`}>
                    {match.score2}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              
              {/* Team 2 */}
              <TableCell className="p-0 w-[40%]">
                <TeamNameCell teamName={match.team2} isWinner={team2Won} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);

// Format standings team name (can have newline)
const formatStandingsTeam = (name: string): { player1: string; player2: string } => {
  const parts = name.split('\n');
  if (parts.length === 2) {
    const formatPlayer = (fullName: string) => {
      const nameParts = fullName.trim().split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
      }
      return fullName;
    };
    return {
      player1: formatPlayer(parts[0]),
      player2: formatPlayer(parts[1])
    };
  }
  return formatTeamName(name.replace('\n', ' / '));
};

const StandingsTable = ({ groupName, standings, isMobile }: { groupName: string; standings: TeamStanding[]; isMobile: boolean }) => (
  <div className="border border-border rounded-lg overflow-hidden bg-card">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="text-center font-bold text-foreground text-[10px] w-8">Pos</TableHead>
          <TableHead className="font-bold text-foreground text-[10px]">{groupName}</TableHead>
          <TableHead className="text-center font-bold text-foreground text-[10px]" colSpan={3}>
            {isMobile ? "V" : "Victorias"}
          </TableHead>
          <TableHead className="text-center font-bold text-foreground text-[10px] w-8">SG</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((team, idx) => {
          const { player1, player2 } = formatStandingsTeam(team.team);
          
          return (
            <TableRow key={idx} className="hover:bg-muted/50">
              <TableCell className="text-center py-1">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-[9px] ${
                  idx === 0 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                  idx === 1 ? 'bg-gray-300/20 text-gray-700 dark:text-gray-300' :
                  idx === 2 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {idx + 1}
                </span>
              </TableCell>
              <TableCell className="font-medium text-foreground py-1">
                <div className="flex flex-col gap-0">
                  <span className="text-[9px] md:text-xs leading-tight">{player1}</span>
                  {player2 && <span className="text-[9px] md:text-xs leading-tight">{player2}</span>}
                </div>
              </TableCell>
              <TableCell className="text-center py-1 px-1">
                {team.match1 ? (
                  <CheckCircle2 className="w-3 h-3 text-green-600 mx-auto" />
                ) : (
                  <XCircle className="w-3 h-3 text-destructive mx-auto" />
                )}
              </TableCell>
              <TableCell className="text-center py-1 px-1">
                {team.match2 ? (
                  <CheckCircle2 className="w-3 h-3 text-green-600 mx-auto" />
                ) : (
                  <XCircle className="w-3 h-3 text-destructive mx-auto" />
                )}
              </TableCell>
              <TableCell className="text-center py-1 px-1">
                {team.match3 ? (
                  <CheckCircle2 className="w-3 h-3 text-green-600 mx-auto" />
                ) : (
                  <XCircle className="w-3 h-3 text-destructive mx-auto" />
                )}
              </TableCell>
              <TableCell className="text-center font-bold text-foreground text-[10px] py-1">
                {team.sg}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);

export const GroupStage = ({ groupName, matches, standings }: GroupStageProps) => {
  const isMobile = useIsMobile();

  // Mobile: Use tabs to toggle between Results and Standings
  if (isMobile) {
    return (
      <Tabs defaultValue="resultados" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="resultados" className="text-[10px]">📋 Resultados</TabsTrigger>
          <TabsTrigger value="clasificacion" className="text-[10px]">🏅 Clasificación</TabsTrigger>
        </TabsList>
        <TabsContent value="resultados" className="mt-2">
          <MatchesTable matches={matches} />
        </TabsContent>
        <TabsContent value="clasificacion" className="mt-2">
          <StandingsTable groupName={groupName} standings={standings} isMobile={isMobile} />
        </TabsContent>
      </Tabs>
    );
  }

  // Desktop: Side by side layout
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground mb-2">📋 Resultados</h4>
          <MatchesTable matches={matches} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground mb-2">🏅 Clasificación</h4>
          <StandingsTable groupName={groupName} standings={standings} isMobile={isMobile} />
        </div>
      </div>
    </div>
  );
};
