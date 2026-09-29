import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from '../components/Landingpage'
import Signup from '../components/SignupOps'
import Profileinfo from '../components/Profileinfo'
import Settings from '../components/Settings'
import Hackathons from '../components/Hackathons'
import Loginpage from '../components/Loginpage'
import Projects from '../components/Projects'
import SignupForm from '../components/SignupForm'
import Addproject from '../components/Addproject'
import Viewproject from '../components/Viewproject'
import HackathonHostingpage from '../components/HackathonHostingpage'
import ViewHackathon from '../components/ViewHackathon'
import Markingpage from '../components/Markingpage'
import { HackathonsProvider } from '../hooks/HackathonContext'
import { ProjectsProvider } from '../hooks/ProjectContext'
import JudgesPage from '../components/JudgesPage'
import HackathonTeams from '../components/HackathonTeams'
import RegisterTeam from '../components/RegisterTeam'
import PblRoutes from '../pbl/routes/routing'
const Routing = () => {
  return (
    <div >
      <Routes>
        <Route
          path='/'
          element={
            <HackathonsProvider>
              <LandingPage />
            </HackathonsProvider>
          }
        />
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/profileinfo' element={<Profileinfo />}></Route>
        <Route path='/settings' element={<Settings />}></Route>
        <Route path='/signupform' element={<SignupForm />}></Route>
        <Route path='/login' element={<Loginpage />}></Route>
        <Route path='/projects' element={<ProjectsProvider><Projects /></ProjectsProvider>}></Route>
        <Route path='/addproject' element={<Addproject />}></Route>
        <Route path='/viewproject' element={<Viewproject />}></Route>
        <Route path='/hostingpage' element={<HackathonHostingpage />}></Route>
        <Route path='/viewhackathon' element={<ViewHackathon />}></Route>
        <Route path='/markingpage' element={<Markingpage />}></Route>
        <Route
          path='/hackathons'
          element={
            <HackathonsProvider>
              <Hackathons />
            </HackathonsProvider>
          }
        />
        <Route path='/judges' element={<JudgesPage/>}></Route>
        <Route path='/hackathon-teams' element={<HackathonTeams/>}></Route>
        <Route path='/register-team' element={<RegisterTeam/>}></Route>
        <Route path='/pbl/*' element={<PblRoutes />}></Route>
      </Routes>
    </div>
  )
}

export default Routing