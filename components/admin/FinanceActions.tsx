"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download } from "lucide-react"

export function RetryPaymentButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRetry() {
    if (!confirm("Deseja realmente reenviar o link de pagamento?")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/finance/retry/${paymentId}`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao reenviar pagamento")
      }

      alert("Link de pagamento reenviado com sucesso!")
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleRetry}
      disabled={loading}
    >
      <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Reenviando..." : "Reenviar"}
    </Button>
  )
}

export function ExportCSVButton({ 
  status, 
  dateFrom, 
  dateTo 
}: { 
  status?: string
  dateFrom?: string
  dateTo?: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (status) params.append("status", status)
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)

      const response = await fetch(`/api/admin/finance/export?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Erro ao exportar dados")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleExport}
      disabled={loading}
    >
      <Download className={`h-4 w-4 mr-2 ${loading ? "animate-bounce" : ""}`} />
      {loading ? "Exportando..." : "Exportar CSV"}
    </Button>
  )
}
