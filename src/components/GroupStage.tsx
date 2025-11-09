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
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-foreground">{groupName}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matches Table */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableBody>
              {matches.map((match, idx) => (
                <TableRow key={idx} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">
                    {match.team1}
                  </TableCell>
                  <TableCell className="text-center w-16">
                    {match.score1 !== undefined ? (
                      <span className="font-bold">{match.score1}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center w-8 text-muted-foreground">x</TableCell>
                  <TableCell className="text-center w-16">
                    {match.score2 !== undefined ? (
                      <span className="font-bold">{match.score2}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {match.team2}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Standings Table */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold text-foreground">{groupName}</TableHead>
                <TableHead className="text-center font-bold text-foreground" colSpan={3}>
                  Vitórias
                </TableHead>
                <TableHead className="text-center font-bold text-foreground">SG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((team, idx) => (
                <TableRow key={idx} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">
                    {team.team}
                  </TableCell>
                  <TableCell className="text-center">
                    {team.match1 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {team.match2 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {team.match3 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center font-bold text-foreground">
                    {team.sg}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
