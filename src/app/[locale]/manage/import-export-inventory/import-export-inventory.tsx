"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export default function ImportExportInventory() {
  const t = useTranslations("ManageImportExportInventory");

  const [selectedTabPage, setSelectedTabPage] = useState<string>("export");

  return (
    <div className="mt-4">
      <Tabs value={selectedTabPage} onValueChange={(val) => setSelectedTabPage(val)} className="mb-4">
        <TabsList variant="default">
          <TabsTrigger value={"export"}>
            <span>{t("exportTab")}</span>
          </TabsTrigger>
          <TabsTrigger value={"import"}>
            <span>{t("importTab")}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
