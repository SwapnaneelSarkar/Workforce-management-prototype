// Re-export types and functions from admin-local-db for backward compatibility
// This file acts as a compatibility layer to avoid breaking existing imports
import type {
  AdminLocalDbOrganizationLocation,
  AdminLocalDbOrganizationEntry,
  Department,
  Specialty,
  OccupationSpecialty,
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
  getAllSpecialties,
  getSpecialtyById,
  getAllOccupationSpecialties,
  getOccupationSpecialtiesByOccupation,
  getOccupationSpecialtyById,
} from "./admin-local-db"

export type OrganizationLocation = AdminLocalDbOrganizationLocation
export type Organization = AdminLocalDbOrganizationEntry
export type { Department, Specialty, OccupationSpecialty }

export {
  getAllOrganizations as readOrganizations,
  getOrganizationById,
  getAllSpecialties,
  getSpecialtyById,
  getAllOccupationSpecialties,
  getOccupationSpecialtiesByOccupation,
  getOccupationSpecialtyById,
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

