import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/Store';
import {ParticipantsContext} from "./ParticipantsContext";
import {Principal} from "@dfinity/principal";

export interface ParticipantsContextState {
    participants_context: IParticipantsContext;
    status: 'idle' | 'loading' | 'failed';
}
export interface IParticipantsContext{
    users: Array<string>;
    admins: Array<string>;
    roles: Array<string>;
    permissions: Array<string>;
};
const initialState: ParticipantsContextState  = {
    participants_context: {
        users: [],
        admins: [],
        roles: [],
        permissions: [],
    },
    status: 'idle',
};

export const participantsContextSlice = createSlice({
    name: 'participants context',
    initialState,
    reducers: {
        set_participants_context_values: (state, action) => {
            state.participants_context = action.payload;
        },
    },
});

export const { set_participants_context_values } = participantsContextSlice.actions;
export const selectParticipantsContextValues = (state: RootState) => state.participants_context_values.participants_context;

export default participantsContextSlice.reducer;
