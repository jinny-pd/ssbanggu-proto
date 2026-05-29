import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './screens/Home'
import AddRoom from './screens/AddRoom'
import CreateRoom from './screens/CreateRoom'
import SelectRoomType from './screens/SelectRoomType'
import AdjustRoom from './screens/AdjustRoom'
import DesignBedroom from './screens/DesignBedroom'
import OnboardingDone from './screens/OnboardingDone'
import TemplateRoom from './screens/TemplateRoom'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-room" element={<AddRoom />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/select-room-type" element={<SelectRoomType />} />
        <Route path="/adjust-room" element={<AdjustRoom />} />
        <Route path="/design-bedroom" element={<DesignBedroom />} />
        <Route path="/onboarding-done" element={<OnboardingDone />} />
        <Route path="/template-room" element={<TemplateRoom />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
