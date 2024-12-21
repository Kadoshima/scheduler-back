'use client'

import { useState } from 'react'
import { addWeeks, subWeeks, format, parseISO } from 'date-fns'
import { WeekSelector } from './week-selector'
import { ReservationSlot } from './reservation-slot'
import { ConfirmationPopup } from './confirmation-popup'
import { getWeekDates, formatDate, formatTime } from '../utils/date-utils'
import { useReservationApi } from '../hooks/useReservationApi'
import React from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9);

export function ReservationTable() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null);
  const { reservations, isLoading, error, fetchReservations, createReservation } = useReservationApi(currentWeek);

  const weekDates = getWeekDates(currentWeek);

  const handlePrevWeek = () => {
    const newWeek = subWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
    fetchReservations(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = addWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
    fetchReservations(newWeek);
  };

  const handleSlotClick = (date: Date, hour: number) => {
    setSelectedSlot({ date: format(date, 'yyyyMMdd'), hour });
  };

  const handleConfirmReservation = async (title: string, content: string) => {
    if (selectedSlot) {
      const success = await createReservation(
        selectedSlot.date,
        selectedSlot.hour.toString(),
        title,
        content
      );
      if (success) {
        setSelectedSlot(null);
      } else {
        // エラーメッセージは既にuseReservationApi内でセットされているので、
        // ここでは追加のアクションは必要ありません。
        // エラーメッセージはコンポーネントのトップレベルで表示されます。
      }
    }
  };

  const isReserved = (date: string, hour: number): boolean => {
    return !!reservations[date]?.[hour];
  };

  const getReservationInfo = (date: string, hour: number) => {
    return reservations[date]?.[hour];
  };

  if (isLoading) return <div>予約情報を読み込んでいます...</div>;
  if (error) return (
    <Alert variant="destructive">
      <AlertTitle>エラー</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  return (
    <div className="container mx-auto p-4">
      <WeekSelector
        currentWeek={currentWeek}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />
      <div className="grid grid-cols-[auto,repeat(7,1fr)] border border-orange-300">
        <div className="font-semibold p-2 bg-orange-100 border-b border-r border-orange-300">時間</div>
        {weekDates.map((date) => (
          <div key={date.toISOString()} className="font-semibold text-center p-2 bg-orange-100 border-b border-orange-300">
            {formatDate(date)}
          </div>
        ))}
        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            <div className="font-semibold p-2 border-r border-b border-orange-300 bg-orange-50">
              {formatTime(hour)}
            </div>
            {weekDates.map((date) => {
              const formattedDate = format(date, 'yyyyMMdd');
              const reservationInfo = getReservationInfo(formattedDate, hour);
              return (
                <div key={`${date.toISOString()}-${hour}`} className="p-1 border-b border-orange-300">
                  <ReservationSlot
                    isReserved={isReserved(formattedDate, hour)}
                    title={reservationInfo?.title}
                    content={reservationInfo?.content}
                    onClick={() => handleSlotClick(date, hour)}
                  />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      {selectedSlot && (
        <ConfirmationPopup
          isOpen={true}
          onClose={() => setSelectedSlot(null)}
          onConfirm={handleConfirmReservation}
          date={formatDate(parseISO(selectedSlot.date))}
          hour={selectedSlot.hour}
        />
      )}
    </div>
  );
}

