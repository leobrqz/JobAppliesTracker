import { CalendarStrip } from "./CalendarStrip"
import { PlatformRankingTable } from "./PlatformRankingTable"
import { RecentApplicationsList } from "./RecentApplicationsList"
import { StatusDistributionChart } from "./StatusDistributionChart"
import { SummaryCards } from "./SummaryCards"
import { WeeklyHeatmap } from "./WeeklyHeatmap"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <SummaryCards />
      <CalendarStrip />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatusDistributionChart />
        <RecentApplicationsList />
      </div>
      <PlatformRankingTable />
      <WeeklyHeatmap />
    </div>
  )
}
