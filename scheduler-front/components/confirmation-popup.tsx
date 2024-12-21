import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatTimeRange } from '../utils/date-utils'
import { useState } from 'react'

type ConfirmationPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string, content: string) => void;
  date: string;
  hour: number;
};

export function ConfirmationPopup({ isOpen, onClose, onConfirm, date, hour }: ConfirmationPopupProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleConfirm = () => {
    onConfirm(title, content);
    setTitle('');
    setContent('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>予約の確認</DialogTitle>
          <DialogDescription>
            以下の日時で予約を確定しますか？
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-lg font-semibold">{date}</p>
          <p className="text-center text-lg font-semibold">{formatTimeRange(hour)}</p>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              タイトル
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="例：会議"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              内容
            </Label>
            <Input
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 6))}
              className="col-span-3"
              placeholder="6文字以内"
              maxLength={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleConfirm} disabled={!title || !content}>確定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

