// Utility for performance metrics
export function calculatePerformanceMetrics(performanceData) {
  const totalPerformance = performanceData.reduce(
    (acc, curr) => acc + curr.performance,
    0
  );
  const averagePerformance = performanceData.length
    ? (totalPerformance / performanceData.length).toFixed(2)
    : 0;
  const percentageChange =
    performanceData.length >= 2
      ? ((performanceData[performanceData.length - 1].performance -
          performanceData[performanceData.length - 2].performance) /
          performanceData[performanceData.length - 2].performance) *
        100
      : 0;
  return { totalPerformance, averagePerformance, percentageChange };
}
