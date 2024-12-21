import { ReservationTable } from '../components/reservation-table'

export default function Home() {
  return (
    <main className="min-h-screen bg-orange-50">
      <h1 className="text-3xl font-bold text-center py-6 text-orange-800">
        Future Room Scheduler
      </h1>
      <ReservationTable />
    </main>
  )
}

