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

// Truncate team name for mobile
const truncateTeam = (name: string, isMobile: boolean) => {
  if (!isMobile) return name;
  // Split by " / " for pairs, truncate each name
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
  return name.length > 20 ? name.substring(0, 20) + "..." : name;
};

const MatchesTable = ({ matches, isMobile }: { matches: Match[]; isMobile: boolean }) => (
  <div className="border border-border rounded-lg overflow-hidden bg-card">
    <Table>
      <TableBody>
        {matches.map((match, idx) => {
          const score1 = typeof match.score1 === 'number' ? match.score1 : 0;
          const score2 = typeof match.score2 === 'number' ? match.score2 : 0;
          const team1Won = match.score1 === 'WO' || (typeof match.score1 === 'number' && typeof match.score2 === 'number' && score1 > score2);
          const team2Won = match.score2 === 'WO' || (typeof match.score1 === 'number' && typeof match.score2 === 'number' && score2 > score1);
          
          return (
            <TableRow key={idx} className="hover:bg-muted/50">
              <TableCell className={`text-[10px] md:text-xs font-medium text-foreground py-1.5 ${team1Won ? 'bg-green-500/10' : ''}`}>
                {truncateTeam(match.team1, isMobile)}
              </TableCell>
              <TableCell className={`text-center w-8 text-[10px] md:text-xs ${team1Won ? 'bg-green-500/10' : ''}`}>
                {match.score1 !== undefined ? (
                  <span className="font-bold">{match.score1}</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center w-4 text-[10px] text-muted-foreground">x</TableCell>
              <TableCell className={`text-center w-8 text-[10px] md:text-xs ${team2Won ? 'bg-green-500/10' : ''}`}>
                {match.score2 !== undefined ? (
                  <span className="font-bold">{match.score2}</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className={`text-[10px] md:text-xs font-medium text-foreground py-1.5 ${team2Won ? 'bg-green-500/10' : ''}`}>
                {truncateTeam(match.team2, isMobile)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);

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
        {standings.map((team, idx) => (
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
            <TableCell className="font-medium text-foreground text-[9px] md:text-xs py-1">
              {truncateTeam(team.team.replace('\n', ' / '), isMobile)}
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
        ))}
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
          <MatchesTable matches={matches} isMobile={isMobile} />
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
          <MatchesTable matches={matches} isMobile={isMobile} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground mb-2">🏅 Clasificación</h4>
          <StandingsTable groupName={groupName} standings={standings} isMobile={isMobile} />
        </div>
      </div>
    </div>
  );
};
