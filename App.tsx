import { ClickOutsideProvider } from "react-native-click-outside"
import PaintingPage from "./app/pages/PaintingPage/PaintingPage"

const App = ({}) => {

  return <ClickOutsideProvider>
      <PaintingPage/>
    </ClickOutsideProvider>
}

export default App
