import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppContextProvider } from './contexts/AppContext.tsx';
import { SearchContextProvider } from './contexts/SearchContext.tsx';

// 需要在APP component外面包裹 QueryClient, 这是一个react-query client provider. 
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0, // if we get an error, by default react query will do a retry. 可能会造成过多的请求。
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <SearchContextProvider>
          <App />
        </SearchContextProvider>
      </AppContextProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
