"use client";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { getTableLink } from "@/lib/utils";
import { OrderModeType } from "@/constants/type";
import { useParams } from "next/navigation";

export default function QrCodeTable({
  token,
  tableNumber,
  type,
  width = 250,
}: {
  token: string;
  tableNumber: number;
  type: string;
  width?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { locale } = useParams();
  useEffect(() => {
    // tạo 1 cái canvas ảo để thư viện QRCode vẽ lên đó
    // và chúng ta edit thẻ canvas thật
    // cuối cùng thì chúng ta đưa cái thẻ canvas ảo chứa QR code ở trên vào thẻ canvas thật
    const canvas = canvasRef.current!;
    canvas.height = width + 70;
    canvas.width = width;
    const canvasContext = canvas.getContext("2d")!;
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    canvasContext.font = "20px Arial";
    canvasContext.fillStyle = "black";
    canvasContext.textAlign = "center";
    canvasContext.fillText(
      type === OrderModeType.DINE_IN ? `Bàn ${tableNumber}` : "Mang đi",
      canvas.width / 2,
      canvas.width + 20,
    );
    canvasContext.fillText(`Quét để gọi món`, canvas.width / 2, canvas.width + 50);

    const virtualCanvas = document.createElement("canvas");
    QRCode.toCanvas(
      virtualCanvas,
      getTableLink({
        locale: locale as string,
        token: token,
        tableNumber: tableNumber,
        type, // qr mang về hay ăn tại quán
      }),
      { width },
      (error) => {
        if (error) console.error(error);
        canvasContext.drawImage(virtualCanvas, 0, 0, width, width);
      },
    );
  }, [token, tableNumber, width, type, locale]);
  return <canvas ref={canvasRef} />;
}
