import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  profile?: any;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("[LOGOUT] Initiating logout request...");
      const response = await apiRequest("POST", "/api/auth/logout", {});
      const result = await response.json();
      console.log("[LOGOUT] Server response:", result);
      return result;
    },
    onSuccess: () => {
      console.log("[LOGOUT] Clearing user data from cache...");
      // Clear the user data immediately (not just invalidate)
      queryClient.setQueryData(["/api/auth/user"], null);
      // Also invalidate to prevent stale data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Clear any other auth-related queries
      queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
      console.log("[LOGOUT] Cache cleared successfully");
    },
    onError: (error) => {
      console.error("[LOGOUT] Logout failed:", error);
    },
  });

  return {
    user: user as AuthUser | undefined,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
