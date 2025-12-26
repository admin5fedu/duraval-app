import { Routes, Route } from 'react-router-dom'
import { Suspense, useEffect } from 'react'
import { routes } from './routes'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { PageLoading } from './shared/components/loading/PageLoading'
import { initializeEnumSystem } from './shared/utils/initialize-enum-system'

function App() {
  // Initialize enum system once at app startup
  useEffect(() => {
    initializeEnumSystem()
  }, [])

  return (
    <Routes>
      {routes.map((route) => {
        const Element = route.element
        
        const PageComponent = () => (
          <Suspense fallback={<PageLoading />}>
            <Element />
          </Suspense>
        )

        let element = <PageComponent />

        if (route.layout) {
          element = (
            <Layout>
              <PageComponent />
            </Layout>
          )
        }

        if (route.protected) {
          element = <ProtectedRoute>{element}</ProtectedRoute>
        }
        
        return (
          <Route
            key={route.path}
            path={route.path}
            element={element}
          />
        )
      })}
    </Routes>
  )
}

export default App

