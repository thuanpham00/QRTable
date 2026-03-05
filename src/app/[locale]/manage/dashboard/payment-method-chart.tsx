"use client";
import { Cell, Legend, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";

const COLORS = ["#22c55e", "#3b82f6"];

export function PaymentMethodChart({
  paymentMethodBreakdown,
}: {
  paymentMethodBreakdown: DashboardIndicatorResType["data"]["paymentAnalytics"]["paymentMethodBreakdown"];
}) {
  const t = useTranslations("ManageDashboard");

  const chartConfig = {
    CASH: { label: t("chartCash"), color: "#22c55e" },
    SEPAY: { label: t("chartSepay"), color: "#3b82f6" },
  } satisfies ChartConfig;

  const chartData = [
    {
      name: t("chartCash"),
      value: paymentMethodBreakdown.CASH.count,
      amount: paymentMethodBreakdown.CASH.amount,
      percentage: paymentMethodBreakdown.CASH.percentage,
    },
    {
      name: t("chartSepay"),
      value: paymentMethodBreakdown.SEPAY.count,
      amount: paymentMethodBreakdown.SEPAY.amount,
      percentage: paymentMethodBreakdown.SEPAY.percentage,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("paymentMethodChartTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-64">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="space-y-1">
                          <div className="font-semibold">{data.name}</div>
                          <div className="text-sm">
                            {t("tooltipQuantity")} {data.value}
                          </div>
                          <div className="text-sm">
                            {t("tooltipAmount")} {formatCurrency(data.amount)}
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
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage.toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
