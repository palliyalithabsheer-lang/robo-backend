export type Role = 'super_admin' | 'content_manager' | 'support_staff';

export type Permission = 
  | 'manage_content' 
  | 'publish_content' 
  | 'manage_students' 
  | 'manage_subscriptions' 
  | 'view_reports' 
  | 'manage_settings';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin:      ['manage_content', 'publish_content', 'manage_students', 'manage_subscriptions', 'view_reports', 'manage_settings'],
  content_manager:  ['manage_content', 'publish_content', 'view_reports'],
  support_staff:    ['view_reports', 'manage_students'], // Adding manage_students for Support to view/suspend based on plan
};
