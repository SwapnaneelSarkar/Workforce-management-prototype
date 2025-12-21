"use client"

import { Card } from "@/components/system"
import { Label } from "@/components/ui/label"
import { type Vendor } from "@/lib/admin-local-db"

type VendorProfileReadOnlyProps = {
  vendor: Vendor | null
  vendorId: string
}

export default function VendorProfileReadOnly({ vendor }: VendorProfileReadOnlyProps) {
  if (!vendor) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Vendor not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Vendor Logo</Label>
              {vendor.logo ? (
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {vendor.name.substring(0, 4).toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">No Logo</span>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Vendor Name</Label>
              <div className="text-sm text-foreground py-2">{vendor.name || "-"}</div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Industries</Label>
              {vendor.industries && vendor.industries.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {vendor.industries.map((industry) => (
                    <span
                      key={industry}
                      className="inline-flex items-center px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2">-</div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Certified Business Classifications</Label>
              {vendor.certifiedBusinessClassifications && vendor.certifiedBusinessClassifications.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {vendor.certifiedBusinessClassifications.map((classification) => (
                    <span
                      key={classification}
                      className="inline-flex items-center px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                    >
                      {classification}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2">-</div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">About Vendor</Label>
              <div className="text-sm text-foreground py-2 whitespace-pre-wrap">
                {vendor.aboutVendor || "-"}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-2 mb-4">
              <Label className="text-sm font-medium text-foreground">Status</Label>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    vendor.isActive ? "bg-primary" : "bg-muted-foreground"
                  }`}
                />
                <span className={vendor.isActive ? "text-foreground" : "text-muted-foreground"}>
                  {vendor.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Tax ID Number</Label>
              <div className="text-sm text-foreground py-2">{vendor.taxIdNumber || "-"}</div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Main Phone Number</Label>
              <div className="text-sm text-foreground py-2">{vendor.mainPhoneNumber || "-"}</div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Website</Label>
              <div className="text-sm text-foreground py-2">{vendor.website || "-"}</div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Address</Label>
              <div className="text-sm text-foreground py-2">{vendor.address || "-"}</div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Annual Revenue</Label>
              <div className="text-sm text-foreground py-2">{vendor.annualRevenue || "-"}</div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Employee Count</Label>
              <div className="text-sm text-foreground py-2">{vendor.employeeCount || "-"}</div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Internal Vendor ID Number</Label>
              <div className="text-sm text-foreground py-2">{vendor.internalVendorIdNumber || "-"}</div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Created Date</Label>
              <div className="text-sm text-foreground py-2">{vendor.createdDate || "-"}</div>
            </div>

            {vendor.activationDate && (
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Activation Date</Label>
                <div className="text-sm text-foreground py-2">
                  {new Date(vendor.activationDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </div>
              </div>
            )}

            {vendor.inactivationDate && (
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Inactivation Date</Label>
                <div className="text-sm text-foreground py-2">
                  {new Date(vendor.inactivationDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}


