import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";

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

export const GroupStage = ({ groupName, matches, standings }: GroupStageProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Matches Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground mb-2">📋 Resultados</h4>
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
                        {match.team1}
                      </TableCell>
                      <TableCell className={`text-center w-10 text-[10px] md:text-xs ${team1Won ? 'bg-green-500/10' : ''}`}>
                        {match.score1 !== undefined ? (
                          <span className="font-bold">{match.score1}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center w-6 text-[10px] text-muted-foreground">x</TableCell>
                      <TableCell className={`text-center w-10 text-[10px] md:text-xs ${team2Won ? 'bg-green-500/10' : ''}`}>
                        {match.score2 !== undefined ? (
                          <span className="font-bold">{match.score2}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-[10px] md:text-xs font-medium text-foreground py-1.5 ${team2Won ? 'bg-green-500/10' : ''}`}>
                        {match.team2}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Standings Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground mb-2">🏅 Clasificación</h4>
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-center font-bold text-foreground text-[10px] w-10">Pos.</TableHead>
                <TableHead className="font-bold text-foreground text-[10px]">{groupName}</TableHead>
                <TableHead className="text-center font-bold text-foreground text-[10px]" colSpan={3}>
                  Victorias
                </TableHead>
                <TableHead className="text-center font-bold text-foreground text-[10px]">SG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((team, idx) => (
                <TableRow key={idx} className="hover:bg-muted/50">
                  <TableCell className="text-center py-1.5">
                    <span className={`inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full font-bold text-[10px] ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                      idx === 1 ? 'bg-gray-300/20 text-gray-700 dark:text-gray-300' :
                      idx === 2 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {idx + 1}°
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-foreground text-[10px] md:text-xs py-1.5">
                    {team.team}
                  </TableCell>
                  <TableCell className="text-center py-1.5">
                    {team.match1 ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-3 h-3 text-destructive mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center py-1.5">
                    {team.match2 ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-3 h-3 text-destructive mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center py-1.5">
                    {team.match3 ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-3 h-3 text-destructive mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center font-bold text-foreground text-[10px] md:text-xs py-1.5">
                    {team.sg}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      </div>
    </div>
  );
};
