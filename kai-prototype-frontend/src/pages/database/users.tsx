"use client";

import { PageHeader } from "@/components/sidebar/page-header";
import { DataTable } from "@/components/table/dataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { type UserInterface } from "@/types/datenbank";
import axios from "axios";
import isEqual from "lodash.isequal"; // npm install lodash.isequal
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner"; // Assuming you have sonner for notifications

const columns: string[] = ["First Name", "Last Name", "Email", "Address"];

export function Users() {
  const breadcrumbs = {
    items: [
      { label: "Datenbank", href: "/datenbank/nutzer" },
      { label: "Nutzer" },
    ],
  };

  const [users, setUsers] = useState<UserInterface[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Sheet state
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null);
  const [editedUser, setEditedUser] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const fetchUserDetails = async (userId: number) => {
    try {
      setLoading(true);
      const [userResponse, bankResponse, propertiesResponse] =
        await Promise.all([
          axios.get(`http://localhost:8000/api/users/${userId}/`),
          axios.get(`http://localhost:8000/api/users/${userId}/bank_accounts/`),
          axios.get(`http://localhost:8000/api/users/${userId}/properties/`),
        ]);

      const userWithDetails = {
        ...userResponse.data,
        bank_accounts: bankResponse.data,
        property_owners: propertiesResponse.data,
      };

      setSelectedUser(userWithDetails);
      setEditedUser(JSON.parse(JSON.stringify(userWithDetails)));
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: UserInterface) => {
    fetchUserDetails(user.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editedUser) return;

    try {
      setLoading(true);

      // Update user basic info
      const userUpdateData = {
        first_name: editedUser.first_name,
        last_name: editedUser.last_name,
        email: editedUser.email,
        username: editedUser.username,
        role: editedUser.role,
      };

      await axios.patch(
        `http://localhost:8000/api/users/${editedUser.id}/`,
        userUpdateData
      );

      // Update address if it exists
      if (editedUser.address && editedUser.address.id) {
        await axios.patch(
          `http://localhost:8000/api/addresses/${editedUser.address.id}/`,
          editedUser.address
        );
      }

      // Update bank accounts if any exist
      if (editedUser.bank_accounts) {
        for (const bankAccount of editedUser.bank_accounts) {
          await axios.patch(
            `http://localhost:8000/api/bank-accounts/${bankAccount.id}/`,
            bankAccount
          );
        }
      }

      toast.success("User updated successfully");
      setEditedUser(selectedUser);
      setOpen(false);
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const updateEditedUser = (field: string, value: any, nested?: string) => {
    if (!editedUser) return;

    setEditedUser((prev) => {
      if (!prev) return null;

      if (nested) {
        return {
          ...prev,
          [nested]: {
            ...prev[nested as keyof UserInterface],
            [field]: value,
          },
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        `${user.first_name} ${user.last_name} ${user.email} ${user.address?.city ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" ? true : user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="w-full">
      {/* Header */}
      <PageHeader {...breadcrumbs} />

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 px-5">
        {/* Search (left) */}
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {/* Role Filter (right) */}
        <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {[...new Set(users.map((u) => u.role))].map((role) => (
              <SelectItem key={role} value={role}>
                {role == "owner" ? "Owner" : "Tenant"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable columns={columns}>
        <TableBody>
          {filteredUsers.map((item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer border-b hover:bg-gray-50 [&>td]:py-3.5 [&>td]:align-middle"
              onClick={() => handleUserClick(item)}
            >
              <TableCell className="font-medium">{item.first_name}</TableCell>
              <TableCell className="font-medium">{item.last_name}</TableCell>
              <TableCell className="font-medium">{item.email}</TableCell>
              <TableCell className="font-medium">
                {item.address?.city || "None"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      {/* Enhanced Sheet - Half page width */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="!w-[50vw] !max-w-[50vw] overflow-y-auto p-6"
          style={{ width: "50vw", maxWidth: "50vw" }}
        >
          <SheetHeader>
            <SheetTitle className="text-2xl font-semibold">
              Profil bearbeiten
            </SheetTitle>
            <SheetDescription className="text-base text-muted-foreground">
              Profil bearbeiten. Bei Änderung speichern.
            </SheetDescription>
          </SheetHeader>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : editedUser ? (
            <div className="space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Kontaktinformationen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="grid grid-cols-1 gap-1">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={editedUser.first_name}
                        onChange={(e) =>
                          updateEditedUser("first_name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={editedUser.last_name}
                        onChange={(e) =>
                          updateEditedUser("last_name", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedUser.email}
                      onChange={(e) =>
                        updateEditedUser("email", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={editedUser.username}
                        onChange={(e) =>
                          updateEditedUser("username", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={editedUser.role}
                        onValueChange={(value) =>
                          updateEditedUser("role", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="tenant">Tenant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              {editedUser.address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Adresse</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="street">Street</Label>
                        <Input
                          id="street"
                          value={editedUser.address.street}
                          onChange={(e) =>
                            updateEditedUser(
                              "street",
                              e.target.value,
                              "address"
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="house_number">House Number</Label>
                        <Input
                          id="house_number"
                          value={editedUser.address.house_number}
                          onChange={(e) =>
                            updateEditedUser(
                              "house_number",
                              e.target.value,
                              "address"
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address_line_1">Address Line 1</Label>
                      <Input
                        id="address_line_1"
                        value={editedUser.address.address_line_1 || ""}
                        onChange={(e) =>
                          updateEditedUser(
                            "address_line_1",
                            e.target.value,
                            "address"
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="address_line_2">Address Line 2</Label>
                      <Input
                        id="address_line_2"
                        value={editedUser.address.address_line_2 || ""}
                        onChange={(e) =>
                          updateEditedUser(
                            "address_line_2",
                            e.target.value,
                            "address"
                          )
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input
                          id="postal_code"
                          value={editedUser.address.postal_code}
                          onChange={(e) =>
                            updateEditedUser(
                              "postal_code",
                              e.target.value,
                              "address"
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={editedUser.address.city}
                          onChange={(e) =>
                            updateEditedUser("city", e.target.value, "address")
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={editedUser.address.country}
                        onChange={(e) =>
                          updateEditedUser("country", e.target.value, "address")
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bank Accounts */}
              {editedUser.bank_accounts &&
                editedUser.bank_accounts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Zugewiesene Bankkonten
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {editedUser.bank_accounts.map((bankAccount, index) => (
                        <div
                          key={bankAccount.id}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              Bank Account #{index + 1}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`account_owner_${index}`}>
                                Account Owner
                              </Label>
                              <Input
                                id={`account_owner_${index}`}
                                value={bankAccount.account_owner_text}
                                onChange={(e) => {
                                  const updatedBankAccounts = [
                                    ...editedUser.bank_accounts!,
                                  ];
                                  updatedBankAccounts[index] = {
                                    ...updatedBankAccounts[index],
                                    account_owner_text: e.target.value,
                                  };
                                  setEditedUser({
                                    ...editedUser,
                                    bank_accounts: updatedBankAccounts,
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`bank_${index}`}>Bank</Label>
                              <Input
                                id={`bank_${index}`}
                                value={bankAccount.bank}
                                onChange={(e) => {
                                  const updatedBankAccounts = [
                                    ...editedUser.bank_accounts!,
                                  ];
                                  updatedBankAccounts[index] = {
                                    ...updatedBankAccounts[index],
                                    bank: e.target.value,
                                  };
                                  setEditedUser({
                                    ...editedUser,
                                    bank_accounts: updatedBankAccounts,
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`iban_${index}`}>IBAN</Label>
                              <Input
                                id={`iban_${index}`}
                                value={bankAccount.iban}
                                onChange={(e) => {
                                  const updatedBankAccounts = [
                                    ...editedUser.bank_accounts!,
                                  ];
                                  updatedBankAccounts[index] = {
                                    ...updatedBankAccounts[index],
                                    iban: e.target.value,
                                  };
                                  setEditedUser({
                                    ...editedUser,
                                    bank_accounts: updatedBankAccounts,
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`bic_${index}`}>BIC</Label>
                              <Input
                                id={`bic_${index}`}
                                value={bankAccount.bic}
                                onChange={(e) => {
                                  const updatedBankAccounts = [
                                    ...editedUser.bank_accounts!,
                                  ];
                                  updatedBankAccounts[index] = {
                                    ...updatedBankAccounts[index],
                                    bic: e.target.value,
                                  };
                                  setEditedUser({
                                    ...editedUser,
                                    bank_accounts: updatedBankAccounts,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

              {/* Owned Properties */}
              {editedUser.property_owners &&
                editedUser.property_owners.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Objekte</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {editedUser.property_owners.map((property, index) => (
                        <div
                          key={property.id}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              Property #{index + 1}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Street</Label>
                              <Input
                                value={property.address.street}
                                disabled
                                className="bg-gray-50"
                              />
                            </div>
                            <div>
                              <Label>House Number</Label>
                              <Input
                                value={property.address.house_number}
                                disabled
                                className="bg-gray-50"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>City</Label>
                              <Input
                                value={property.address.city}
                                disabled
                                className="bg-gray-50"
                              />
                            </div>
                            <div>
                              <Label>Postal Code</Label>
                              <Input
                                value={property.address.postal_code}
                                disabled
                                className="bg-gray-50"
                              />
                            </div>
                          </div>
                          {property.weg_bank && (
                            <div className="mt-4">
                              <Label className="text-sm font-medium text-gray-600">
                                WEG Bank
                              </Label>
                              <div className="text-sm text-gray-800 mt-1">
                                {property.weg_bank.bank} -{" "}
                                {property.weg_bank.iban}
                              </div>
                            </div>
                          )}
                          {property.ruecklagen_bank && (
                            <div className="mt-2">
                              <Label className="text-sm font-medium text-gray-600">
                                Rücklagen Bank
                              </Label>
                              <div className="text-sm text-gray-800 mt-1">
                                {property.ruecklagen_bank.bank} -{" "}
                                {property.ruecklagen_bank.iban}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">No user selected</div>
            </div>
          )}

          <SheetFooter className="mt-6">
            <Button
              type="submit"
              onClick={handleSave}
              disabled={loading || isEqual(selectedUser, editedUser)}
            >
              {loading ? "Saving..." : "Save changes"}
            </Button>

            <SheetClose asChild>
              <Button variant="outline" disabled={loading}>
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
