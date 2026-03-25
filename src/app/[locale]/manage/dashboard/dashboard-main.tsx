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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { AlertCircle, Package, TrendingUp, Utensils, Users, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DateRangeType = "date" | "month" | "year";

const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());
export default function DashboardMain() {
  const t = useTranslations("ManageDashboard");
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("date");

  const [fromDate, setFromDate] = useState(initFromDate);
  const [toDate, setToDate] = useState(initToDate);

  const { data, refetch } = useDashboardIndicator({
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
  const totalOrders = orderAnalytics?.totalOrders ?? 0;
  const cancellationRate = orderAnalytics?.cancellationRate ?? 0;

  // Session Statistics
  const sessionStats = data?.payload.data.sessionStats;

  // Dishes
  const topDishesByQuantity = data?.payload.data.topDishesByQuantity ?? [];
  const topDishesByRevenue = data?.payload.data.topDishesByRevenue ?? [];

  // Inventory Analytics
  const inventoryAnalytics = data?.payload.data.inventoryAnalytics;
  const inventoryOverview = inventoryAnalytics?.overview;
  const batchStatus = inventoryAnalytics?.batchStatus;
  const importAnalytics = inventoryAnalytics?.importAnalytics;
  const exportAnalytics = inventoryAnalytics?.exportAnalytics;
  const inventoryAlerts = inventoryAnalytics?.alerts;

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
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{t("dateRangeTypeLabel")}</label>
            <Select value={dateRangeType} onValueChange={handleDateRangeTypeChange}>
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{t("byDate")}</SelectItem>
                <SelectItem value="month">{t("byMonth")}</SelectItem>
                <SelectItem value="year">{t("byYear")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <label className="text-sm font-medium">{t("from")}</label>
            <Input
              type={getInputType()}
              placeholder={t("from")}
              className="w-52"
              value={getInputValue(fromDate)}
              onChange={(e) => handleDateChange(e.target.value, true)}
              {...(dateRangeType === "year" && { min: 2000, max: 2100 })}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{t("to")}</label>
            <Input
              type={getInputType()}
              placeholder={t("to")}
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
        <div>
          <Button variant="outline" className="bg-red-500! hover:bg-red-600!" onClick={() => refetch()}>
            <RefreshCcw />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("overview")}
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("sales")}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="h-4 w-4" />
            {t("inventory")}
          </TabsTrigger>
          <TabsTrigger value="dishes" className="gap-2">
            <Utensils className="h-4 w-4" />
            {t("dishes")}
          </TabsTrigger>
          <TabsTrigger value="tables-guests" className="gap-2">
            <Users className="h-4 w-4" />
            {t("tablesAndGuests")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Basic Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
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
                <CardTitle className="text-sm font-medium">{t("guests")}</CardTitle>
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
                <p className="text-xs text-muted-foreground">{t("orderedFood")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("orders")}</CardTitle>
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
                <CardTitle className="text-sm font-medium">{t("servingTables")}</CardTitle>
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

          {/* Revenue Chart */}
          <RevenueLineChart chartData={revenueByDate} />

          {/* Quick Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessionStats && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("sessionStatsTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("totalSessions")}</span>
                    <span className="font-semibold">{sessionStats.totalSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("completedSessions")}</span>
                    <span className="font-semibold">{sessionStats.completedSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("activeSessions")}</span>
                    <span className="font-semibold">{sessionStats.activeSessions}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {inventoryOverview && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("inventoryOverview")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("totalValue")}</span>
                    <span className="font-semibold">{formatCurrency(inventoryOverview.totalValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("lowStock")}</span>
                    <Badge variant={inventoryOverview.lowStockCount > 0 ? "destructive" : "secondary"}>
                      {inventoryOverview.lowStockCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("expiringSoon")}</span>
                    <Badge variant={inventoryOverview.expiringSoonCount > 0 ? "destructive" : "secondary"}>
                      {inventoryOverview.expiringSoonCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {orderAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("totalOrders")}</span>
                    <span className="font-semibold">{totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("cancellationRate")}</span>
                    <span className="font-semibold">{cancellationRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("avgOrdersPerSession")}</span>
                    <span className="font-semibold">{orderAnalytics.avgOrdersPerSession.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          {/* Payment Analytics */}
          {paymentAnalytics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("totalPayments")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPayments}</div>
                  <p className="text-xs text-muted-foreground">{t("invoices")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("avgPaymentValue")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(avgPaymentValue)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("groupPaymentRate")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{groupPaymentRate.toFixed(1)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("paymentGroups")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{paymentGroupStats?.count ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {t("avgGuestsPerGroup", { value: paymentGroupStats?.avgGuestsPerGroup.toFixed(1) ?? 0 })}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Revenue Line Chart */}
          <RevenueLineChart chartData={revenueByDate} />

          {/* Payment Method & Order Status */}
          {paymentMethodBreakdown && orderStatusBreakdown && (
            <div className="grid gap-4 md:grid-cols-2">
              <PaymentMethodChart paymentMethodBreakdown={paymentMethodBreakdown} />
              <OrderStatusChart orderStatusBreakdown={orderStatusBreakdown} />
            </div>
          )}

          {/* Session & Order Analytics */}
          {(sessionStats || orderAnalytics) && (
            <div className="grid gap-4 md:grid-cols-2">
              {sessionStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("sessionStatsTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t("totalSessions")}</span>
                      <span className="font-semibold">{sessionStats.totalSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t("completedSessions")}</span>
                      <span className="font-semibold">{sessionStats.completedSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t("activeSessions")}</span>
                      <span className="font-semibold">{sessionStats.activeSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t("avgRevenuePerSession")}</span>
                      <span className="font-semibold">
                        {formatCurrency(sessionStats.avgRevenuePerSession)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t("avgOrdersPerSession")}</span>
                      <span className="font-semibold">{sessionStats.avgOrdersPerSession.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {orderAnalytics && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("orderAnalytics")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t("totalOrders")}</span>
                      <span className="font-semibold">{totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t("cancellationRate")}</span>
                      <span className="font-semibold">{cancellationRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t("avgOrdersPerSession")}</span>
                      <span className="font-semibold">{orderAnalytics.avgOrdersPerSession.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {inventoryAnalytics && (
            <>
              {/* Inventory Overview */}
              {inventoryOverview && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("totalValue")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(inventoryOverview.totalValue)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("lowStock")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{inventoryOverview.lowStockCount}</div>
                      <p className="text-xs text-red-600">{t("itemsNeedReorder")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("outOfStock")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{inventoryOverview.outOfStockCount}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("expiringSoon")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{inventoryOverview.expiringSoonCount}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Batch Status */}
              {batchStatus && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("batchStatus")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{batchStatus.Available}</div>
                        <p className="text-xs text-muted-foreground">{t("available")}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{batchStatus.Low}</div>
                        <p className="text-xs text-muted-foreground">{t("low")}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{batchStatus.Empty}</div>
                        <p className="text-xs text-muted-foreground">{t("empty")}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{batchStatus.Expired}</div>
                        <p className="text-xs text-muted-foreground">{t("expired")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Import & Export Analytics */}
              <div className="grid gap-4 md:grid-cols-2">
                {importAnalytics && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("importAnalytics")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("totalReceipts")}</span>
                        <span className="font-semibold">{importAnalytics.totalReceipts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("totalValue")}</span>
                        <span className="font-semibold">{formatCurrency(importAnalytics.totalValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("totalQuantity")}</span>
                        <span className="font-semibold">{importAnalytics.totalQuantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("avgReceiptValue")}</span>
                        <span className="font-semibold">
                          {formatCurrency(importAnalytics.avgReceiptValue)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {exportAnalytics && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("exportAnalytics")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("totalReceipts")}</span>
                        <span className="font-semibold">{exportAnalytics.totalReceipts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("totalValue")}</span>
                        <span className="font-semibold">{formatCurrency(exportAnalytics.totalValue)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Top Suppliers */}
              {importAnalytics?.topSuppliers && importAnalytics.topSuppliers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("topSuppliers")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {importAnalytics.topSuppliers.map((supplier, idx) => (
                        <div key={supplier.supplierId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-medium">{supplier.supplierName}</div>
                              <div className="text-xs text-muted-foreground">
                                {supplier.receiptCount} {t("receipts")}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(supplier.totalAmount)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Alerts */}
              {inventoryAlerts &&
                (inventoryAlerts.lowStockItems?.length > 0 ||
                  inventoryAlerts.expiringSoonBatches?.length > 0) && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {inventoryAlerts.lowStockItems && inventoryAlerts.lowStockItems.length > 0 && (
                      <Card className="border-red-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            {t("lowStockAlert")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {inventoryAlerts.lowStockItems.slice(0, 5).map((item) => (
                              <div key={item.ingredientId} className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-sm">{item.ingredientName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {t("current")}: {item.currentQuantity} {item.unit}
                                  </div>
                                </div>
                                <Badge variant="destructive">{item.stockLevel.toFixed(0)}%</Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {inventoryAlerts.expiringSoonBatches &&
                      inventoryAlerts.expiringSoonBatches.length > 0 && (
                        <Card className="border-yellow-200">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-yellow-600" />
                              {t("expiringAlert")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {inventoryAlerts.expiringSoonBatches.slice(0, 5).map((batch) => (
                                <div key={batch.batchNumber} className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium text-sm">{batch.ingredientName}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {batch.quantity} {batch.unit} - {t("batch")}: {batch.batchNumber}
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-yellow-600">
                                    {batch.daysUntilExpiry} {t("days")}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                  </div>
                )}

              {/* Export by Type */}
              {exportAnalytics?.exportByType && exportAnalytics.exportByType.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("exportByType")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {exportAnalytics.exportByType.map((type) => (
                        <div key={type.type} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{type.type}</div>
                            <div className="text-xs text-muted-foreground">
                              {type.count} {t("receipts")}
                            </div>
                          </div>
                          <div className="text-right font-semibold">{formatCurrency(type.totalAmount)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top Ingredients by Usage */}
              {exportAnalytics?.topIngredientsByUsage && exportAnalytics.topIngredientsByUsage.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("topIngredientsByUsage")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {exportAnalytics.topIngredientsByUsage.map((ingredient, idx) => (
                        <div key={ingredient.ingredientId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-medium">{ingredient.ingredientName}</div>
                              <div className="text-xs text-muted-foreground">
                                {ingredient.totalQuantity} {ingredient.ingredientUnit}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(ingredient.totalValue)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Dishes Tab */}
        <TabsContent value="dishes" className="space-y-4">
          {/* Category Performance Chart */}
          {categoryPerformance.length > 0 && (
            <CategoryPerformanceChart categoryPerformance={categoryPerformance} />
          )}

          {/* Top Dishes */}
          {(topDishesByQuantity.length > 0 || topDishesByRevenue.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {topDishesByQuantity.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("topDishesByQuantity")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topDishesByQuantity.slice(0, 10).map((dish, idx) => (
                        <div key={dish.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-medium">{dish.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatCurrency(dish.price)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{dish.successOrders}</div>
                            <div className="text-xs text-muted-foreground">{t("orderUnit")}</div>
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
                    <CardTitle>{t("topDishesByRevenue")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topDishesByRevenue.slice(0, 10).map((dish, idx) => (
                        <div key={dish.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-medium">{dish.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {dish.successOrders} {t("orderUnit")}
                              </div>
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
        </TabsContent>

        {/* Tables & Guests Tab */}
        <TabsContent value="tables-guests" className="space-y-4">
          {/* Table & Guest Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tablePerformance && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("tablePerformanceTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("totalTables")}</span>
                    <span className="font-semibold">{totalTables}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("utilizationRate")}</span>
                    <span className="font-semibold">{utilizationRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("avgSessionsPerTable")}</span>
                    <span className="font-semibold">{avgSessionsPerTable.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {guestAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("guestStatsTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("totalGuests")}</span>
                    <span className="font-semibold">{totalGuests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("avgGuestsPerSession")}</span>
                    <span className="font-semibold">{avgGuestsPerSession.toFixed(1)}</span>
                  </div>
                  {guestLoginStats && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("loggedIn")}</span>
                        <span className="font-semibold">{guestLoginStats.loggedIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("walkIn")}</span>
                        <span className="font-semibold">{guestLoginStats.walkIn}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("returningGuests")}</span>
                    <span className="font-semibold">{returningGuests}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {timeAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("timeAnalytics")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("avgSessionDuration")}</span>
                    <span className="font-semibold">
                      {(avgSessionDuration / 60).toFixed(0)} {t("minutes")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("turnoverRate")}</span>
                    <span className="font-semibold">{turnoverRate.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {peakHours.length > 0 && <PeakHoursChart peakHours={peakHours} />}
            {topTables.length > 0 && <TablePerformanceChart topTables={topTables} />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
