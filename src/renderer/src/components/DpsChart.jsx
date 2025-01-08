// src/renderer/src/components/DpsChart.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';
import { getColorForCharacter } from '../utils/colorUtils';
import BarChartIcon from '@mui/icons-material/BarChart'; 

export function DpsChart({ dpsHistory, dpsByCharacter }) {
  const allChars = Object.keys(dpsByCharacter);

  const linesToRender = [];
  allChars.forEach((charName) => {
    const baseColor = getColorForCharacter(charName);

    // Outgoing line = solid, no dots
    linesToRender.push(
      <Line
        key={`${charName}_out`}
        type="monotone"
        dataKey={`${charName}_out`}
        stroke={baseColor}
        dot={false}            // hide permanent dots
        activeDot={{ r: 6 }}
        name={`${charName} - Out`}
        isAnimationActive={false}  // Also on each line, if you want
      />
    );

    // Incoming line = same color, but with dots
    linesToRender.push(
      <Line
        key={`${charName}_in`}
        type="monotone"
        dataKey={`${charName}_in`}
        stroke={baseColor}
        dot={false}            // hide permanent dots
        activeDot={{ r: 6 }}
        name={`${charName} - In`}
        isAnimationActive={false}  // Also on each line, if you want
      />
    );
  });

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h6">
            DPS Over Time (Short Window)
          </Typography>
        }
      />
      <CardContent>
        {dpsHistory.length === 0 ? (
          // Our improved “empty state”:
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 5, 
              px: 2, 
              color: 'text.secondary' 
            }}
          >
            <BarChartIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body1">
              No DPS data yet
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Start shooting something to see real-time updates!
            </Typography>
          </Box>
        ) : (
          // Our normal chart rendering
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'text.secondary',
              borderRadius: 2,
              p: 2,
              bgcolor: 'background.paper',
            }}
          >
            <LineChart
              width={700}
              height={300}
              data={dpsHistory}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              isAnimationActive={false}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                type="number"
                domain={[
                    (dataMin, dataMax) => {
                      // If dataMax is Infinity, -Infinity, or NaN, default to 0
                      if (!isFinite(dataMax)) {
                        return 0;
                      }
                      // Subtract 15
                      const left = dataMax - 15;
                      // clamp at 0 to avoid negative domain
                      return left < 0 ? 0 : left;
                    },
                    (dataMin, dataMax) => {
                      // If dataMax is Infinity or NaN, default to 15
                      return isFinite(dataMax) ? dataMax : 15;
                    }
                ]}
                tickFormatter={(val) => `${val}s`}
              />
              <YAxis />
              <Tooltip content={renderCustomTooltip} />
              <Legend content={renderCustomLegend} />
              {linesToRender}
            </LineChart>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}


function renderCustomLegend({ payload }) {
    // 'payload' is an array of legend items for each <Line>,
    // e.g. [ { dataKey: 'Guarzo_in', color: '#8884d8', value: 'Guarzo_in', ... }, ... ]
  
    // We want to group by character name (the part before '_in' or '_out').
    const seenCharacters = new Set();
    const legendItems = [];
  
    for (const entry of payload) {
      // dataKey = e.g. 'Guarzo_in' => charName = 'Guarzo'
      const [charName] = entry.dataKey.split('_');
      // Or if you do something like 'Guarzo Opper(Vigilant)_in', 
      // you'd do a split/regex approach. But the concept is the same.
  
      if (!seenCharacters.has(charName)) {
        seenCharacters.add(charName);
  
        // We'll pick the color from the first encountered line for that char.
        // If you want 'in' vs. 'out' different colors, you'll need a more advanced approach.
        legendItems.push({
          charName,
          color: entry.color,
        });
      }
    }
  
    // Now we render a custom list of items, one per character.
    return (
      <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
        {legendItems.map(item => (
          <li key={item.charName} style={{ marginRight: 16, display: 'flex', alignItems: 'center' }}>
            {/* color box */}
            <div
              style={{
                width: 14,
                height: 14,
                backgroundColor: item.color,
                marginRight: 8,
              }}
            />
            {/* the character name */}
            <span>{item.charName}</span>
          </li>
        ))}
      </ul>
    );
  }

  // You can define this in the same file as DpsChart or import from elsewhere
function renderCustomTooltip({ active, payload, label }) {
    // If no data is hovered, hide the tooltip
    if (!active || !payload || !payload.length) {
      return null;
    }
  
    // 'payload' is an array of objects, one per line in the chart
    // e.g. [
    //   { dataKey: 'Guarzo_in', value: 10.2, color: '#8884d8', ... },
    //   { dataKey: 'Guarzo_out', value: 25.4, color: '#8884d8', ... },
    //   { dataKey: 'Gustav_in', value: 4, color: '#82ca9d', ... },
    //   ...
    // ]
  
    // We'll group by the character name (the part before '_')
    // So we'll store in => groupMap.get('Guarzo').in = 10.2
    // And out => groupMap.get('Guarzo').out = 25.4
    const groupMap = new Map();
  
    for (const entry of payload) {
      const { dataKey, value, color } = entry; // e.g. 'Guarzo_in', 25.4, #8884d8
      const [charName, direction] = dataKey.split('_'); // direction is 'in' or 'out'
  
      if (!groupMap.has(charName)) {
        groupMap.set(charName, {
          charName,
          in: null,
          out: null,
          color, // we can store color from either line
        });
      }
      if (direction === 'in') {
        groupMap.get(charName).in = value;
      } else if (direction === 'out') {
        groupMap.get(charName).out = value;
      }
    }
  
    // Convert groupMap to an array so we can render it easily
    const mergedEntries = Array.from(groupMap.values());
  
    // We'll render them in a custom tooltip box:
    return (
      <div
        style={{
          backgroundColor: '#2d3748',
          opacity: 0.9,
          padding: '8px',
          borderRadius: '4px',
          color: '#ffffff', // or theme-based
        }}
      >
        {/* 'label' is typically the x-axis value, e.g. the time in seconds */}
        <p style={{ margin: 0 }}>{`Time: ${label}s`}</p>
  
        {mergedEntries.map((item) => (
          <p key={item.charName} style={{ margin: 0, color: item.color }}>
            <strong>{item.charName}</strong>
            {': '}
            In: {item.in ?? 0} / Out: {item.out ?? 0}
          </p>
        ))}
      </div>
    );
  }
  