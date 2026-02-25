"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Download, Upload, Trash2, AlertCircle } from "lucide-react"

export default function SettingsModule() {
  const searchParams = useSearchParams()
  const isGuest = searchParams.get("mode") === "guest"
  const [message, setMessage] = useState("")

  const handleExportJSON = () => {
    const data = storage.exportData(false)
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `smartspendhub-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage("Exported as JSON successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const handleExportCSV = () => {
    const transactions = storage.getTransactions(false)
    const csv = [
      "Date,Type,Category,Description,Amount\n",
      ...transactions.map((t) => `${t.date},${t.type},${t.category},"${t.description}",${t.amount}`),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `smartspendhub-transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setMessage("Exported as CSV successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result)
        storage.importData(data, false)
        setMessage("Imported data successfully!")
        setTimeout(() => setMessage(""), 3000)
      } catch (err) {
        setMessage("Failed to import. Invalid JSON file.")
        setTimeout(() => setMessage(""), 3000)
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to delete all data? This cannot be undone.")) {
      localStorage.removeItem("sshub:guest:transactions")
      localStorage.removeItem("sshub:guest:budgets")
      localStorage.removeItem("sshub:guest:saving-goals")
      localStorage.removeItem("sshub:guest:categories")
      setMessage("All data cleared!")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const transactions = storage.getTransactions(false).length
  const budgets = storage.getBudgets(false).length
  const goals = storage.getSavingGoals(false).length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-8 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          {isGuest && <p className="text-sm text-muted-foreground mb-6">Guest mode - data saved locally</p>}

          {message && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 text-sm">
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Data Summary */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="font-bold text-lg text-foreground mb-4">Data Summary</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold text-foreground">{transactions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budgets</p>
                  <p className="text-2xl font-bold text-foreground">{budgets}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Goals</p>
                  <p className="text-2xl font-bold text-foreground">{goals}</p>
                </div>
              </div>
            </div>

            {/* Export Data */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Download size={20} />
                Export Data
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Download your data for backup or analysis</p>
              <div className="space-y-2">
                <Button
                  onClick={handleExportJSON}
                  className="w-full bg-primary hover:bg-primary/90 text-white justify-start"
                >
                  <Download size={16} className="mr-2" />
                  Export as JSON
                </Button>
                <Button
                  onClick={handleExportCSV}
                  className="w-full bg-accent hover:bg-accent/90 text-white justify-start"
                >
                  <Download size={16} className="mr-2" />
                  Export as CSV
                </Button>
              </div>
            </div>

            {/* Import Data */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Upload size={20} />
                Import Data
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Restore your data from a previously exported file</p>
              <label>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload size={16} className="mr-2" />
                    Import JSON File
                  </label>
                </Button>
              </label>
            </div>

            {/* Danger Zone */}
            <div className="bg-destructive/10 rounded-lg p-6 border border-destructive/20">
              <h2 className="font-bold text-lg text-destructive mb-4 flex items-center gap-2">
                <AlertCircle size={20} />
                Danger Zone
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete all your data. This action cannot be undone.
              </p>
              <Button
                onClick={handleClearData}
                className="w-full bg-destructive hover:bg-destructive/90 text-white justify-start"
              >
                <Trash2 size={16} className="mr-2" />
                Delete All Data
              </Button>
            </div>

            {/* Information */}
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How it works</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Guest mode data is stored locally in your browser's localStorage</li>
                <li>• You can export and import data as JSON or CSV files</li>
                <li>• Sign up to save data permanently to the cloud</li>
                <li>• Your data is private and never shared</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
