import { Button } from "@/components/ui/button"

type ReservationSlotProps = {
  isReserved: boolean;
  title?: string;
  content?: string;
  onClick: () => void;
};

export function ReservationSlot({ isReserved, title, content, onClick }: ReservationSlotProps) {
  return (
    <Button
      variant={isReserved ? "secondary" : "outline"}
      className={`w-full h-full flex flex-col items-center justify-center p-1 ${
        isReserved 
          ? 'bg-pink-200 hover:bg-pink-300 text-pink-800 border-pink-300' 
          : 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300'
      }`}
      onClick={onClick}
      disabled={isReserved}
    >
      {isReserved && (
        <>
          <span className="text-xs font-semibold">{title}</span>
          <span className="text-xs">{content}</span>
        </>
      )}
    </Button>
  );
}

