import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

type WeekSelectorProps = {
  currentWeek: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
};

export function WeekSelector({ currentWeek, onPrevWeek, onNextWeek }: WeekSelectorProps) {
  return (
    <div className="flex items-center justify-between mb-4 bg-orange-100 p-4 rounded-t-lg border border-orange-300">
      <Button variant="outline" onClick={onPrevWeek}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        前の週
      </Button>
      <h2 className="text-lg font-semibold">
        {currentWeek.getFullYear()}年{currentWeek.getMonth() + 1}月
      </h2>
      <Button variant="outline" onClick={onNextWeek}>
        次の週
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

