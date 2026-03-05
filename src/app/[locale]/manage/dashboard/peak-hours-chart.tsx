"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function PeakHoursChart({
  peakHours,
}: {
  peakHours: DashboardIndicatorResType["data"]["timeAnalytics"]["peakHours"];
}) {
  const t = useTranslations("ManageDashboard");

  const chartConfig = {
    sessionCount: { label: t("sessionCountLabel"), color: "#8b5cf6" },
    revenue: { label: t("revenueLabel"), color: "#f97316" },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("peakHoursChartTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={peakHours}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}h`}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `${value}h`}
                  formatter={(value, name) => {
                    if (name === "revenue") {
                      return formatCurrency(value as number);
                    }
                    return value;
                  }}
                />
              }
            />
            <Bar
              dataKey="sessionCount"
              fill="var(--color-sessionCount)"
              radius={4}
              name={t("sessionCountLabel")}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
