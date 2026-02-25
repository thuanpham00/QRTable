"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueLineChart } from "@/app/[locale]/manage/dashboard/revenue-line-chart";
import { PaymentMethodChart } from "@/app/[locale]/manage/dashboard/payment-method-chart";
import { CategoryPerformanceChart } from "@/app/[locale]/manage/dashboard/category-performance-chart";
import { PeakHoursChart } from "@/app/[locale]/manage/dashboard/peak-hours-chart";
import { OrderStatusChart } from "@/app/[locale]/manage/dashboard/order-status-chart";
import { TablePerformanceChart } from "@/app/[locale]/manage/dashboard/table-performance-chart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { endOfDay, endOfMonth, endOfYear, format, startOfDay, startOfMonth, startOfYear } from "date-fns";
import { useDashboardIndicator } from "@/queries/useIndicators";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DateRangeType = "date" | "month" | "year";

const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());
export default function DashboardMain() {
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("date");

  const [fromDate, setFromDate] = useState(initFromDate);
  const [toDate, setToDate] = useState(initToDate);

  const { data } = useDashboardIndicator({
    fromDate,
    toDate,
  });

  // Basic metrics
  const revenue = data?.payload.data.revenue ?? 0;
  const guestCount = data?.payload.data.guestCount ?? 0;
  const orderCount = data?.payload.data.orderCount ?? 0;
  const servingTableCount = data?.payload.data.servingTableCount ?? 0;

  // Charts data
  const revenueByDate = data?.payload.data.revenueByDate ?? [];

  // Payment Analytics
  const paymentAnalytics = data?.payload.data.paymentAnalytics;
  const totalPayments = paymentAnalytics?.totalPayments ?? 0;
  const avgPaymentValue = paymentAnalytics?.avgPaymentValue ?? 0;
  const groupPaymentRate = paymentAnalytics?.groupPaymentRate ?? 0;
  const paymentMethodBreakdown = paymentAnalytics?.paymentMethodBreakdown;
  const paymentGroupStats = paymentAnalytics?.paymentGroupStats;

  // Category Performance
  const categoryPerformance = data?.payload.data.categoryPerformance ?? [];

  // Time Analytics
  const timeAnalytics = data?.payload.data.timeAnalytics;
  const avgSessionDuration = timeAnalytics?.avgSessionDuration ?? 0;
  const peakHours = timeAnalytics?.peakHours ?? [];
  const turnoverRate = timeAnalytics?.turnoverRate ?? 0;

  // Table Performance
  const tablePerformance = data?.payload.data.tablePerformance;
  const totalTables = tablePerformance?.totalTables ?? 0;
  const utilizationRate = tablePerformance?.utilizationRate ?? 0;
  const avgSessionsPerTable = tablePerformance?.avgSessionsPerTable ?? 0;
  const topTables = tablePerformance?.topTables ?? [];

  // Guest Analytics
  const guestAnalytics = data?.payload.data.guestAnalytics;
  const totalGuests = guestAnalytics?.totalGuests ?? 0;
  const avgGuestsPerSession = guestAnalytics?.avgGuestsPerSession ?? 0;
  const guestLoginStats = guestAnalytics?.guestLoginStats;
  const returningGuests = guestAnalytics?.returningGuests ?? 0;

  // Order Analytics
  const orderAnalytics = data?.payload.data.orderAnalytics;
  const orderStatusBreakdown = orderAnalytics?.orderStatusBreakdown;

  // Session Statistics
  const sessionStats = data?.payload.data.sessionStats;

  // Dishes
  const topDishesByQuantity = data?.payload.data.topDishesByQuantity ?? [];
  const topDishesByRevenue = data?.payload.data.topDishesByRevenue ?? [];

  const handleDateRangeTypeChange = (value: DateRangeType) => {
    setDateRangeType(value);
    const now = new Date();

    switch (value) {
      case "date":
        setFromDate(startOfDay(now));
        setToDate(endOfDay(now));
        break;
      case "month":
        setFromDate(startOfMonth(now));
        setToDate(endOfMonth(now));
        break;
      case "year":
        setFromDate(startOfYear(now));
        setToDate(endOfYear(now));
        break;
    }
  };

  const resetDateFilter = () => {
    handleDateRangeTypeChange(dateRangeType);
  };

  const getInputType = () => {
    switch (dateRangeType) {
      case "date":
        return "datetime-local";
      case "month":
        return "month";
      case "year":
        return "number";
      default:
        return "datetime-local";
    }
  };

  const getInputValue = (date: Date) => {
    switch (dateRangeType) {
      case "date":
        return format(date, "yyyy-MM-dd'T'HH:mm");
      case "month":
        return format(date, "yyyy-MM");
      case "year":
        return format(date, "yyyy");
      default:
        return format(date, "yyyy-MM-dd'T'HH:mm");
    }
  };

  const handleDateChange = (value: string, isFromDate: boolean) => {
    let newDate: Date;

    switch (dateRangeType) {
      case "date":
        newDate = new Date(value);
        break;
      case "month":
        newDate = isFromDate ? startOfMonth(new Date(value)) : endOfMonth(new Date(value));
        break;
      case "year":
        const year = parseInt(value);
        newDate = isFromDate ? startOfYear(new Date(year, 0, 1)) : endOfYear(new Date(year, 11, 31));
        break;
      default:
        newDate = new Date(value);
    }

    if (isFromDate) {
      setFromDate(newDate);
    } else {
      setToDate(newDate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Loại thời gian</label>
          <Select value={dateRangeType} onValueChange={handleDateRangeTypeChange}>
            <SelectTrigger className="w-35">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Theo ngày</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
              <SelectItem value="year">Theo năm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-4 flex items-center gap-2">
          <label className="text-sm font-medium">Từ</label>
          <Input
            type={getInputType()}
            placeholder="Từ"
            className="w-52"
            value={getInputValue(fromDate)}
            onChange={(e) => handleDateChange(e.target.value, true)}
            {...(dateRangeType === "year" && { min: 2000, max: 2100 })}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Đến</label>
          <Input
            type={getInputType()}
            placeholder="Đến"
            className="w-52"
            value={getInputValue(toDate)}
            onChange={(e) => handleDateChange(e.target.value, false)}
            {...(dateRangeType === "year" && { min: 2000, max: 2100 })}
          />
        </div>

        <Button variant="outline" onClick={resetDateFilter}>
          Reset
        </Button>
      </div>

      {/* Basic Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestCount}</div>
            <p className="text-xs text-muted-foreground">Gọi món</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bàn đang phục vụ</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servingTableCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Analytics */}
      {paymentAnalytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPayments}</div>
              <p className="text-xs text-muted-foreground">Hóa đơn</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giá trị TB/hóa đơn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(avgPaymentValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ thanh toán nhóm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groupPaymentRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nhóm thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentGroupStats?.count ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                TB: {paymentGroupStats?.avgGuestsPerGroup.toFixed(1) ?? 0} khách/nhóm
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Method & Order Status */}
      {paymentMethodBreakdown && orderStatusBreakdown && (
        <div className="grid gap-4 md:grid-cols-2">
          <PaymentMethodChart paymentMethodBreakdown={paymentMethodBreakdown} />
          <OrderStatusChart orderStatusBreakdown={orderStatusBreakdown} />
        </div>
      )}

      {/* Revenue & Category Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <RevenueLineChart chartData={revenueByDate} />
        {categoryPerformance.length > 0 && (
          <CategoryPerformanceChart categoryPerformance={categoryPerformance} />
        )}
      </div>

      {/* Peak Hours & Table Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        {peakHours.length > 0 && <PeakHoursChart peakHours={peakHours} />}
        {topTables.length > 0 && <TablePerformanceChart topTables={topTables} />}
      </div>

      {/* Top Dishes */}
      {(topDishesByQuantity.length > 0 || topDishesByRevenue.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {topDishesByQuantity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top món theo số lượng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topDishesByQuantity.slice(0, 5).map((dish, idx) => (
                    <div key={dish.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium">{dish.name}</div>
                          <div className="text-xs text-muted-foreground">{formatCurrency(dish.price)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{dish.successOrders}</div>
                        <div className="text-xs text-muted-foreground">đơn</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {topDishesByRevenue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top món theo doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topDishesByRevenue.slice(0, 5).map((dish, idx) => (
                    <div key={dish.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium">{dish.name}</div>
                          <div className="text-xs text-muted-foreground">{dish.successOrders} đơn</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(dish.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Guest Analytics & Session Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guestAnalytics && (
          <Card>
            <CardHeader>
              <CardTitle>Thống kê khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tổng khách:</span>
                <span className="font-semibold">{totalGuests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">TB khách/phiên:</span>
                <span className="font-semibold">{avgGuestsPerSession.toFixed(1)}</span>
              </div>
              {guestLoginStats && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Đăng nhập:</span>
                    <span className="font-semibold">{guestLoginStats.loggedIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Vãng lai:</span>
                    <span className="font-semibold">{guestLoginStats.walkIn}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Khách quay lại:</span>
                <span className="font-semibold">{returningGuests}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {sessionStats && (
          <Card>
            <CardHeader>
              <CardTitle>Thống kê phiên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tổng phiên:</span>
                <span className="font-semibold">{sessionStats.totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Đã hoàn thành:</span>
                <span className="font-semibold">{sessionStats.completedSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Đang hoạt động:</span>
                <span className="font-semibold">{sessionStats.activeSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">DT TB/phiên:</span>
                <span className="font-semibold">{formatCurrency(sessionStats.avgRevenuePerSession)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">TB đơn/phiên:</span>
                <span className="font-semibold">{sessionStats.avgOrdersPerSession.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {tablePerformance && (
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất bàn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tổng số bàn:</span>
                <span className="font-semibold">{totalTables}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tỷ lệ sử dụng:</span>
                <span className="font-semibold">{utilizationRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">TB phiên/bàn:</span>
                <span className="font-semibold">{avgSessionsPerTable.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">TL TB phiên:</span>
                <span className="font-semibold">{(avgSessionDuration / 60).toFixed(0)} phút</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tỷ lệ luân chuyển:</span>
                <span className="font-semibold">{turnoverRate.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
