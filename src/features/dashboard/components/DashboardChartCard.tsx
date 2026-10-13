import React from "react";
import { Alert, Box, Button, Card, CardContent, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

export interface DashboardChartRow {
  label: string;
  values: Array<{ label: string; value: number; formatValue?: (value: number) => string }>;
}

interface DashboardChartCardProps {
  title: string;
  subtitle?: string;
  rows?: DashboardChartRow[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  kind?: "bar" | "pie";
  layout?: "vertical" | "horizontal";
  xAxisLabel?: string;
  yAxisLabel?: string;
  emptyText?: string;
}

export const DashboardChartCard: React.FC<DashboardChartCardProps> = ({
  title,
  subtitle,
  rows = [],
  loading = false,
  error = false,
  onRetry,
  kind = "bar",
  layout = "vertical",
  xAxisLabel,
  yAxisLabel,
  emptyText = "Không có dữ liệu trong khoảng thời gian này.",
}) => {
  const theme = useTheme();
  const palette = [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main, theme.palette.secondary.main, theme.palette.info.main];
  const hasValues = rows.some((row) => row.values.some((item) => item.value > 0));
  const metrics = rows[0]?.values || [];
  const chartHeight = Math.max(300, Math.min(520, rows.length * 34 + 110));

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
        {loading ? (
          <Stack spacing={1.25} sx={{ mt: 2 }}>
            {[0, 1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={42} />)}
          </Stack>
        ) : error ? (
          <Alert severity="error" action={onRetry ? <Button color="inherit" size="small" onClick={onRetry}>Thử lại</Button> : undefined} sx={{ mt: 2 }}>
            Không thể tải dữ liệu biểu đồ.
          </Alert>
        ) : !hasValues ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
          </Box>
        ) : kind === "pie" ? (
          <PieChart
            height={320}
            series={[{
              data: rows.map((row, index) => ({ id: index, value: row.values[0]?.value ?? 0, label: row.label, color: palette[index % palette.length] })),
              innerRadius: 42,
              paddingAngle: 2,
              arcLabel: "value",
              arcLabelMinAngle: 12,
              highlightScope: { fade: "global", highlight: "item" },
              valueFormatter: (item) => metrics[0]?.formatValue?.(item.value) ?? item.value.toLocaleString("vi-VN"),
            }]}
            slotProps={{ legend: { direction: "horizontal", position: { vertical: "bottom", horizontal: "center" } } }}
          />
        ) : (
          <Stack spacing={2} sx={{ mt: 1.5 }}>
            {metrics.map((metric, metricIndex) => {
              const dataKey = `metric${metricIndex}`;
              const dataset = rows.map((row) => ({ label: row.label, [dataKey]: row.values[metricIndex]?.value ?? 0 }));
              const valueFormatter = (value: number | null | undefined) => value == null ? "—" : metric.formatValue?.(value) ?? value.toLocaleString("vi-VN");
              return (
                <Box key={metric.label} sx={{ minWidth: 0 }}>
                  {metrics.length > 1 && <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>{metric.label}</Typography>}
                  <BarChart
                    dataset={dataset}
                    height={chartHeight}
                    layout={layout}
                    grid={{ horizontal: true }}
                    hideLegend={metrics.length === 1}
                    xAxis={layout === "vertical"
                      ? [{ scaleType: "band", dataKey: "label", label: xAxisLabel, tickLabelStyle: { fontSize: 11 } }]
                      : [{ label: xAxisLabel || metric.label, valueFormatter: (value: number) => valueFormatter(value) }]}
                    yAxis={layout === "vertical"
                      ? [{ label: yAxisLabel || metric.label, valueFormatter: (value: number) => valueFormatter(value) }]
                      : [{ scaleType: "band", dataKey: "label", label: yAxisLabel, tickLabelStyle: { fontSize: 11 } }]}
                    series={[{
                      dataKey,
                      label: metric.label,
                      color: palette[metricIndex % palette.length],
                      valueFormatter: (value) => valueFormatter(value),
                    }]}
                    margin={{ left: layout === "horizontal" ? 125 : 48, right: 24, top: 12, bottom: layout === "vertical" ? 54 : 40 }}
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
