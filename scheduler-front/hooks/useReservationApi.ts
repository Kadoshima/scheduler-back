// ===== hooks/useReservationApi.ts =====

import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

type ReservationData = {
  [date: string]: {
    [hour: string]: {
      title: string;
      content: string;
    };
  };
};

export function useReservationApi(initialDate: Date) {
  const [reservations, setReservations] = useState<ReservationData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ★ API のベース URL。存在しない場合はデフォルトを利用。
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://os3-378-22222.vs.sakura.ne.jp:5001';

  useEffect(() => {
    const initializeApi = async () => {
      const isApiReachable = await checkApiConnection();
      if (isApiReachable) {
        fetchReservations(initialDate);
      } else {
        setError('APIに接続できません。ネットワーク接続を確認してください。');
        setIsLoading(false);
      }
    };
    initializeApi();
  }, [initialDate]);

  // ここを実装
  const fetchReservations = async (date: Date) => {
    setIsLoading(true);
    setError(null);

    try {
      const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyyMMdd');
      const end = format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyyMMdd');
      const url = `${apiBaseUrl}/bookings?start=${start}&end=${end}`;

      console.log('Fetching reservations:', url);

      const response = await fetch(url);
      console.log('API Response Status:', response.status, response.statusText);

      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      console.log('Parsed reservation data:', data);

      if (!Array.isArray(data)) {
        throw new Error(`Invalid data format. Expected an array, got: ${typeof data}`);
      }

      // データを { date: { hour: { title, content }}} 形式に変換
      const formattedData: ReservationData = {};
      data.forEach((reservation: any) => {
        if (!formattedData[reservation.date]) {
          formattedData[reservation.date] = {};
        }
        formattedData[reservation.date][reservation.start_time] = {
          title: reservation.title,
          content: reservation.content,
        };
      });

      console.log('Formatted reservation data:', formattedData);
      setReservations(formattedData);
    } catch (err) {
      console.error('Error fetching reservation data:', err);
      setError(err instanceof Error ? err.message : '予約データの取得中に不明なエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const createReservation = async (date: string, startTime: string, title: string, content: string) => {
    try {
      const url = `${apiBaseUrl}/booking`;
      const requestBody = {
        date,
        start_time: startTime,
        title,
        content,
      };

      console.log('リクエスト情報:', {
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('レスポンス情報:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const responseText = await response.text();
      console.log('サーバーからの応答:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('サーバーの応答をJSONとして解析できませんでした:', responseText);
        console.error('解析エラー:', parseError);
        throw new Error(`サーバーからの応答が無効です。応答: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        console.error('サーバーがエラーを返しました:', response.status, result);
        throw new Error(result.error || `サーバーエラー: ${response.status}. 応答: ${JSON.stringify(result)}`);
      }

      console.log('予約が作成されました:', result);

      // ローカルの状態を更新
      setReservations(prev => ({
        ...prev,
        [date]: {
          ...prev[date],
          [startTime]: { title, content },
        },
      }));

      return true;
    } catch (err) {
      if (err instanceof Error) {
        console.error('予約作成中のエラー:', err.message);
        setError(err.message);
      } else {
        console.error('予約作成中の不明なエラー:', err);
        setError('予約の作成中に不明なエラーが発生しました。');
      }
      return false;
    }
  };

  const checkApiConnection = async () => {
    try {
      const url = `${apiBaseUrl}/api/health`;
      console.log('Checking API connection at:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API health check response:', {
        status: response.status,
        statusText: response.statusText,
      });

      if (response.ok) {
        console.log('API is reachable');
        return true;
      } else {
        const responseText = await response.text();
        console.error('API is not responding correctly. Response:', responseText);
        return false;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error checking API connection:', error.message);
        setError(`APIへの接続中にエラーが発生しました: ${error.message}`);
      } else {
        console.error('Unknown error checking API connection:', error);
        setError('APIへの接続中に不明なエラーが発生しました。');
      }
      return false;
    }
  };

  return { reservations, isLoading, error, fetchReservations, createReservation, checkApiConnection };
}
