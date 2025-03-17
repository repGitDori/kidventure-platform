import { useState } from "react";
import { CheckCircle2, Building, Users, Calendar, Coins, FileText, PenTool, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Types for permissions
export interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface FacilityAccess {
  facilityId: number;
  facilityName: string;
  access: "none" | "view" | "edit" | "admin";
}

export interface UserPermissions {
  userId: number;
  permissions: Permission[];
  facilityAccess: FacilityAccess[];
}

// Permission categories
const permissionCategories = [
  {
    id: "user_management",
    name: "User Management",
    icon: <Users className="h-5 w-5 text-indigo-500" />,
    permissions: [
      { id: "view_users", name: "View Users", description: "Can view user profiles" },
      { id: "create_users", name: "Create Users", description: "Can add new users to the system" },
      { id: "edit_users", name: "Edit Users", description: "Can modify user information" },
      { id: "delete_users", name: "Delete Users", description: "Can remove users from the system" },
    ]
  },
  {
    id: "children_management",
    name: "Children Management",
    icon: <Users className="h-5 w-5 text-green-500" />,
    permissions: [
      { id: "view_children", name: "View Children", description: "Can view children profiles" },
      { id: "create_children", name: "Create Children", description: "Can add new children" },
      { id: "edit_children", name: "Edit Children", description: "Can edit children profiles" }, 
      { id: "assign_children", name: "Assign Children", description: "Can reassign children to different parents" },
    ]
  },
  {
    id: "calendar",
    name: "Calendar & Scheduling",
    icon: <Calendar className="h-5 w-5 text-blue-500" />,
    permissions: [
      { id: "view_schedule", name: "View Schedule", description: "Can view schedules and appointments" },
      { id: "manage_schedule", name: "Manage Schedule", description: "Can create and modify schedules" },
      { id: "approve_appointments", name: "Approve Appointments", description: "Can approve or reject appointment requests" },
    ]
  },
  {
    id: "financial",
    name: "Financial Management",
    icon: <Coins className="h-5 w-5 text-yellow-500" />,
    permissions: [
      { id: "view_billing", name: "View Billing", description: "Can view billing information" },
      { id: "process_payments", name: "Process Payments", description: "Can process payments" },
      { id: "manage_pricing", name: "Manage Pricing", description: "Can set or modify pricing" },
      { id: "financial_reports", name: "Financial Reports", description: "Can access financial reports" },
    ]
  },
  {
    id: "resources",
    name: "Resources & Content",
    icon: <FileText className="h-5 w-5 text-purple-500" />,
    permissions: [
      { id: "view_resources", name: "View Resources", description: "Can view educational resources" },
      { id: "create_resources", name: "Create Resources", description: "Can create new resources" },
      { id: "edit_resources", name: "Edit Resources", description: "Can modify existing resources" },
    ]
  },
  {
    id: "facilities",
    name: "Facility Management",
    icon: <Building className="h-5 w-5 text-orange-500" />,
    permissions: [
      { id: "view_facilities", name: "View Facilities", description: "Can view facility information" },
      { id: "manage_facilities", name: "Manage Facilities", description: "Can create or edit facilities" },
      { id: "assign_staff", name: "Assign Staff", description: "Can assign staff to facilities" },
    ]
  },
  {
    id: "system",
    name: "System Settings",
    icon: <Settings className="h-5 w-5 text-gray-500" />,
    permissions: [
      { id: "system_settings", name: "System Settings", description: "Can modify system settings" },
      { id: "audit_logs", name: "Audit Logs", description: "Can view system audit logs" },
    ]
  },
];

// Sample facilities
const facilities = [
  { id: 1, name: "Downtown KidVenture Center" },
  { id: 2, name: "Westside KidVenture Center" },
  { id: 3, name: "Northgate KidVenture Center" },
  { id: 4, name: "Southpoint KidVenture Center" },
];

interface PermissionsManagerProps {
  userPermissions: UserPermissions;
  onPermissionsChange: (permissions: UserPermissions) => void;
}

export function PermissionsManager({ userPermissions, onPermissionsChange }: PermissionsManagerProps) {
  // State to track permission changes
  const [permissions, setPermissions] = useState<Permission[]>(
    userPermissions.permissions.length > 0 
      ? userPermissions.permissions 
      : permissionCategories.flatMap(cat => 
          cat.permissions.map(p => ({ ...p, enabled: false }))
        )
  );
  
  const [facilityAccess, setFacilityAccess] = useState<FacilityAccess[]>(
    userPermissions.facilityAccess.length > 0
      ? userPermissions.facilityAccess
      : facilities.map(f => ({ 
          facilityId: f.id, 
          facilityName: f.name, 
          access: "none" as const
        }))
  );

  // Toggle individual permission
  const togglePermission = (permissionId: string) => {
    const newPermissions = permissions.map(p => 
      p.id === permissionId ? { ...p, enabled: !p.enabled } : p
    );
    setPermissions(newPermissions);
    onPermissionsChange({
      ...userPermissions,
      permissions: newPermissions
    });
  };

  // Toggle all permissions in a category
  const toggleCategoryPermissions = (categoryId: string, enabled: boolean) => {
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category) return;

    const categoryPermissionIds = category.permissions.map(p => p.id);
    const newPermissions = permissions.map(p => 
      categoryPermissionIds.includes(p.id) ? { ...p, enabled } : p
    );
    
    setPermissions(newPermissions);
    onPermissionsChange({
      ...userPermissions,
      permissions: newPermissions
    });
  };

  // Check if all permissions in a category are enabled
  const isCategoryFullyEnabled = (categoryId: string) => {
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category) return false;

    const categoryPermissionIds = category.permissions.map(p => p.id);
    return categoryPermissionIds.every(id => 
      permissions.find(p => p.id === id)?.enabled
    );
  };

  // Check if any permissions in a category are enabled
  const isCategoryPartiallyEnabled = (categoryId: string) => {
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category) return false;

    const categoryPermissionIds = category.permissions.map(p => p.id);
    return categoryPermissionIds.some(id => 
      permissions.find(p => p.id === id)?.enabled
    ) && !isCategoryFullyEnabled(categoryId);
  };

  // Update facility access level
  const updateFacilityAccess = (facilityId: number, access: "none" | "view" | "edit" | "admin") => {
    const newFacilityAccess = facilityAccess.map(f => 
      f.facilityId === facilityId ? { ...f, access } : f
    );
    setFacilityAccess(newFacilityAccess);
    onPermissionsChange({
      ...userPermissions,
      facilityAccess: newFacilityAccess
    });
  };

  return (
    <div className="space-y-8">
      {/* Permission Categories */}
      <div className="space-y-6">
        {permissionCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {category.icon}
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {isCategoryPartiallyEnabled(category.id) && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      Partial
                    </Badge>
                  )}
                  <Switch 
                    checked={isCategoryFullyEnabled(category.id)}
                    onCheckedChange={(checked) => toggleCategoryPermissions(category.id, checked)}
                  />
                </div>
              </div>
              <CardDescription>
                Manage access to {category.name.toLowerCase()} features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.permissions.map((permission) => {
                  const currentPermission = permissions.find(p => p.id === permission.id);
                  const isEnabled = currentPermission ? currentPermission.enabled : false;
                  
                  return (
                    <div key={permission.id} className="flex items-center justify-between space-x-2">
                      <div>
                        <Label 
                          htmlFor={`permission-${permission.id}`}
                          className="font-medium"
                        >
                          {permission.name}
                        </Label>
                        <p className="text-sm text-gray-500">{permission.description}</p>
                      </div>
                      <Switch 
                        id={`permission-${permission.id}`}
                        checked={isEnabled}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Facility Access */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Facility Access</CardTitle>
          </div>
          <CardDescription>
            Manage which facilities this user can access and their permission level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facilityAccess.map((facility) => (
              <div key={facility.facilityId} className="flex items-center justify-between">
                <Label htmlFor={`facility-${facility.facilityId}`} className="font-medium">
                  {facility.facilityName}
                </Label>
                <Select
                  value={facility.access}
                  onValueChange={(value: "none" | "view" | "edit" | "admin") => 
                    updateFacilityAccess(facility.facilityId, value)
                  }
                >
                  <SelectTrigger id={`facility-${facility.facilityId}`} className="w-32">
                    <SelectValue placeholder="Select access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Access</SelectItem>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}