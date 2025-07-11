import { BrowserRouter  } from 'react-router-dom'
import './App.css'
import FullLayout from './Layout/FullLayout'

function App() {

  return (
  
    <BrowserRouter >

      <FullLayout /> {/* ใช้งานเส้นทางทั้งหมดที่กำหนดใน ConfigRoutes */}
    
    </BrowserRouter >
  )
}

export default App
