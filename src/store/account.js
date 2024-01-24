const initialState = {
    collections: [],
    newCollection: {
        name: '',
        description: '',
        isPublic: false,
    },
    collectionRecords: [],
    loggedIn: false,
    baseUrl: 'https://libtools2.smith.edu:4000',
    collectionRecordId: '',
    collectionRecordName: '',
    user: [],
    favorites: [],
    collectionCoverImage: '',
}


export const createAccountStore = (set, get) => ({
    ...initialState,
    setCollections: (collections) => set(() => ({ collections })),
    setNewCollection: (newCollection) => set(() => ({ newCollection })),
    setCollectionRecords: (collectionRecords) => set(() => ({ collectionRecords })),
    resetNewCollection: () => set(() => ({ newCollection: initialState.newCollection })),
    resetCollectionRecords: () => set(() => ({ collectionRecords: initialState.collectionRecords })),
    addCollection: (collection) => set((state) => ({ collections: [collection, ...state.collections] })),
    removeCollection: (collectionId) => {
        set((state) => ({
            collections: state.collections.filter(collection => collection.id !== collectionId),
        }))
    },
    updateCollection: (collectionId, updatedCollection) => {
        set((state) => ({
          collections: state.collections.map((collection) => {
            if (collection.collection_id === collectionId) {
              return { ...collection, ...updatedCollection };
            }
            console.log(collection)
            return collection;
          }),
        }));
      },
    updateNewCollection: (updatedCollection) => {
        set((state) => ({
            newCollection: {
                ...state.newCollection,
                ...updatedCollection,
            },
        }))
    },
    updateCollectionRecords: (collectionRecords) => {
        set((state) => ({
            collectionRecords: collectionRecords
        }))
    },
    removeCollectionRecord: (recordId) => {
        set((state) => ({
            collectionRecords: state.collectionRecords.filter(record => record.id !== recordId),
        }))
    },
    addCollectionRecord: (record) => {
        set((state) => ({
            collectionRecords: [...state.collectionRecords, record]
        }))
    },
    setLoggedIn: (loggedIn) => set(() => ({ loggedIn })),
    setCollectionRecordId: (collectionRecordId) => set(() => ({ collectionRecordId })),
    setCollectionRecordName: (collectionRecordName) => set(() => ({ collectionRecordName })),
    setUser: (user) => set(() => ({ user })),
    setFavorites: (favorites) => set(() => ({ favorites })),
    setCollectionCoverImage: (collectionCoverImage) => set({ collectionCoverImage }),
    accountReset: () => set({ ...initialState })
})