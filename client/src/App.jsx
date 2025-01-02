import { BrowserRouter, Route, Routes } from "react-router-dom"
import Header from "./components/Header"
import Home from './pages/Home.jsx'
import About from "./pages/About.jsx"
import Contacts from "./pages/Contacts.jsx"
import GetStarted from "./pages/GetStarted.jsx"

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/aboutus' element={<About />} />
            <Route path='/contact' element={<Contacts />} />
            <Route path='/getstarted' element={<GetStarted />} />         
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
