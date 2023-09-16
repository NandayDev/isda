import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  AuthTokenResponse,
  SignInWithPasswordCredentials,
} from "@supabase/supabase-js";

const SUPABASE_SESSION_KEY = "supabase/session";
const SUPABASE_SIGNIN_KEY = "supabase/signin";
const SUPABASE_SIGNOUT_KEY = "supabase/signout";

const useGetSession = () => {
  const supabase = useSupabaseClient();

  return useQuery({
    queryKey: [SUPABASE_SESSION_KEY],
    queryFn: () => supabase.auth.getSession(),
  });
};

const usePostSignInWithPassword = (
  options?: Omit<
    UseMutationOptions<
      AuthTokenResponse,
      unknown,
      SignInWithPasswordCredentials
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();

  return useMutation<AuthTokenResponse, unknown, SignInWithPasswordCredentials>(
    {
      mutationKey: [SUPABASE_SIGNIN_KEY],
      mutationFn: (payload) => supabase.auth.signInWithPassword(payload),
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: [SUPABASE_SESSION_KEY] });
        options?.onSuccess?.(data, variables, context);
      },
    }
  );
};

const usePostSignout = (options?: Omit<UseMutationOptions, "mutationFn">) => {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();

  return useMutation({
    mutationKey: [SUPABASE_SIGNOUT_KEY],
    mutationFn: () => supabase.auth.signOut(),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [SUPABASE_SESSION_KEY] });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export default {
  getSession: useGetSession,
  postSignInWithPassword: usePostSignInWithPassword,
  postSignout: usePostSignout,
};
