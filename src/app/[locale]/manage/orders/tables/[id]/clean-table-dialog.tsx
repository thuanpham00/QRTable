"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CleanTableDialog({
  showModalCleaningTable,
  setShowModalCleaningTable,
  onConfirm,
  tableNumber,
  guestCount,
  isLoading = false,
}: {
  showModalCleaningTable: boolean;
  setShowModalCleaningTable: (value: boolean) => void;
  onConfirm: () => void;
  tableNumber: number;
  guestCount?: number;
  isLoading?: boolean;
}) {
  const t = useTranslations("ManageOrders");
  return (
    <Dialog
      open={showModalCleaningTable}
      onOpenChange={(open) => {
        // Chỉ xử lý khi user click X hoặc click outside, không xử lý khi đang loading
        if (!isLoading) {
          setShowModalCleaningTable(open);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            {t("cleanTableTitle")}
          </DialogTitle>
          <DialogDescription>{t("cleanTableIrreversible")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Box */}
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-orange-800 dark:text-orange-200">
                {t("cleanTablePreparing", { number: tableNumber })}
              </p>
              <p className="text-orange-700 dark:text-orange-300">{t("cleanTableConfirmSubtitle")}</p>
              <ul className="list-disc list-inside space-y-1 text-orange-700 dark:text-orange-300 ml-2">
                <li>{t("cleanTableAction1", { count: guestCount || 0 })}</li>
                <li>{t("cleanTableAction2")}</li>
                <li>{t("cleanTableAction3")}</li>
              </ul>
            </div>
          </div>

          {/* Confirmation Question */}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{t("cleanTableConfirmQuestion")}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setShowModalCleaningTable(false)} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                {t("processing")}
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                {t("cleanTableConfirmButton")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
