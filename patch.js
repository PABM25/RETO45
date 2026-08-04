const fs = require('fs');
const file = 'src/app/(tabs)/profile.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "Dimensions\n} from 'react-native';",
  "Dimensions,\n  useWindowDimensions\n} from 'react-native';"
);

content = content.replace(
  "const screenWidth = Dimensions.get('window').width;\n",
  ""
);

content = content.replace(
  "const completedDaysCount = dailyProgress.filter((day) => day.completed).length;",
  "const { width } = useWindowDimensions();\n\n  const completedDaysCount = dailyProgress.filter((day) => day.completed).length;"
);

content = content.replace(
  `  // Mock data for chart
  const chartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [
          (userProfile?.weight || 70) + 1.2,
          (userProfile?.weight || 70) + 1.0,
          (userProfile?.weight || 70) + 0.8,
          (userProfile?.weight || 70) + 0.6,
          (userProfile?.weight || 70) + 0.4,
          (userProfile?.weight || 70) + 0.2,
          userProfile?.weight || 70
        ]
      }
    ]
  };`,
  `  // Mock data for chart
  const baseWeight = userProfile?.weight;
  const chartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        data: baseWeight !== undefined && baseWeight > 0 ? [
          baseWeight + 1.2,
          baseWeight + 1.0,
          baseWeight + 0.8,
          baseWeight + 0.6,
          baseWeight + 0.4,
          baseWeight + 0.2,
          baseWeight
        ] : [0, 0, 0, 0, 0, 0, 0]
      }
    ]
  };`
);

content = content.replace(
  `                <LineChart
                  data={chartData}
                  width={screenWidth - 80}
                  height={220}
                  withDots={true}
                  withInnerLines={false}
                  withOuterLines={false}
                  chartConfig={{
                    backgroundColor: '#1E1E1E',
                    backgroundGradientFrom: '#1E1E1E',
                    backgroundGradientTo: '#1E1E1E',
                    decimalPlaces: 1,
                    color: (opacity = 1) => \`rgba(230, 57, 70, \${opacity})\`,
                    labelColor: (opacity = 1) => \`rgba(170, 170, 170, \${opacity})\`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#E63946"
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                    paddingRight: 30, // fix cutoff label
                  }}
                />`,
  `                {chartData?.datasets?.[0]?.data?.length > 0 ? (
                  <LineChart
                    data={chartData}
                    width={Math.max(width - 80, 200)}
                    height={220}
                    withDots={true}
                    withInnerLines={false}
                    withOuterLines={false}
                    chartConfig={{
                      backgroundColor: '#1E1E1E',
                      backgroundGradientFrom: '#1E1E1E',
                      backgroundGradientTo: '#1E1E1E',
                      decimalPlaces: 1,
                      color: (opacity = 1) => \`rgba(230, 57, 70, \${opacity})\`,
                      labelColor: (opacity = 1) => \`rgba(170, 170, 170, \${opacity})\`,
                      style: {
                        borderRadius: 16
                      },
                      propsForDots: {
                        r: "4",
                        strokeWidth: "2",
                        stroke: "#E63946"
                      }
                    }}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                      paddingRight: 30, // fix cutoff label
                    }}
                  />
                ) : (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#E63946" />
                    <Text style={{ color: '#aaa', marginTop: 12, fontSize: 16 }}>Cargando estadísticas...</Text>
                  </View>
                )}`
);

fs.writeFileSync(file, content);
