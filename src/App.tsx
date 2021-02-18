import { QueryClient, QueryClientProvider } from "react-query"
import APR from "./APR"

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <APR />
    </QueryClientProvider>
  )
}

export default App
