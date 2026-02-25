"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { formatCurrency } from "@/lib/utils";

const chartConfig = {
  totalRevenue: {
    label: "Doanh thu",
    color: "#f97316", // orange-500
  },
  sessionCount: {
    label: "Số phiên",
    color: "#3b82f6", // blue-500
  },
} satisfies ChartConfig;

export function TablePerformanceChart({
  topTables,
}: {
  topTables: DashboardIndicatorResType["data"]["tablePerformance"]["topTables"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top bàn</CardTitle>
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
              tickFormatter={(value) => `Bàn ${value}`}
            />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Bàn ${value}`}
                  formatter={(value, name, props) => {
                    const data = props.payload;
                    if (name === "totalRevenue") {
                      return (
                        <div className="space-y-1">
                          <div className="text-sm">Doanh thu: {formatCurrency(data.totalRevenue)}</div>
                          <div className="text-sm">Số phiên: {data.sessionCount}</div>
                          <div className="text-sm">
                            TL TB/phiên: {(data.avgSessionDuration / 60).toFixed(0)} phút
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
