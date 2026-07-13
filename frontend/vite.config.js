import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function injectTripDetailsImports() {
  const targetPath = '/src/pages/TripDetails.jsx'
  const dashboardLayoutImport =
    'import DashboardLayout from "../components/DashboardLayout.jsx";\n'

  return {
    name: 'inject-trip-details-imports',
    transform(code, id) {
      if (!id.replace(/\\\\/g, '/').endsWith(targetPath)) {
        return null
      }

      if (code.includes('import DashboardLayout')) {
        return null
      }

      return `${dashboardLayoutImport}${code}`
    },
  }
}

export default defineConfig({
  plugins: [react(), injectTripDetailsImports()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
