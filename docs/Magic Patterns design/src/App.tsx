import React, { useState } from 'react';
import { PhoneFrame } from './components/layout/PhoneFrame';
import { ScreenSwitcher } from './components/layout/ScreenSwitcher';
// Import all screens
import { Screen1_Home } from './components/screens/Screen1_Home';
import { Screen2_Overview } from './components/screens/Screen2_Overview';
import { Screen3_LeagueTable } from './components/screens/Screen3_LeagueTable';
import { Screen4_Fixtures } from './components/screens/Screen4_Fixtures';
import { Screen5_Bracket } from './components/screens/Screen5_Bracket';
import { Screen6_AdminLogin } from './components/screens/Screen6_AdminLogin';
import { Screen7_AdminDash } from './components/screens/Screen7_AdminDash';
import { Screen8_EnterResult } from './components/screens/Screen8_EnterResult';
import { Screen9_Setup } from './components/screens/Screen9_Setup';
import { Screen10_KnockoutGen } from './components/screens/Screen10_KnockoutGen';
import { Screen11_QR } from './components/screens/Screen11_QR';
import { Screen12_Winner } from './components/screens/Screen12_Winner';
const SCREENS = [
{
  id: '1',
  name: '1. Home'
},
{
  id: '2',
  name: '2. Overview'
},
{
  id: '3',
  name: '3. Table'
},
{
  id: '4',
  name: '4. Fixtures'
},
{
  id: '5',
  name: '5. Bracket'
},
{
  id: '6',
  name: '6. Admin Login'
},
{
  id: '7',
  name: '7. Admin Dash'
},
{
  id: '8',
  name: '8. Enter Score'
},
{
  id: '9',
  name: '9. Setup'
},
{
  id: '10',
  name: '10. Gen Knockout'
},
{
  id: '11',
  name: '11. Share QR'
},
{
  id: '12',
  name: '12. Winner'
}];

export function App() {
  const [activeScreen, setActiveScreen] = useState('1');
  const renderScreen = () => {
    switch (activeScreen) {
      case '1':
        return <Screen1_Home />;
      case '2':
        return <Screen2_Overview />;
      case '3':
        return <Screen3_LeagueTable />;
      case '4':
        return <Screen4_Fixtures />;
      case '5':
        return <Screen5_Bracket />;
      case '6':
        return <Screen6_AdminLogin />;
      case '7':
        return <Screen7_AdminDash />;
      case '8':
        return <Screen8_EnterResult />;
      case '9':
        return <Screen9_Setup />;
      case '10':
        return <Screen10_KnockoutGen />;
      case '11':
        return <Screen11_QR />;
      case '12':
        return <Screen12_Winner />;
      default:
        return <Screen1_Home />;
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 font-sans text-ink">
      <ScreenSwitcher
        screens={SCREENS}
        activeScreen={activeScreen}
        onChange={setActiveScreen} />
      

      <div className="pt-14">
        {' '}
        {/* Offset for sticky switcher */}
        <PhoneFrame>{renderScreen()}</PhoneFrame>
      </div>
    </div>);

}