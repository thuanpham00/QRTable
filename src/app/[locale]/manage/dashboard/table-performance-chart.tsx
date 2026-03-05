"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function TablePerformanceChart({
  topTables,
}: {
  topTables: DashboardIndicatorResType["data"]["tablePerformance"]["topTables"];
}) {
  const t = useTranslations("ManageDashboard");

  const chartConfig = {
    totalRevenue: { label: t("revenueLabel"), color: "#f97316" },
    sessionCount: { label: t("sessionCountLabel"), color: "#3b82f6" },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("topTablesChartTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={topTables}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="tableNumber"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => t("tablePrefix", { number: value })}
            />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => t("tablePrefix", { number: value })}
                  formatter={(value, name, props) => {
                    const data = props.payload;
                    if (name === "totalRevenue") {
                      return (
                        <div className="space-y-1">
                          <div className="text-sm">
                            {t("tooltipRevenue")} {formatCurrency(data.totalRevenue)}
                          </div>
                          <div className="text-sm">
                            {t("sessionCountLabel")}: {data.sessionCount}
                          </div>
                          <div className="text-sm">
                            {t("avgSessionDurationTooltip")} {(data.avgSessionDuration / 60).toFixed(0)}{" "}
                            {t("minutes")}
                          </div>
                        </div>
                      );
                    }
                    return value;
                  }}
                />
              }
            />
            <Bar dataKey="totalRevenue" fill="var(--color-totalRevenue)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
