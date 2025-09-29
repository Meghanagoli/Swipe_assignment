import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
const candidatesSlice = createSlice({
    name: "candidates",
    initialState: {
        byId: {},
        allIds: [],
    },
    reducers: {
        addCandidate: (state, action) => {
            const { name, email, phone, status, score = 0, summary = "", chatHistory = [] } = action.payload; // Include chatHistory
            const id = uuidv4();
            state.byId[id] = { id, name, email, phone, status: status || "not-started", score, summary, chatHistory };
            state.allIds.push(id);
        },
        updateCandidate: (state, action) => {
            const { id, updates } = action.payload;
            if (state.byId[id]) {
                state.byId[id] = { ...state.byId[id], ...updates };
            }
        },
        removeCandidate: (state, action) => {
            const id = action.payload;
            delete state.byId[id];
            state.allIds = state.allIds.filter((cid) => cid !== id);
        },
    },
});

export const { addCandidate, updateCandidate, removeCandidate } = candidatesSlice.actions;
export default candidatesSlice.reducer;
