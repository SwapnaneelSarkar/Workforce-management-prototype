"use client"

import React from "react"
import { Plus } from "lucide-react"
import { FloatingActionButton, useToast } from "@/components/system"
import { mockVendors, mockVendorDocuments } from "@/lib/mock-data"

export default function VendorListPage() {
  const [vendors] = React.useState(mockVendors)
  const [selectedVendor, setSelectedVendor] = React.useState<string | null>(null)
  const [uploadMode, setUploadMode] = React.useState(false)
  const { pushToast } = useToast()

  const vendor = selectedVendor ? vendors.find((v) => v.id === selectedVendor) : null

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <button className="border border-gray-300 h-10 px-6 bg-gray-100 font-semibold">Add Vendor</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-300 p-4">
          <div className="text-xs text-gray-600 font-semibold">ACTIVE VENDORS</div>
          <div className="text-2xl font-bold">{vendors.length}</div>
        </div>
        <div className="border border-gray-300 p-4">
          <div className="text-xs text-gray-600 font-semibold">TOTAL CLIENTS</div>
          <div className="text-2xl font-bold">{vendors.reduce((sum, v) => sum + v.activeClients, 0)}</div>
        </div>
        <div className="border border-gray-300 p-4">
          <div className="text-xs text-gray-600 font-semibold">SERVICES</div>
          <div className="text-2xl font-bold">{new Set(vendors.map((v) => v.service)).size}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Vendors List */}
        <div className="col-span-2">
          <div className="border border-gray-300 overflow-hidden">
            <div className="border-b border-gray-300 p-4 font-bold grid grid-cols-4 bg-gray-50">
              <div>Vendor Name</div>
              <div>Service</div>
              <div>Clients</div>
              <div>Status</div>
            </div>

            {vendors.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVendor(v.id)}
                className={`border-b border-gray-300 p-4 grid grid-cols-4 w-full text-left hover:bg-gray-50 ${
                  selectedVendor === v.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="text-sm font-semibold">{v.name}</div>
                <div className="text-sm">{v.service}</div>
                <div className="text-sm">{v.activeClients}</div>
                <div className="text-xs px-2 py-1 w-fit font-semibold bg-green-50 text-green-700">Active</div>
              </button>
            ))}
          </div>
        </div>

        {/* Vendor Detail Panel */}
        {vendor && (
          <div className="border border-gray-300 p-6 h-fit sticky top-8">
            <button onClick={() => setSelectedVendor(null)} className="text-sm text-gray-600 mb-4">
              × Close
            </button>

            <div className="space-y-4">
              <div>
                <div className="text-lg font-bold mb-1">{vendor.name}</div>
                <div className="text-xs text-gray-600">{vendor.service}</div>
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="text-xs text-gray-600 font-semibold mb-2">CONTACT INFORMATION</div>
                <div className="text-sm space-y-1">
                  <div>{vendor.contact}</div>
                  <div>{vendor.phone}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-600 font-semibold mb-2">CERTIFICATIONS</div>
                <div className="space-y-1">
                  {vendor.certifications.map((cert, idx) => (
                    <div key={idx} className="text-sm px-2 py-1 bg-gray-50 border border-gray-300">
                      {cert}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-600 font-semibold mb-2">ACTIVE CLIENTS</div>
                <div className="text-2xl font-bold">{vendor.activeClients}</div>
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="text-xs text-gray-600 font-semibold mb-2">DOCUMENTS</div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {mockVendorDocuments.map((doc) => (
                    <div key={doc.id} className="text-xs p-2 border border-gray-300 bg-gray-50">
                      <div className="font-semibold">{doc.name}</div>
                      <div className="text-gray-600">{doc.uploadDate}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4 space-y-2">
                <button className="border border-gray-300 h-9 w-full bg-gray-100 text-sm font-semibold">
                  Edit Vendor
                </button>
                <button
                  onClick={() => setUploadMode(!uploadMode)}
                  className="border border-gray-300 h-9 w-full bg-gray-100 text-sm font-semibold"
                >
                  Upload Document
                </button>
              </div>

              {uploadMode && (
                <div className="border-t border-gray-300 pt-4">
                  <input
                    type="text"
                    placeholder="File name"
                    className="border border-gray-300 h-8 w-full p-2 text-sm mb-2"
                  />
                  <button className="border border-gray-300 h-8 w-full bg-gray-100 text-sm">Upload</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <FloatingActionButton icon={<Plus className="h-4 w-4" aria-hidden />} label="Add vendor" onClick={() => pushToast({ title: "Vendor onboarding coming soon" })} />
    </div>
  )
}
