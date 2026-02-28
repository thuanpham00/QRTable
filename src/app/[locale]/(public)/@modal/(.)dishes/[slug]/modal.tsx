"use client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "@/i18n/routing";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
export default function ModalDishIntercepting({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          router.back();
        }
      }}
    >
      <DialogContent className="max-w-225! sm:w-full! w-[90vw] max-h-[80vh]! overflow-y-scroll">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Tiêu đề dialog</DialogTitle>
            <DialogDescription>Mô tả nội dung</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        {children}
      </DialogContent>
    </Dialog>
  );
}
