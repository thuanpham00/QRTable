/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Cell, Legend, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { useTranslations } from "next-intl";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#eab308", "#6b7280", "#ef4444"];

export function OrderStatusChart({
  orderStatusBreakdown,
}: {
  orderStatusBreakdown: DashboardIndicatorResType["data"]["orderAnalytics"]["orderStatusBreakdown"];
}) {
  const t = useTranslations("ManageDashboard");

  const chartConfig = {
    Paid: { label: t("statusPaid"), color: "#22c55e" },
    Delivered: { label: t("statusDelivered"), color: "#3b82f6" },
    Processing: { label: t("statusProcessing"), color: "#f59e0b" },
    Pending: { label: t("statusPending"), color: "#eab308" },
    Cancelled: { label: t("statusCancelled"), color: "#6b7280" },
    Rejected: { label: t("statusRejected"), color: "#ef4444" },
  } satisfies ChartConfig;

  const chartData = [
    { name: t("statusPaid"), value: orderStatusBreakdown.Paid, status: "Paid" },
    { name: t("statusDelivered"), value: orderStatusBreakdown.Delivered, status: "Delivered" },
    { name: t("statusProcessing"), value: orderStatusBreakdown.Processing, status: "Processing" },
    { name: t("statusPending"), value: orderStatusBreakdown.Pending, status: "Pending" },
    { name: t("statusCancelled"), value: orderStatusBreakdown.Cancelled, status: "Cancelled" },
    { name: t("statusRejected"), value: orderStatusBreakdown.Rejected, status: "Rejected" },
  ].filter((item) => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("orderStatusChartTitle")}</CardTitle>
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
                      const percentage = ((data.value / total) * 100).toFixed(1);
                      return (
                        <div className="space-y-1">
                          <div className="font-semibold">{data.name}</div>
                          <div className="text-sm">
                            {t("tooltipQuantity")} {data.value}
                          </div>
                          <div className="text-sm">
                            {t("tooltipRate")} {percentage}%
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
              label={(entry) => {
                const percentage = (entry.value / total) * 100;
                return `${percentage.toFixed(0)}%`;
              }}
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend formatter={(value, entry: any) => `${entry.payload.name} (${entry.payload.value})`} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
