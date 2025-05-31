"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Shield, ShieldOff } from "lucide-react"

export function AdminUsers() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      return response.json()
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, isAdmin }: { id: string; isAdmin: boolean }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin }),
      })
      if (!response.ok) throw new Error("Failed to update user")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast({ title: "User updated successfully" })
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" })
    },
  })

  if (isLoading) {
    return <div>Loading users...</div>
  }

  return (
    <div className="space-y-6"> 

      <div className="grid gap-4">
        {users?.map((user: any) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={user.displayName} />
                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="font-semibold">{user.displayName}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant={user.isAdmin ? "default" : "secondary"}>{user.isAdmin ? "Admin" : "User"}</Badge>

                  <Button
                    size="sm"
                    variant={user.isAdmin ? "destructive" : "default"}
                    onClick={() =>
                      updateUserMutation.mutate({
                        id: user.id,
                        isAdmin: !user.isAdmin,
                      })
                    }
                    disabled={updateUserMutation.isPending}
                  >
                    {user.isAdmin ? (
                      <>
                        <ShieldOff className="h-4 w-4 mr-1" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-1" />
                        Make Admin
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
