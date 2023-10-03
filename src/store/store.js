import { create } from 'zustand'
import { createMainStore } from './main'
import { createMoviesStore } from './movies'
import { createBooksStore } from './books'
import { createRecordsStore } from './records'
import { createAccountStore } from './account'
import { createAllStore } from './all'


export const useStore = create((...a) => ({
    ...createMainStore(...a),
    ...createMoviesStore(...a),
    ...createBooksStore(...a),
    ...createRecordsStore(...a),
    ...createAccountStore(...a),
    ...createAllStore(...a),
}))