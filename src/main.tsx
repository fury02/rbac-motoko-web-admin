import React from 'react';
import ReactDOM from 'react-dom/client';
import './index_new.css';
// import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux'
import {store} from "./redux/app/Store";
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css';
import {persistStore} from "redux-persist";
import {PersistGate} from "redux-persist/integration/react";

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import './index.scss';


// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// );


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

let persistor = persistStore(store);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    </React.StrictMode>
);
