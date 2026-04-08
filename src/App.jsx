import { useState, useEffect } from 'react'
import './App.css'
import VortexCommandCenter from './component/VortexCommandCenter'

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Incrementing the key forces React to "restart" the component
      setRefreshKey(prevKey => prevKey + 1);
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {/* React treats a component with a new key as a completely new instance */}
      <VortexCommandCenter key={refreshKey} />
    </>
  )
}

export default App