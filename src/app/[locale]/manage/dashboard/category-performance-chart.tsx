"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { formatCurrency } from "@/lib/utils";

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "#f97316", // orange-500
  },
  orderCount: {
    label: "Số đơn",
    color: "#3b82f6", // blue-500
  },
} satisfies ChartConfig;

export function CategoryPerformanceChart({
  categoryPerformance,
}: {
  categoryPerformance: DashboardIndicatorResType["data"]["categoryPerformance"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hiệu suất danh mục</CardTitle>
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
                          <div className="text-sm">Doanh thu: {formatCurrency(data.revenue)}</div>
                          <div className="text-sm">Số đơn: {data.orderCount}</div>
                          <div className="text-sm">Số món: {data.dishCount}</div>
                          <div className="text-sm">Tỷ lệ: {data.percentage.toFixed(1)}%</div>
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
