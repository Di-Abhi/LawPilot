// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice' // or whatever your slice is

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

export default store
