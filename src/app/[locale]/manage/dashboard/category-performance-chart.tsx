"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function CategoryPerformanceChart({
  categoryPerformance,
}: {
  categoryPerformance: DashboardIndicatorResType["data"]["categoryPerformance"];
}) {
  const t = useTranslations("ManageDashboard");

  const chartConfig = {
    revenue: { label: t("revenueLabel"), color: "#f97316" },
    orderCount: { label: t("tooltipOrderCount"), color: "#3b82f6" },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("categoryChartTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={categoryPerformance}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="categoryName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="space-y-1">
                          <div className="font-semibold">{data.categoryName}</div>
                          <div className="text-sm">
                            {t("tooltipRevenue")} {formatCurrency(data.revenue)}
                          </div>
                          <div className="text-sm">
                            {t("tooltipOrderCount")} {data.orderCount}
                          </div>
                          <div className="text-sm">
                            {t("tooltipDishCount")} {data.dishCount}
                          </div>
                          <div className="text-sm">
                            {t("tooltipRate")} {data.percentage.toFixed(1)}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              }
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
