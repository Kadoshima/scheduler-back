import express from 'express';
import mongoose from 'mongoose';
import { addDays, subDays, format, parse } from 'date-fns';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());

// CORS設定 一旦全部許す
app.use(cors());

// MongoDB接続
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// 予約スキーマ
const reservationSchema = new mongoose.Schema({
  date: String,
  startTime: String,
  title: String,
  content: String
});

const Reservation = mongoose.model('Reservation', reservationSchema);

// 予約情報取得API
app.get('/booking/list/:date', async (req, res) => {
  try {
    const targetDate = parse(req.params.date, 'yyyyMMdd', new Date());
    const startDate = subDays(targetDate, 7);
    const endDate = addDays(targetDate, 7);

    const reservations = await Reservation.find({
      date: {
        $gte: format(startDate, 'yyyyMMdd'),
        $lte: format(endDate, 'yyyyMMdd')
      }
    });

    const result = reservations.reduce((acc, reservation) => {
      if (!acc[reservation.date]) {
        acc[reservation.date] = {};
      }
      acc[reservation.date][reservation.startTime] = {
      title: reservation.title,
        content: reservation.content
      };
      return acc;
    }, {});

    res.json(result);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 予約作成API
app.post('/booking', async (req, res) => {
  try {
    const { date, start_time, title, content } = req.body;

    // 入力バリデーション
    if (!date || !start_time || !title || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 日付と時間のフォーマット確認
    if (!/^\d{8}$/.test(date) || !/^\d{1,2}$/.test(start_time)) {
      return res.status(400).json({ error: 'Invalid date or time format' });
    }

    // 重複チェック
    const existingReservation = await Reservation.findOne({ date, startTime: start_time });
    if (existingReservation) {
      return res.status(409).json({ error: 'This time slot is already reserved' });
    }

    const newReservation = new Reservation({
      date,
      startTime: start_time,
      title,
      content
    });

    await newReservation.save();
    res.status(201).json({ message: 'Reservation created successfully' });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// テスト用のダミーデータ作成
// async function createDummyData() {
//   const today = new Date();
//   for (let i = -7; i <= 7; i++) {
//     const date = addDays(today, i);
//     const formattedDate = format(date, 'yyyyMMdd');
//     for (let hour = 9; hour <= 17; hour++) {
//       if (Math.random() < 0.3) {  // 30%の確率で予約を作成
//         await Reservation.create({
//           date: formattedDate,
//           startTime: hour.toString(),
//           title: `テスト予約 ${i}-${hour}`,
//           content: `テスト内容 ${i}-${hour}`
//         });
//       }
//     }
//   }
//   console.log('Dummy data created');
// }

// テスト用のダミーデータを作成（本番環境では削除してください）
// createDummyData();

