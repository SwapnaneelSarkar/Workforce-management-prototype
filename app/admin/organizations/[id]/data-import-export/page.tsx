"use client"

import { Header, Card } from "@/components/system"
import { Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrganizationDataImportExportPage() {
  return (
    <>
      <Header
        title="Data Import / Export"
        subtitle="Import and export organization data"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Data Import / Export" },
        ]}
      />

      <section className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Import Data</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Upload CSV or Excel files to import organization data.
            </p>
            <Button variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Export Data</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Export organization data in CSV or Excel format.
            </p>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </Card>
        </div>

        <Card>
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Advanced import/export features will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}






