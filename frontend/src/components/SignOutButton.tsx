import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../api-client"
import { useAppContext } from "../contexts/AppContext";

const SignOutButton = () => {
  // this is a react query hook, which lets us do something at the global level. 
  const queryClient = useQueryClient();

  const { showToast } = useAppContext();

  const mutation = useMutation(apiClient.signOut,  {
    onSuccess: async ()=> {
      // 我们只是把token清空了，并没有刷新页面，也并没有重新验证token, 因此依然是Sign out按钮。
      // 因此我们需要重新验证。
      // "validateToken" this name comes from our appContext.tsx, 
      // so, we force the validate token function to run again. 
      await queryClient.invalidateQueries("validateToken");
      showToast({message: "Signed Out!", type: "SUCCESS"})
    },
    onError: (error: Error)=> {
      showToast({message: error.message, type: "ERROR"})
    }
  })
  const handleClick = () => {
    mutation.mutate();
  }

  return (
    <button
      onClick={handleClick}
      className="text-blue-600 px-3 font-bold bg-white hover:bg-gray-100"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;