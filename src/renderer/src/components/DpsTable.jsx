// src/renderer/src/components/DpsTable.jsx
import {
    Card,
    CardHeader,
    CardContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Box
  } from '@mui/material';
  import PersonOffIcon from '@mui/icons-material/PersonOff'; // pick any icon you prefer
  
  export function DpsTable({ dpsByCharacter, title }) {
    const sortedEntries = Object.entries(dpsByCharacter).sort((a, b) => {
      const totalA = a[1].incomingDps + a[1].outgoingDps;
      const totalB = b[1].incomingDps + b[1].outgoingDps;
      return totalB - totalA;
    });
  
    const hasData = sortedEntries.length > 0;
  
    return (
      <Card sx={{ mb: 3 }} elevation={6}>
        <CardHeader
          title={
            <Typography variant="h6">
              {title}
            </Typography>
          }
        />
        <CardContent>
          {hasData ? (
            // Normal table rendering
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'text.secondary',
                borderRadius: 2,
                p: 2,
                bgcolor: 'background.paper'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Character</TableCell>
                    <TableCell align="right">Incoming</TableCell>
                    <TableCell align="right">Outgoing</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedEntries.map(([charName, data], index) => {
                    const { incomingDps, outgoingDps } = data;
  
                    // Optional "striped row" effect
                    const rowStyle = {
                      backgroundColor: index % 2 === 0 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'inherit'
                    };
  
                    return (
                      <TableRow key={charName} sx={rowStyle}>
                        <TableCell>{charName}</TableCell>
                        <TableCell align="right">{incomingDps.toFixed(2)}</TableCell>
                        <TableCell align="right">{outgoingDps.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          ) : (
            // Empty-state placeholder
            <Box
              sx={{
                textAlign: 'center',
                py: 5,
                px: 2,
                color: 'text.secondary'
              }}
            >
              <PersonOffIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
              <Typography variant="body1">
                No damage events yet
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Start combat to see your incoming/outgoing DPS here.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }
  