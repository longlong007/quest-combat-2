import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SlotList } from './components/SlotList'
import { SlowMode } from './components/SlowMode'
import { Reflections } from './components/Reflections'
import { ReflectionForm } from './components/ReflectionForm'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SlotList />} />
        <Route path="/slow/:slotId" element={<SlowMode />} />
        <Route path="/slow" element={<SlowMode />} />
        <Route path="/reflect/:sessionId" element={<ReflectionForm />} />
        <Route path="/reflections" element={<Reflections />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}