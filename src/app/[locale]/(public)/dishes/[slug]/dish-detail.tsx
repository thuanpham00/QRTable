import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Clock, Flame, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { MenuItemResType } from "@/schemaValidations/menu.schema";

const getSpicy = (value: number) => {
  switch (value) {
    case 0:
      return "Không cay";
    case 1:
      return "Ít cay";
    case 2:
      return "Cay vừa";
    case 3:
      return "Rất cay";
    default:
      return "Không cay";
  }
};

const getSpicyLevel = (level: number) => {
  return Array.from({ length: level }, (_, i) => (
    <Flame key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
  ));
};

const getStatusBadge = (status: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: Record<string, { variant: any; label: string }> = {
    Available: { variant: "default", label: "Còn hàng" },
    OutOfStock: { variant: "destructive", label: "Hết hàng" },
    Hidden: { variant: "secondary", label: "Ẩn" },
  };
  return variants[status] || { variant: "secondary", label: status };
};

const getDishStatusBadge = (status: string) => {
  return status === "Active"
    ? { variant: "default" as const, label: "Đang bán" }
    : { variant: "secondary" as const, label: "Ngừng bán" };
};

export default function DishDetail({ dish }: { dish: MenuItemResType["data"] }) {
  const { dish: dishData, price, status } = dish;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image
            src={dishData.image}
            alt={dishData.name}
            width={400}
            height={400}
            className="object-cover w-full h-full"
            priority
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-orange-500 px-4 py-1">
                {dishData.category.name}
              </Badge>
              <Badge {...getStatusBadge(status)} />
              <Badge {...getDishStatusBadge(dishData.status)} />
            </div>
            <h1 className="text-4xl font-bold mb-2">{dishData.name}</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{price.toLocaleString("vi-VN")}₫</span>
              {price !== dish.price && (
                <span className="text-lg text-muted-foreground line-through">
                  {dish.price.toLocaleString("vi-VN")}₫
                </span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Mô tả</h2>
            <p className="text-muted-foreground leading-relaxed">{dishData.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Thời gian</div>
                <div className="font-semibold">{dishData.preparationTime} phút</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <div className="flex gap-1">{getSpicyLevel(dishData.spicyLevel)}</div>
              <div>
                <div className="text-sm text-muted-foreground">Độ cay</div>
                <div className="font-semibold">{getSpicy(dishData.spicyLevel)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Lượt gọi món</div>
                <div className="font-semibold">{dishData.popularity}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Nguyên liệu chính</div>
                <div className="font-semibold">{dishData.ingredients?.join(", ")}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
          <p>
            Từ khóa tìm kiếm: <span className="text-foreground">{dishData.searchKeywords}</span>
          </p>
          <p>
            Cập nhật lần cuối:{" "}
            <span className="text-foreground">
              {format(new Date(dishData.updatedAt), "dd/MM/yyyy HH:mm")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
