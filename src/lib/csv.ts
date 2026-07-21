import type { AffectedRow } from "./aggregator"

export function toCsv(rows: AffectedRow[]): string {
  const header = "Household,Address,Needs,Status"
  const lines = rows.map((row) => {
    const needs = row.needs.join("; ")
    return `"${row.household.household_head_name}","${row.household.address}","${needs}","${row.status}"`
  })
  return [header, ...lines].join("\n")
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
