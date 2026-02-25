/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Cell, Legend, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";

const chartConfig = {
  Paid: {
    label: "Đã thanh toán",
    color: "#22c55e", // green-500
  },
  Delivered: {
    label: "Đã giao",
    color: "#3b82f6", // blue-500
  },
  Processing: {
    label: "Đang xử lý",
    color: "#f59e0b", // amber-500
  },
  Pending: {
    label: "Chờ xử lý",
    color: "#eab308", // yellow-500
  },
  Cancelled: {
    label: "Đã hủy",
    color: "#6b7280", // gray-500
  },
  Rejected: {
    label: "Bị từ chối",
    color: "#ef4444", // red-500
  },
} satisfies ChartConfig;

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#eab308", "#6b7280", "#ef4444"];

export function OrderStatusChart({
  orderStatusBreakdown,
}: {
  orderStatusBreakdown: DashboardIndicatorResType["data"]["orderAnalytics"]["orderStatusBreakdown"];
}) {
  const chartData = [
    { name: "Đã thanh toán", value: orderStatusBreakdown.Paid, status: "Paid" },
    { name: "Đã giao", value: orderStatusBreakdown.Delivered, status: "Delivered" },
    { name: "Đang xử lý", value: orderStatusBreakdown.Processing, status: "Processing" },
    { name: "Chờ xử lý", value: orderStatusBreakdown.Pending, status: "Pending" },
    { name: "Đã hủy", value: orderStatusBreakdown.Cancelled, status: "Cancelled" },
    { name: "Bị từ chối", value: orderStatusBreakdown.Rejected, status: "Rejected" },
  ].filter((item) => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng thái đơn hàng</CardTitle>
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
                          <div className="text-sm">Số lượng: {data.value}</div>
                          <div className="text-sm">Tỷ lệ: {percentage}%</div>
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
