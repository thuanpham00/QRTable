"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuItemStatus } from "@/constants/type";
import { Minus, Plus } from "lucide-react";

export default function Quantity({
  value,
  onChange,
  status,
}: {
  value: number;
  onChange: (value: number) => void;
  status: string;
}) {
  return (
    <div className="flex gap-1 ">
      <Button
        className="h-6 w-6 p-0"
        onClick={() => {
          if (value === 0) return;
          onChange(value - 1);
        }}
        disabled={value === 0 || status === MenuItemStatus.OUT_OF_STOCK}
      >
        <Minus className="w-3 h-3" />
      </Button>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="text-center h-6 p-1 w-8"
        value={value}
        onChange={(e) => {
          const numberValue = Number(e.target.value);
          if (isNaN(numberValue)) {
            return;
          }
          if (status === MenuItemStatus.OUT_OF_STOCK) {
            return;
          }
          onChange(numberValue);
        }}
      />
      <Button
        className="h-6 w-6 p-0"
        onClick={() => {
          if (value === 50) return;
          onChange(value + 1);
        }}
        disabled={value === 50 || status === MenuItemStatus.OUT_OF_STOCK}
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
}
