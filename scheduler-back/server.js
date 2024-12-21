import express from 'express';
import mongoose from 'mongoose';
import { addDays, subDays, format, parse } from 'date-fns';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import https from 'https';

dotenv.config();

const app = express();

// 証明書ファイルのパス
// Let’s Encrypt で発行した場所を指定
const SSL_KEY_PATH  = '/etc/letsencrypt/live/os3-378-22222.vs.sakura.ne.jp/privkey.pem';
const SSL_CERT_PATH = '/etc/letsencrypt/live/os3-378-22222.vs.sakura.ne.jp/fullchain.pem';

const options = {
  key: fs.readFileSync(SSL_KEY_PATH, 'utf-8'),
  cert: fs.readFileSync(SSL_CERT_PATH, 'utf-8')
};

// const PORT = 443;

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

// ヘルスチェックAPI
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy.' });
});

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

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 予約作成API
app.post('/booking', async (req, res) => {
  try {
    const { date, start_time, title, content } = req.body;

    // 必須項目のバリデーション
    const missingFields = [];
    if (!date) missingFields.push('date');
    if (!start_time) missingFields.push('start_time');
    if (!title) missingFields.push('title');
    if (!content) missingFields.push('content');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields,  
        message: `必須項目が足りません: ${missingFields.join(', ')}`
      });
    }

    // 日付フォーマット確認
    if (!/^\d{8}$/.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: '日付は「yyyyMMdd」形式で指定してください'
      });
    }

    // 時間フォーマット確認
    if (!/^\d{1,2}$/.test(start_time)) {
      return res.status(400).json({
        error: 'Invalid time format',
        message: '時間は1桁または2桁の数字で指定してください（例：9, 10, 17）'
      });
    }

    // 重複チェック
    const existingReservation = await Reservation.findOne({ date, startTime: start_time });
    if (existingReservation) {
      return res.status(409).json({
        error: 'Time slot already reserved',
        message: `指定された時間帯（${start_time}時）はすでに予約されています`
      });
    }

    // 予約作成
    const newReservation = new Reservation({
      date,
      startTime: start_time,
      title,
      content
    });

    await newReservation.save();
    return res.status(201).json({
      message: 'Reservation created successfully',
      data: {
        date,
        startTime: start_time,
        title,
        content
      }
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

const httpsServer = https.createServer(options, app);
httpsServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});