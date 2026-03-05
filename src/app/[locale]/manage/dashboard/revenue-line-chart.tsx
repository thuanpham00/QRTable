"use client";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, parse } from "date-fns";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { useTranslations } from "next-intl";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#f97316",
  },
} satisfies ChartConfig;

export function RevenueLineChart({
  chartData,
}: {
  chartData: DashboardIndicatorResType["data"]["revenueByDate"];
}) {
  const t = useTranslations("ManageDashboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("revenueChartTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (chartData.length < 8) {
                  return value;
                }
                if (chartData.length < 33) {
                  const date = parse(value, "dd/MM/yyyy", new Date());
                  return format(date, "dd");
                }
                return "";
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Line
              dataKey="revenue"
              type="linear"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              name={t("revenueLabel")}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
