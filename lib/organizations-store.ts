// Re-export types and functions from admin-local-db for backward compatibility
// This file acts as a compatibility layer to avoid breaking existing imports
import type {
  AdminLocalDbOrganizationLocation,
  AdminLocalDbOrganizationEntry,
} from "./admin-local-db"
import {
  getAllOrganizations,
  getOrganizationById,
  getOrganizationByEmail,
  addOrganization,
  updateOrganization,
  deleteOrganization,
  getAllLocations,
  getLocationById,
  addDepartment,
  removeDepartment,
  updateDepartment,
  getAllDepartments,
} from "./admin-local-db"

export type OrganizationLocation = AdminLocalDbOrganizationLocation
export type Organization = AdminLocalDbOrganizationEntry

export {
  getAllOrganizations as readOrganizations,
  getOrganizationById,
  getOrganizationByEmail,
  addOrganization,
  updateOrganization,
  deleteOrganization,
  getAllLocations,
  getLocationById,
  addDepartment,
  removeDepartment,
  updateDepartment,
  getAllDepartments,
}

