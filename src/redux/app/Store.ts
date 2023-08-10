import { configureStore, ThunkAction, Action} from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { persistReducer } from 'redux-persist';

import authentication_data_context_values from '../features/authentication_data/AuthenticationDataSlice';
import participantsContextSlice from '../features/participants/ParticipantsContextSlice';

import AsyncStorage from "@react-native-async-storage/async-storage";

const reducers = combineReducers({
    authentication_data_context_values: authentication_data_context_values,
    participants_context_values: participantsContextSlice,
});

// const persistConfig = {
//     key: 'root',
//     storage: AsyncStorage ,
//     blacklist: [
//         'navigation',
//         'authentication_data_context_values',
//         'participants_context_values'
//     ],
//     whitelist: [],
// };

const persistConfig = {
    key: 'root',
    storage: AsyncStorage ,
    blacklist: [
        'navigation',
        'authentication_data_context_values'
    ],
    whitelist: [],
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
