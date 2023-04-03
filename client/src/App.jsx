import { EthProvider } from "./contexts/EthContext";
import { AppProvider } from "./contexts/AppContext";
import { Home } from "./components/Home";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (
    <EthProvider>
      <AppProvider>
        <div id="App">
          <ToastContainer />
          <div className="container">
            <Home />
          </div>
        </div>
      </AppProvider>
    </EthProvider>
  );
}

export default App;
