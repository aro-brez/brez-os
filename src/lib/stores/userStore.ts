"use client";

import { ORG_CHART } from "@/lib/data/source-of-truth";
import { ROLE_CONTEXTS, type Department } from "@/lib/ai/supermind";

// Types
export interface BrezUser {
  id: string;
  name: string;
  email?: string;
  title: string;
  department: Department;
  isLead: boolean;
}

// Helper to check if an object has name/title properties
function isPersonEntry(obj: unknown): obj is { name: string; title: string } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "name" in obj &&
    "title" in obj &&
    typeof (obj as { name: unknown }).name === "string" &&
    typeof (obj as { title: unknown }).title === "string"
  );
}

// Helper to check if an object is an array of person entries
function isPersonArray(obj: unknown): obj is { name: string; title: string }[] {
  return Array.isArray(obj) && obj.every(isPersonEntry);
}

// Flatten org chart into searchable list
function flattenOrgChart(): BrezUser[] {
  const users: BrezUser[] = [];

  // Map department keys to our Department type
  const deptMapping: Record<string, Department> = {
    executive: "exec",
    finance: "finance",
    marketing: "growth",
    digital: "growth",
    customerSuccess: "cx",
    experience: "cx",
    retention: "growth",
    sales: "retail",
    operations: "ops",
    people: "ops",
    product: "product",
  };

  Object.entries(ORG_CHART).forEach(([deptKey, dept]) => {
    const mappedDept = deptMapping[deptKey] || "ops";
    const deptObj = dept as Record<string, unknown>;

    // Handle executive department (has individual roles, not head/team structure)
    if (deptKey === "executive") {
      Object.entries(deptObj).forEach(([roleKey, person]) => {
        if (isPersonEntry(person)) {
          users.push({
            id: `${deptKey}-${roleKey}`,
            name: person.name,
            title: person.title,
            department: mappedDept,
            isLead: true,
          });
        }
      });
      return;
    }

    // Add head if exists
    if (isPersonEntry(deptObj.head)) {
      users.push({
        id: `${deptKey}-head`,
        name: deptObj.head.name,
        title: deptObj.head.title,
        department: mappedDept,
        isLead: true,
      });
    }

    // Add team members
    if (isPersonArray(deptObj.team)) {
      deptObj.team.forEach((member, i) => {
        users.push({
          id: `${deptKey}-${i}`,
          name: member.name,
          title: member.title,
          department: mappedDept,
          isLead: false,
        });
      });
    }

    // Add directors (sales)
    if (isPersonArray(deptObj.directors)) {
      deptObj.directors.forEach((member, i) => {
        users.push({
          id: `${deptKey}-dir-${i}`,
          name: member.name,
          title: member.title,
          department: mappedDept,
          isLead: true,
        });
      });
    }

    // Add key accounts (sales)
    if (isPersonArray(deptObj.keyAccounts)) {
      deptObj.keyAccounts.forEach((member, i) => {
        users.push({
          id: `${deptKey}-ka-${i}`,
          name: member.name,
          title: member.title,
          department: mappedDept,
          isLead: false,
        });
      });
    }

    // Add market managers (sales)
    if (isPersonArray(deptObj.marketManagers)) {
      deptObj.marketManagers.forEach((member, i) => {
        users.push({
          id: `${deptKey}-mm-${i}`,
          name: member.name,
          title: member.title,
          department: mappedDept,
          isLead: false,
        });
      });
    }

    // Add ambassadors (experience)
    if (isPersonArray(deptObj.ambassadors)) {
      deptObj.ambassadors.forEach((member, i) => {
        users.push({
          id: `${deptKey}-amb-${i}`,
          name: member.name,
          title: member.title,
          department: mappedDept,
          isLead: false,
        });
      });
    }
  });

  return users;
}

// Get all BREZ team members
export function getAllTeamMembers(): BrezUser[] {
  return flattenOrgChart();
}

// Find user by email
export function findUserByEmail(email: string): BrezUser | null {
  const users = getAllTeamMembers();
  const emailName = email.split("@")[0].toLowerCase().replace(/[._]/g, " ");

  // Try exact match first
  const exactMatch = users.find(u =>
    u.name.toLowerCase().replace(/\s+/g, "").includes(emailName.replace(/\s+/g, ""))
  );
  if (exactMatch) return exactMatch;

  // Try partial match
  const partialMatch = users.find(u => {
    const [firstName, lastName] = u.name.toLowerCase().split(" ");
    return emailName.includes(firstName) || emailName.includes(lastName || "");
  });

  return partialMatch || null;
}

// Get role context for user's department
export function getUserRoleContext(department: Department) {
  return ROLE_CONTEXTS[department];
}

// Local storage for selected user
const USER_STORAGE_KEY = "brez-selected-user";

export function getSelectedUser(): BrezUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function setSelectedUser(user: BrezUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearSelectedUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
}
