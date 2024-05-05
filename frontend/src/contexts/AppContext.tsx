import React, { useContext, useState } from "react";
import Toast from "../components/Toast";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import { loadStripe, Stripe } from "@stripe/stripe-js";

const STRIPE_PUB_KEY = import.meta.env.VITE_STRIPE_PUB_KEY || "";

type ToastMessage = {
  message: string,
  type: "SUCCESS" | "ERROR";
}

// global state
type AppContext = {
  showToast: (totastMessage: ToastMessage)=>void;
  isLoggedIn: boolean,
  stripePromise: Promise<Stripe | null>;
}

const AppContext = React.createContext<AppContext | undefined>(undefined);

const stripePromise = loadStripe(STRIPE_PUB_KEY);

export const AppContextProvider = ({
  children, 
}: {
  children: React.ReactNode;
})=>{
  const [toast, setToast] = useState<ToastMessage | undefined>(undefined);
  
  // this runs when an action causes the app to reRender. 
  // 页面重新渲染时才会调用这个函数去验证token. for example:
  // refresh the page, user changes the routes, 
  // 当我们点击logout时，还保持在同一个页面，并且我们也没有刷新页面，所以不会调用这个函数。
  const { isError } = useQuery("validateToken", apiClient.validateToken, {
    retry: false,
  });

  return (
    // 需要包裹<App />
    <AppContext.Provider
      value={{
        showToast: (toastMessage) => {
          setToast(toastMessage);
        },
        isLoggedIn: !isError,
        stripePromise,
    }}>
      {toast && (
      <Toast 
        message={toast.message}
        type={toast.type}
        onClose={()=>setToast(undefined)}
      />)}
      {children}
    </AppContext.Provider>
  )
}

// create a hook that lets our components easily access the provider
export const useAppContext = ()=>{
  const context = useContext(AppContext);
  return context as AppContext;
}