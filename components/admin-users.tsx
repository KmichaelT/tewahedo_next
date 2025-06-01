"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Shield, BadgeCheckIcon } from "lucide-react";

export function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, isAdmin }: { id: string; isAdmin: boolean }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin }),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
      {users?.map((user: any) => (
        <Card key={user.id}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
          <div className="flex w-full items-center space-x-4">
            <Avatar>
            <AvatarImage
              src={user.photoURL || "/placeholder.svg"}
              alt={user.displayName}
            />
            <AvatarFallback>
              {user.displayName?.charAt(0) || user.email?.charAt(0)}
            </AvatarFallback>
            </Avatar>

            <div className="w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{user.displayName}</h3>
              {user.isAdmin && (
                <BadgeCheckIcon size={13} color="#e26826" />
              )}
              </div>

              <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Admin</span>
              <Switch
                checked={user.isAdmin}
                onCheckedChange={(checked) =>
                updateUserMutation.mutate({
                  id: user.id,
                  isAdmin: checked,
                })
                }
                disabled={updateUserMutation.isPending}
              />
              </div>
            </div>

            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
            </div>
          </div>
          </div>
        </CardContent>
        </Card>
      ))}
      </div>
    </div>
  );
}
