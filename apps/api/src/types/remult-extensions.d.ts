/**
 * Extend Remult's UserInfo to include schoolId for multi-tenancy
 */
declare module 'remult' {
  interface UserInfo {
    schoolId?: string;
  }
}

export {};
