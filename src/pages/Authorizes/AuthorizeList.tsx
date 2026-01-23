import { useEffect, useState } from "react";
import { Search, Trash2, Plus, LockOpen } from "lucide-react";
import type { RoleType } from "@/types/role.type";
import type { ActionType } from "@/types/action.type";
import type { AuthorizeType } from "@/types/authorize.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { actionService } from "../../services/action.service";
import { roleService } from "../../services/role.service";
import { authorizeService } from "../../services/authorize.service";
import { toast } from "sonner";

export default function AuthorizeList() {
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [actions, setActions] = useState<ActionType[]>([]);
  const [privileges, setPrivileges] = useState<AuthorizeType[]>([]);

  const [searchFeatures, setSearchFeatures] = useState("");
  const [searchFeaturesApplied, setSearchFeaturesApplied] = useState("");
  const [searchPrivileges, setSearchPrivileges] = useState("");
  const [searchPrivilegesApplied, setSearchPrivilegesApplied] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [selectedActions, setSelectedActions] = useState<Set<string>>(
    new Set(),
  );
  const [selectedPrivilegesCheckbox, setSelectedPrivilegesCheckbox] = useState<
    Set<string>
  >(new Set());

  const getRoleName = (roleId: string) => {
    return roles.find((r) => r.id === roleId)?.name || roleId;
  };

  const getActionName = (actionId: string) => {
    return actions.find((a) => a.id === actionId)?.name || actionId;
  };

  const fetchActions = async () => {
    try {
      const response = await actionService.findAll();
      if (response.success) {
        setActions(response.data as ActionType[]);
      }
    } catch (error) {
      console.error("Error fetching actions:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAll();
      if (Array.isArray(response.data)) {
        response.data = response.data.filter((item) => item.name != "CUSTOMER");
      }
      if (response.success) {
        setRoles(response.data as RoleType[]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchPrivileges = async (roleId: string | null) => {
    try {
      const response = await authorizeService.findByRoleId(roleId || "");
      if (response.success) {
        setPrivileges(response.data as AuthorizeType[]);
      }
    } catch (error) {
      console.error("Error fetching privileges:", error);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchRoles();
      await fetchActions();
    })();
  }, []);

  useEffect(() => {
    if (!selectedRole) return;
    (async () => {
      await fetchPrivileges(selectedRole.id as string);
    })();
    setSelectedActions(new Set());
    setSelectedPrivilegesCheckbox(new Set());
  }, [selectedRole]);

  const addAuthorize = async (actionId: string) => {
    if (!selectedRole) {
      toast.error("Please select a role first");
      return;
    }
    const newData: AuthorizeType = {
      role_id: selectedRole.id as string,
      action_id: actionId,
    };
    try {
      const response = await authorizeService.create(newData);
      if (response.success) {
        setPrivileges([...privileges, response.data as AuthorizeType]);
        toast.success("Authorize added successfully");
        if (selectedRole) {
          fetchPrivileges(selectedRole.id as string);
        }
      } else {
        toast.error("Failed to add authorize");
      }
    } catch (error) {
      console.error("Error adding authorize:", error);
      toast.error("Error adding authorize");
    }
  };

  const removeAuthorize = async (authorizeId: string) => {
    try {
      const response = await authorizeService.remove(authorizeId);
      if (response.success) {
        setPrivileges(
          privileges.filter((privilege) => privilege.id !== authorizeId),
        );
        toast.success("Authorize removed successfully");
        if (selectedRole) {
          fetchPrivileges(selectedRole.id as string);
        }
      } else {
        toast.error("Failed to remove authorize");
      }
    } catch (error) {
      console.error("Error removing authorize:", error);
      toast.error("Error removing authorize");
    }
  };

  const getAuthorizedActionIds = () => {
    return privileges.map((p) => p.action_id);
  };

  const toggleActionCheckbox = (actionId: string) => {
    const newSet = new Set(selectedActions);
    if (newSet.has(actionId)) {
      newSet.delete(actionId);
    } else {
      newSet.add(actionId);
    }
    setSelectedActions(newSet);
  };

  const bulkAddAuthorize = async (actionIds: string[]) => {
    if (!selectedRole) {
      toast.error("Please select a role first");
      return;
    }
    const authorizesData = actionIds.map((actionId) => ({
      role_id: selectedRole.id as string,
      action_id: actionId,
    }));
    try {
      const response = await authorizeService.bulkCreate(authorizesData);
      if (response.success) {
        setSelectedActions(new Set());
        toast.success(`${actionIds.length} authorize(s) added successfully`);
        if (selectedRole) {
          fetchPrivileges(selectedRole.id as string);
        }
      } else {
        toast.error("Failed to add authorizes");
      }
    } catch (error) {
      console.error("Error adding authorizes:", error);
      toast.error("Error adding authorizes");
    }
  };

  const togglePrivilegeCheckbox = (privilegeId: string) => {
    const newSet = new Set(selectedPrivilegesCheckbox);
    if (newSet.has(privilegeId)) {
      newSet.delete(privilegeId);
    } else {
      newSet.add(privilegeId);
    }
    setSelectedPrivilegesCheckbox(newSet);
  };

  const bulkRemoveAuthorize = async (privilegeIds: string[]) => {
    try {
      const response = await authorizeService.bulkRemove(privilegeIds);
      if (response.success) {
        setSelectedPrivilegesCheckbox(new Set());
        toast.success(
          `${privilegeIds.length} authorize(s) removed successfully`,
        );
        if (selectedRole) {
          fetchPrivileges(selectedRole.id as string);
        }
      } else {
        toast.error("Failed to remove authorizes");
      }
    } catch (error) {
      console.error("Error removing authorizes:", error);
      toast.error("Error removing authorizes");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Quản Lý Phân Quyền
        </h1>
        <p className="text-muted-foreground">
          Quản lý vai trò, hành động và phân quyền truy cập
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Danh Sách Chức Vụ */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <LockOpen className="h-5 w-5" />
              Danh Sách Chức Vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Tên Chức Vụ</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role, index) => (
                    <TableRow
                      key={role.id}
                      className={`cursor-pointer transition-colors ${
                        selectedRole?.id === role.id
                          ? "bg-primary/10"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedRole(role)}
                    >
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            selectedRole?.id === role.id ? "default" : "outline"
                          }
                        >
                          {role.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRole(role);
                          }}
                        >
                          <LockOpen className="h-3 w-3 mr-1" />
                          Phân Quyền
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Middle Column: Danh Sách Chức Năng */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5" />
              Danh Sách Chức Năng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchFeatures}
                  onChange={(e) => setSearchFeatures(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchFeaturesApplied(searchFeatures);
                    }
                  }}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={() => setSearchFeaturesApplied(searchFeatures)}>Tìm kiếm</Button>
            </div>
            {selectedActions.size > 0 && (
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => bulkAddAuthorize(Array.from(selectedActions))}
              >
                <Plus className="h-4 w-4 mr-2" />
                Cấp quyền cho {selectedActions.size} chức năng
              </Button>
            )}
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedActions.size ===
                            actions.filter(
                              (a) =>
                                a.name
                                  .toLowerCase()
                                  .includes(searchFeaturesApplied.toLowerCase()) &&
                                !getAuthorizedActionIds().includes(
                                  a.id as string,
                                ),
                            ).length && selectedActions.size > 0
                        }
                        onChange={() => {
                          const filtered = actions.filter(
                            (a) =>
                              a.name
                                .toLowerCase()
                                .includes(searchFeaturesApplied.toLowerCase()) &&
                              !getAuthorizedActionIds().includes(
                                a.id as string,
                              ),
                          );
                          if (selectedActions.size === filtered.length) {
                            setSelectedActions(new Set());
                          } else {
                            setSelectedActions(
                              new Set(filtered.map((a) => a.id as string)),
                            );
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Tên Chức Năng</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actions
                    .filter(
                      (a) =>
                        a.name
                          .toLowerCase()
                          .includes(searchFeaturesApplied.toLowerCase()) &&
                        !getAuthorizedActionIds().includes(a.id as string),
                    )
                    .map((action, index) => (
                      <TableRow key={action.id} className="hover:bg-muted/50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedActions.has(action.id as string)}
                            onChange={() =>
                              toggleActionCheckbox(action.id as string)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-sm">{action.name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              addAuthorize(action.id as string);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Cấp quyền
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Đặc Quyền */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              Đặc Quyền Cho
              <Badge className="ml-2" variant="destructive">
                {selectedRole?.name || "Chức Vụ"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchPrivileges}
                  onChange={(e) => setSearchPrivileges(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchPrivilegesApplied(searchPrivileges);
                    }
                  }}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={() => setSearchPrivilegesApplied(searchPrivileges)}>Tìm kiếm</Button>
            </div>
            {selectedPrivilegesCheckbox.size > 0 && (
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() =>
                  bulkRemoveAuthorize(Array.from(selectedPrivilegesCheckbox))
                }
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa {selectedPrivilegesCheckbox.size} quyền
              </Button>
            )}
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedPrivilegesCheckbox.size ===
                            privileges.filter(
                              (p) =>
                                (selectedRole?.id === p.role_id &&
                                  (!searchPrivilegesApplied ||
                                    getActionName(p.action_id)
                                      .toLowerCase()
                                      .includes(searchPrivilegesApplied.toLowerCase()))),
                            ).length && selectedPrivilegesCheckbox.size > 0
                        }
                        onChange={() => {
                          const filtered = privileges.filter(
                            (p) =>
                              (selectedRole?.id === p.role_id &&
                                (!searchPrivilegesApplied ||
                                  getActionName(p.action_id)
                                    .toLowerCase()
                                    .includes(searchPrivilegesApplied.toLowerCase()))),
                          );

                          if (
                            selectedPrivilegesCheckbox.size === filtered.length
                          ) {
                            setSelectedPrivilegesCheckbox(new Set());
                          } else {
                            setSelectedPrivilegesCheckbox(
                              new Set(filtered.map((p) => p.id as string)),
                            );
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Chức Vụ</TableHead>
                    <TableHead>Chức Năng</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {privileges
                    .filter(
                      (p) =>
                        (selectedRole?.id === p.role_id &&
                          (!searchPrivilegesApplied ||
                            getActionName(p.action_id)
                              .toLowerCase()
                              .includes(searchPrivilegesApplied.toLowerCase()))),
                    )
                    .map((privilege, index) => (
                      <TableRow
                        key={privilege.id}
                        className="hover:bg-destructive/5"
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedPrivilegesCheckbox.has(
                              privilege.id as string,
                            )}
                            onChange={() =>
                              togglePrivilegeCheckbox(privilege.id as string)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline">
                            {getRoleName(privilege.role_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {getActionName(privilege.action_id)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              removeAuthorize(privilege.id as string)
                            }
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
